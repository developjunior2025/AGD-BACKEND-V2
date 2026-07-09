export interface AppConfig {
  env: string;
  port: number;
  apiPrefix: string;
  corsOrigin: string;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
  logging: boolean;
}

export interface AuthConfig {
  accessSecret: string;
  accessExpiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
  failedLoginLockThreshold: number;
  accountLockMinutes: number;
  passwordResetTokenMinutes: number;
}

// Env vars are validated by envValidationSchema before this factory runs,
// so required string vars are safe to assert as defined here.
export default () => ({
  app: {
    env: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '3000', 10),
    apiPrefix: process.env.API_PREFIX ?? 'api',
    corsOrigin: process.env.CORS_ORIGIN ?? '*',
  } satisfies AppConfig,
  database: {
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT ?? '3306', 10),
    username: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_DATABASE!,
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
  } satisfies DatabaseConfig,
  auth: {
    accessSecret: process.env.JWT_ACCESS_SECRET!,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    failedLoginLockThreshold: parseInt(
      process.env.AUTH_FAILED_LOGIN_LOCK_THRESHOLD ?? '5',
      10,
    ),
    accountLockMinutes: parseInt(
      process.env.AUTH_ACCOUNT_LOCK_MINUTES ?? '15',
      10,
    ),
    passwordResetTokenMinutes: parseInt(
      process.env.AUTH_PASSWORD_RESET_TOKEN_MINUTES ?? '30',
      10,
    ),
  } satisfies AuthConfig,
});
