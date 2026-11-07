import "server-only";
import { Redis } from "@upstash/redis";

// Redis is optional during local development; callers must fall back to Postgres.
export function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}
