import type { RowDataPacket } from 'mysql2';
import { db } from '../lib/db.ts';
import { success, fail } from '../utils/response.ts';
import { getExportDataQuery } from '../lib/sql/users.sql.ts';
import type { Request, Response } from 'express';

// Export User Data
export const exportData = async (
  req: Request,
  res: Response
) => {
  try {
    const userID = req.userID;
    const [rows] = await db.query<RowDataPacket[]>(
      getExportDataQuery(),
      { userID }
    );

    const exportData =
      typeof rows[0]?.export === 'string'
        ? JSON.parse(rows[0].export)
        : rows[0]?.export;

    return success(res, {
      data: {
        accounts: exportData?.accounts ?? [],
        categories: exportData?.categories ?? [],
        transactions: exportData?.transactions ?? [],
      },
    });
  } catch (error) {
    return fail(
      res,
      500,
      error instanceof Error
        ? error.message
        : 'Failed to Export Data'
    );
  }
};
