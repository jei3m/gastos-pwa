import type { Response } from 'express';

export function success(
  res: Response,
  // eslint-disable-next-line
  data: Record<string, any>,
  status = 200
) {
  res.status(status).json({
    success: true,
    ...data,
  });
}

export function fail(
  res: Response,
  status: number,
  message: string
) {
  res.status(status).json({
    success: false,
    message,
  });
}
