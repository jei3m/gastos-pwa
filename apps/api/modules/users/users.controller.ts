import { db } from '../../lib/db.ts';
import { success, fail } from '../../utils/response.ts';
import type { Request, Response } from 'express';
import { getUserByEmailQuery } from './users.sql.ts';

// Get Specific User by Email
export const getUserByEmail = async (
  req: Request,
  res: Response
) => {
  try {
    const { email } = req.params;

    const [rows] = await db.query(getUserByEmailQuery(), {
      email,
    });

    return success(res, { data: rows || [] });
  } catch (error) {
    return fail(
      res,
      500,
      error instanceof Error
        ? error.message
        : 'Failed to Fetch User'
    );
  }
};
