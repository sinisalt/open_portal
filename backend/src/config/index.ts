import "dotenv/config";

export const config = {
	// Server
	port: Number.parseInt(process.env.PORT || "4000", 10),
	nodeEnv: process.env.NODE_ENV || "development",

	// JWT
	jwtSecret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
	jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
	refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",

	// Security
	rateLimitWindowMs: Number.parseInt(
		process.env.RATE_LIMIT_WINDOW_MS || "60000",
		10,
	),
	rateLimitMaxRequests: Number.parseInt(
		process.env.RATE_LIMIT_MAX_REQUESTS || "100",
		10,
	),
	authRateLimitMax: Number.parseInt(process.env.AUTH_RATE_LIMIT_MAX || "5", 10),

	// Account Lockout
	maxFailedAttempts: 10,
	lockoutDurationMs: 15 * 60 * 1000, // 15 minutes

	// CORS
	corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",

	// Logging
	logLevel: process.env.LOG_LEVEL || "info",
};
