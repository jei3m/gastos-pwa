import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { db, redis } from '@/utils/db';

export const auth = betterAuth({
  database: db,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 10 * 60, // 10mins
      strategy: 'compact',
    },
    refreshCache: true,
  },
  plugins: [nextCookies()],
  socialProviders: {
    google: {
      prompt: 'select_account',
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env
        .GOOGLE_CLIENT_SECRET as string,
    },
  },
  rateLimit: {
    enabled: true,
    window: 10,
    max: 30,
    storage: 'memory',
  },
  advanced: {
    ipAddress: {
      ipAddressHeaders: ['x-client-ip', 'x-forwarded-for'],
      disableIpTracking: false,
    },
  },
  secondaryStorage: {
    get: async (key) => {
      const response = await redis.get(key);
      if (!response) {
        return null;
      }
      return JSON.stringify(response);
    },
    set: async (key, value, ttl) => {
      if (ttl) await redis.set(key, value, { ex: ttl });
      else await redis.set(key, value);
    },
    delete: async (key) => {
      await redis.del(key);
    },
  },
});
