import { Redis } from "@upstash/redis";
import { env } from "../env";

type Serializable = string | number | boolean | Record<string, unknown> | null;

const memory = new Map<string, Serializable>();

const redis =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

export async function cacheGet<T = Serializable>(key: string): Promise<T | null> {
  if (redis) {
    return (await redis.get<T | null>(key)) ?? null;
  }
  return (memory.get(key) as T | undefined) ?? null;
}

export async function cacheSet(key: string, value: Serializable, ttlSeconds = 60) {
  if (redis) {
    await redis.set(key, value, { ex: ttlSeconds });
    return;
  }
  memory.set(key, value);
  setTimeout(() => memory.delete(key), ttlSeconds * 1000).unref?.();
}

export const cacheClient = { redis, memory };
