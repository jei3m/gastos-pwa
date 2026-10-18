import type {
  NextFunction,
  Request,
  Response,
} from 'express';
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '../lib/redis.ts';
import { isProduction } from '../lib/db.ts';
import { fail } from '../utils/response.ts';

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(80, '10 s'),
  analytics: true,
  prefix: '@ratelimit',
});

export async function rateLimit(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!isProduction || !req.userID) {
    return next();
  }

  try {
    const { success } = await ratelimit.limit(req.userID);

    if (!success) {
      return fail(
        res,
        429,
        'Too many requests. Please try again later.'
      );
    }

    next();
  } catch (error) {
    return fail(
      res,
      500,
      error instanceof Error
        ? error.message
        : 'Rate limit failed'
    );
  }
}
