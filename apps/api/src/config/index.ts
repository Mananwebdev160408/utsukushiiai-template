import dotenv from "dotenv";
import path from "path";

// Load .env from api root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
// Fallback to .env.example
dotenv.config({ path: path.resolve(__dirname, "../../.env.example") });

export const config = {
  // Server
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  isDev: (process.env.NODE_ENV || "development") === "development",
  isProd: process.env.NODE_ENV === "production",

  // MongoDB
  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/utsukushii",
  },

  // Redis
  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || "dev-jwt-secret",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret",
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || "5h",
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",
  },

  // Storage
  storage: {
    path: path.resolve(process.env.STORAGE_PATH || "./uploads"),
  },

  // ML Worker
  mlWorker: {
    url: process.env.ML_WORKER_URL || "http://localhost:8000",
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
  },
} as const;

export type Config = typeof config;
