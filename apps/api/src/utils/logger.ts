import winston from "winston";
import { config } from "../config";

const { combine, timestamp, printf, colorize, json } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: "HH:mm:ss" }),
  printf(({ level, message, timestamp, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp} ${level}: ${message}${metaStr}`;
  }),
);

const prodFormat = combine(timestamp(), json());

export const logger = winston.createLogger({
  level: config.isDev ? "debug" : "info",
  format: config.isDev ? devFormat : prodFormat,
  defaultMeta: { service: "utsukushii-api" },
  transports: [new winston.transports.Console()],
});
