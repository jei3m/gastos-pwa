import { db } from '../../lib/db';
import { getInsightsQuery } from './insights.sql';
import type { Request, Response } from 'express';
import { fail, success } from '../../utils/response.ts';

export const getInsights = async (
  req: Request,
  res: Response
) => {
  try {
    // Declare needed filters
    const userID = req.userID;
    const accountID = req.query.accountID;
    const dateStart =
      (req.query.dateStart as string) || null;
    const dateEnd = (req.query.dateEnd as string) || null;
    const type =
      req.query.type === 'income'
        ? 'Income'
        : req.query.type === 'expense'
          ? 'Expense'
          : null;

    if (!accountID) {
      throw Error('There is no selected account');
    }

    // DB Query
    const [rows] = await db.query(getInsightsQuery(), {
      userID,
      accountID,
      type,
      dateStart,
      dateEnd,
    });

    return success(res, {
      data: rows || [],
    });
  } catch (error) {
    return fail(
      res,
      500,
      error instanceof Error
        ? error.message
        : 'Failed to Get Insights'
    );
  }
};
