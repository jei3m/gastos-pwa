import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './db';

const trackers: Record<
  string,
  {
    count: number;
    expiresAt: number;
  }
> = {};

export function rateLimitByKey(
  key: string,
  max: number = 10,
  windowSeconds: number = 60
) {
  const windowMs = windowSeconds * 1000;

  const tracker = trackers[key] || {
    count: 0,
    expiresAt: 0,
  };

  if (!trackers[key]) {
    trackers[key] = tracker;
  }

  if (tracker.expiresAt < Date.now()) {
    tracker.count = 0;
    tracker.expiresAt = Date.now() + windowMs;
  }

  tracker.count++;

  if (tracker.count > max) {
    throw Error('Rate limit exceeded');
  }

  // Cleanup expired trackers
  () => {
    const now = Date.now();
    for (const key in trackers) {
      if (trackers[key].expiresAt < now) {
        delete trackers[key];
      }
    }
  };
}

export const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(80, '10 s'),
  analytics: true,
  prefix: '@ratelimit',
});
