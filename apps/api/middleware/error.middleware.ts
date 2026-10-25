import type {
  NextFunction,
  Request,
  Response,
} from 'express';
import { fail } from '../utils/response.ts';

export function notFound(_req: Request, res: Response) {
  return fail(res, 404, 'Route not found');
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  return fail(
    res,
    500,
    error instanceof Error
      ? error.message
      : 'Internal Server Error'
  );
}
