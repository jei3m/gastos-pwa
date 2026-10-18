import crypto from 'crypto';
import type { RowDataPacket } from 'mysql2';
import { db } from '../lib/db.ts';
import { success, fail } from '../utils/response.ts';
import type { responseRow } from '../lib/types.ts';
import {
  createCategoryQuery,
  getCategoriesQuery,
  getCategoriesListQuery,
  getCategoriesOptionsQuery,
  getCategoryByIDQuery,
  updateCategoryQuery,
  deleteCategoryQuery,
} from '../lib/sql/categories.sql.ts';
import {
  getTransactionsByCategoryQuery,
  getTransactionsByCategoryCountQuery,
} from '../lib/sql/transactions.sql.ts';
import type { Request, Response } from 'express';

// Create Category
export const createCategory = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, type, icon, description } = req.body;

    const [resultCreate] = await db.query<responseRow[]>(
      createCategoryQuery(),
      {
        actionType: 'create',
        id: crypto.randomUUID(),
        userID: req.userID,
        name,
        type,
        icon,
        description,
      }
    );

    const parsedData = JSON.parse(
      resultCreate[1][0].response
    );

    if (parsedData.responseCode !== 200) {
      return fail(
        res,
        parsedData.responseCode,
        parsedData.responseMessage
      );
    }

    return success(res, {
      data: parsedData,
    });
  } catch (error) {
    return fail(
      res,
      500,
      error instanceof Error
        ? error.message
        : 'Failed to Create Category'
    );
  }
};

// Get Categories (breakdown / list / options)
export const getCategories = async (
  req: Request,
  res: Response
) => {
  try {
    const filter = req.query.filter as string | undefined;
    const accountID = req.query.accountID as
      | string
      | undefined;
    const dateStart = req.query.dateStart as
      | string
      | undefined;
    const dateEnd = req.query.dateEnd as string | undefined;
    const type = req.query.type as string | undefined;

    if (
      !accountID &&
      filter !== 'list' &&
      filter !== 'options'
    ) {
      throw Error('There is no selected account');
    }

    const [selectQuery] = await db.query(
      filter === 'list'
        ? getCategoriesListQuery()
        : filter === 'options'
          ? getCategoriesOptionsQuery()
          : getCategoriesQuery(),
      {
        userID: req.userID,
        accountID,
        type,
        dateStart,
        dateEnd,
      }
    );

    return success(res, {
      data: selectQuery || [],
    });
  } catch (error) {
    return fail(
      res,
      500,
      error instanceof Error
        ? error.message
        : 'Failed to Fetch Categories'
    );
  }
};

// Fetch Transactions By Category with Pagination
export const getCategoryTransactions = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const accountID = req.query.accountID as
      | string
      | undefined;
    const page = parseInt(
      (req.query.page as string) || '1',
      10
    );
    const dateStart =
      (req.query.dateStart as string) || null;
    const dateEnd = (req.query.dateEnd as string) || null;
    const limit = 10;
    const offset = (page - 1) * limit;
    const userID = req.userID;

    if (!accountID) {
      throw Error('There is no selected account');
    }

    const [categoryDetails] = await db.query<
      RowDataPacket[]
    >(getCategoryByIDQuery(), {
      userID,
      id,
      accountID,
      dateStart,
      dateEnd,
    });

    const [transactionCount] = await db.query<
      RowDataPacket[]
    >(getTransactionsByCategoryCountQuery(), {
      userID,
      accountID,
      categoryID: id,
      dateStart,
      dateEnd,
    });

    const [rows] = await db.query<RowDataPacket[]>(
      getTransactionsByCategoryQuery(),
      {
        userID,
        accountID,
        categoryID: id,
        limit,
        offset,
        dateStart,
        dateEnd,
      }
    );

    const hasMore =
      offset + limit < transactionCount[0].count;

    return success(res, {
      hasMore: hasMore,
      currentPage: page,
      categoryDetails: categoryDetails,
      data: rows || [],
    });
  } catch (error) {
    return fail(
      res,
      500,
      error instanceof Error
        ? error.message
        : 'Failed to Fetch Transactions'
    );
  }
};

// Get Specific Category
export const getCategoryByID = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(getCategoryByIDQuery(), {
      userID: req.userID,
      id,
    });

    return success(res, { data: rows || [] });
  } catch (error) {
    return fail(
      res,
      500,
      error instanceof Error
        ? error.message
        : 'Failed to Fetch Category'
    );
  }
};

// Update Category
export const updateCategory = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, type, icon, description } = req.body;
    const { id } = req.params;

    const [resultUpdate] = await db.query<responseRow[]>(
      updateCategoryQuery(),
      {
        actionType: 'update',
        id,
        userID: req.userID,
        name,
        type,
        description,
        icon,
      }
    );

    const parsedData = JSON.parse(
      resultUpdate[1][0].response
    );

    if (parsedData.responseCode !== 200) {
      return fail(
        res,
        parsedData.responseCode,
        parsedData.responseMessage
      );
    }

    return success(res, {
      data: parsedData,
    });
  } catch (error) {
    return fail(
      res,
      500,
      error instanceof Error
        ? error.message
        : 'Failed to Update Category'
    );
  }
};

// Delete Category
export const deleteCategory = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const [resultDelete] = await db.query<responseRow[]>(
      deleteCategoryQuery(),
      {
        actionType: 'delete',
        id,
        userID: req.userID,
      }
    );

    const parsedData = JSON.parse(
      resultDelete[1][0].response
    );

    if (parsedData.responseCode !== 200) {
      return fail(
        res,
        parsedData.responseCode,
        parsedData.responseMessage
      );
    }

    return success(res, {
      data: parsedData,
    });
  } catch (error) {
    return fail(
      res,
      500,
      error instanceof Error
        ? error.message
        : 'Failed to Delete Category'
    );
  }
};
