import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { db } from './db.ts';
import { redis } from './redis.ts';
import { deleteUserQuery } from '../modules/users/users.sql.ts';

export const auth = betterAuth({
  database: db,
  user: {
    deleteUser: {
      enabled: true,
      beforeDelete: async (user) => {
        try {
          await db.query(deleteUserQuery(), {
            userID: user.id,
          });
        } catch (error) {
          if (error instanceof Error)
            throw Error(error.message);
        }
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  session: {
    cookieCache: {
      enabled: false,
    },
    expiresIn: 60 * 60 * 24 * 30, // 30 days
  },
  baseURL: process.env.BETTER_AUTH_URL,
  basePath: 'api/auth',
  trustedOrigins: [process.env.ORIGIN_URL!],
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
    defaultCookieAttributes: {
      sameSite:
        process.env.NODE_ENV === 'production'
          ? 'none'
          : 'lax',
      secure: process.env.NODE_ENV === 'production',
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
