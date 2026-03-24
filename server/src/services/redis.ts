import { Redis } from 'ioredis';
import { config } from '../config';
import { logger } from '../utils/logger';

let redis: Redis | null = null;

export function getRedis(): any {
  return null;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  return null;
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
  // no-op
}

export async function cacheDel(key: string): Promise<void> {
  // no-op
}
