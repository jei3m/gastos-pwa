import type {
  NextFunction,
  Request,
  Response,
} from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../lib/auth.ts';
import { fail } from '../utils/response.ts';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userID?: string;
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return fail(res, 401, 'Unauthorized');
    }

    req.userID = session.user.id;
    next();
  } catch (error) {
    return fail(
      res,
      500,
      error instanceof Error
        ? error.message
        : 'Authentication failed'
    );
  }
}
