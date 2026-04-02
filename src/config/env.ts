import { config } from "dotenv";

config({ path: ".env.local" });

const requiredEnvVars = [
  "PORT",
  "DATABASE_URL",
  "JWT_SECRET",
] as const;

type EnvVar = (typeof requiredEnvVars)[number];

function getEnvVar(name: EnvVar): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  PORT: Number(getEnvVar("PORT")),
  DATABASE_URL: getEnvVar("DATABASE_URL"),
  JWT_SECRET: getEnvVar("JWT_SECRET"),
} as const;
