/**
 * User Model
 */
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  avatarUrl?: string;
  tenantId: string;
  isActive: boolean;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Refresh Token Model
 */
export interface RefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

/**
 * Audit Log Entry
 */
export interface AuditLogEntry {
  id: string;
  userId?: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
  createdAt: Date;
}

/**
 * In-Memory Database
 */
class InMemoryDatabase {
  private users: Map<string, User> = new Map();
  private refreshTokens: Map<string, RefreshToken> = new Map();
  private auditLogs: AuditLogEntry[] = [];

  // Users
  getUsers(): User[] {
    return Array.from(this.users.values());
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.getUsers().find((user) => user.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: User): User {
    this.users.set(user.id, user);
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.users.get(id);
    if (!user) {
      return undefined;
    }
    const updated = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }

  // Refresh Tokens
  getRefreshTokens(): RefreshToken[] {
    return Array.from(this.refreshTokens.values());
  }

  getRefreshToken(token: string): RefreshToken | undefined {
    return this.refreshTokens.get(token);
  }

  createRefreshToken(refreshToken: RefreshToken): RefreshToken {
    this.refreshTokens.set(refreshToken.token, refreshToken);
    return refreshToken;
  }

  deleteRefreshToken(token: string): boolean {
    return this.refreshTokens.delete(token);
  }

  deleteRefreshTokensByUserId(userId: string): void {
    for (const [token, refreshToken] of this.refreshTokens.entries()) {
      if (refreshToken.userId === userId) {
        this.refreshTokens.delete(token);
      }
    }
  }

  // Audit Logs
  getAuditLogs(): AuditLogEntry[] {
    return this.auditLogs;
  }

  addAuditLog(entry: AuditLogEntry): void {
    this.auditLogs.push(entry);
  }
}

// Singleton instance
export const db = new InMemoryDatabase();
