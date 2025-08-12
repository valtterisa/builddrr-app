import { Duration, Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";
import { NextFetchEvent, NextRequest } from "next/server";

/**
 * Rate limit requests to the API
 * @param identifier - Identifier to rate limit -> user id
 * @returns - The result of the rate limit
 */
export async function rateLimit(
  limit: number,
  period: Duration,
  userId: string
) {
  const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(limit, period),
    analytics: true,
    prefix: "@upstash/ratelimit",
  });

  const { success, pending } = await ratelimit.limit(userId);

  return success;
}
