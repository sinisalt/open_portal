import { randomBytes, randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import type { AuditLogEntry, RefreshToken, User } from '../models/database.js';
import { db } from '../models/database.js';

/**
 * JWT Payload
 */
export interface JWTPayload {
  sub: string;
  email: string;
  roles: string[];
  tenantId: string;
  iat: number;
  exp: number;
}

/**
 * Login Result
 */
export interface LoginResult {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    name: string;
    roles: string[];
    tenantId: string;
  };
}

/**
 * Refresh Result
 */
export interface RefreshResult {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Authentication Service
 */
export class AuthService {
  /**
   * Authenticate user with username/password
   */
  async login(
    email: string,
    password: string,
    rememberMe = false,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<LoginResult> {
    const user = db.getUserByEmail(email);

    // Check if user exists
    if (!user) {
      this.logAudit({
        action: 'LOGIN_FAILED',
        errorMessage: 'User not found',
        success: false,
        ipAddress,
        userAgent,
      });
      throw new Error('Invalid credentials');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      this.logAudit({
        userId: user.id,
        action: 'LOGIN_FAILED',
        errorMessage: 'Account locked',
        success: false,
        ipAddress,
        userAgent,
      });
      throw new Error('Account is locked. Please try again later.');
    }

    // Check if account is active
    if (!user.isActive) {
      this.logAudit({
        userId: user.id,
        action: 'LOGIN_FAILED',
        errorMessage: 'Account inactive',
        success: false,
        ipAddress,
        userAgent,
      });
      throw new Error('Account is inactive');
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      // Increment failed login attempts
      const updatedUser = db.updateUser(user.id, {
        failedLoginAttempts: user.failedLoginAttempts + 1,
        lockedUntil:
          user.failedLoginAttempts + 1 >= config.maxFailedAttempts
            ? new Date(Date.now() + config.lockoutDurationMs)
            : undefined,
      });

      this.logAudit({
        userId: user.id,
        action: 'LOGIN_FAILED',
        errorMessage: 'Invalid password',
        success: false,
        ipAddress,
        userAgent,
      });

      if (updatedUser?.lockedUntil) {
        throw new Error('Too many failed attempts. Account has been locked.');
      }

      throw new Error('Invalid credentials');
    }

    // Reset failed login attempts on successful login
    const updatedUser = db.updateUser(user.id, {
      failedLoginAttempts: 0,
      lockedUntil: undefined,
    });

    if (!updatedUser) {
      throw new Error('Failed to update user');
    }

    // Generate tokens
    const token = this.generateToken(updatedUser);
    const refreshToken = this.generateRefreshToken(updatedUser.id, rememberMe);

    this.logAudit({
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      success: true,
      ipAddress,
      userAgent,
    });

    return {
      token,
      refreshToken: refreshToken.token,
      expiresIn: this.getTokenExpiresInSeconds(),
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        roles: updatedUser.roles,
        tenantId: updatedUser.tenantId,
      },
    };
  }

  /**
   * Logout user and invalidate refresh token
   */
  async logout(refreshToken: string, userId?: string): Promise<boolean> {
    const deleted = db.deleteRefreshToken(refreshToken);

    if (userId) {
      this.logAudit({
        userId,
        action: 'LOGOUT',
        success: deleted,
      });
    }

    return deleted;
  }

  /**
   * Refresh access token
   */
  async refresh(refreshTokenString: string): Promise<RefreshResult> {
    const refreshToken = db.getRefreshToken(refreshTokenString);

    if (!refreshToken) {
      this.logAudit({
        action: 'REFRESH_FAILED',
        errorMessage: 'Refresh token not found',
        success: false,
      });
      throw new Error('Invalid refresh token');
    }

    if (refreshToken.expiresAt < new Date()) {
      db.deleteRefreshToken(refreshTokenString);
      this.logAudit({
        userId: refreshToken.userId,
        action: 'REFRESH_FAILED',
        errorMessage: 'Refresh token expired',
        success: false,
      });
      throw new Error('Refresh token expired');
    }

    const user = db.getUserById(refreshToken.userId);
    if (!user) {
      this.logAudit({
        userId: refreshToken.userId,
        action: 'REFRESH_FAILED',
        errorMessage: 'User not found',
        success: false,
      });
      throw new Error('User not found');
    }

    if (!user.isActive) {
      this.logAudit({
        userId: user.id,
        action: 'REFRESH_FAILED',
        errorMessage: 'Account inactive',
        success: false,
      });
      throw new Error('Account is inactive');
    }

    // Delete old refresh token (token rotation)
    db.deleteRefreshToken(refreshTokenString);

    // Generate new tokens
    const token = this.generateToken(user);
    const newRefreshToken = this.generateRefreshToken(user.id, true);

    this.logAudit({
      userId: user.id,
      action: 'REFRESH_SUCCESS',
      success: true,
    });

    return {
      token,
      refreshToken: newRefreshToken.token,
      expiresIn: this.getTokenExpiresInSeconds(),
    };
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: User): string {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      tenantId: user.tenantId,
    };

    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });
  }

  /**
   * Generate refresh token
   */
  private generateRefreshToken(userId: string, rememberMe: boolean): RefreshToken {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();

    // If remember me, use longer expiration
    if (rememberMe) {
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
    } else {
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    }

    const refreshToken: RefreshToken = {
      id: randomUUID(),
      userId,
      token,
      expiresAt,
      createdAt: new Date(),
    };

    db.createRefreshToken(refreshToken);
    return refreshToken;
  }

  /**
   * Get token expiration in seconds
   */
  private getTokenExpiresInSeconds(): number {
    const expiresIn = config.jwtExpiresIn;
    if (expiresIn.endsWith('h')) {
      return Number.parseInt(expiresIn.slice(0, -1), 10) * 3600;
    }
    if (expiresIn.endsWith('m')) {
      return Number.parseInt(expiresIn.slice(0, -1), 10) * 60;
    }
    if (expiresIn.endsWith('s')) {
      return Number.parseInt(expiresIn.slice(0, -1), 10);
    }
    if (expiresIn.endsWith('d')) {
      return Number.parseInt(expiresIn.slice(0, -1), 10) * 86400;
    }
    return 3600; // default 1 hour
  }

  /**
   * Log audit event
   */
  private logAudit(entry: Omit<AuditLogEntry, 'id' | 'createdAt'>): void {
    const auditEntry: AuditLogEntry = {
      id: randomUUID(),
      ...entry,
      createdAt: new Date(),
    };
    db.addAuditLog(auditEntry);
  }
}

// Singleton instance
export const authService = new AuthService();
