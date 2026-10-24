import crypto from 'crypto';
import type { RowDataPacket } from 'mysql2';
import { db } from '../../lib/db.ts';
import { success, fail } from '../../utils/response.ts';
import type { responseRow } from '../../lib/types.ts';
import {
  createTransactionQuery,
  getTransactionsQuery,
  getTransactionsCountQuery,
  getTransactionByIDQuery,
  updateTransactionQuery,
  deleteTransactionQuery,
  transferTransactionQuery,
} from './transactions.sql.ts';
import type { Request, Response } from 'express';

// Create New Transaction
export const createTransaction = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      note,
      amount,
      transferFee,
      type,
      time,
      date,
      refAccountsID,
      refCategoriesID,
      refTransferToAccountsID,
    } = req.body;
    const isTransfer = type === 'transfer';

    const [resultCreate] = await db.query<responseRow[]>(
      isTransfer
        ? transferTransactionQuery()
        : createTransactionQuery(),
      {
        actionType: 'create',
        id: crypto.randomUUID(),
        userID: req.userID,
        note,
        amount,
        transferFee,
        type,
        time,
        date,
        refAccountsID,
        refCategoriesID,
        refTransferToAccountsID,
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
        : 'Failed to Create Transaction'
    );
  }
};

// Get Count of Transactions
export const getTransactionsCount = async (
  req: Request,
  res: Response
) => {
  try {
    const accountID = req.query.accountID as
      | string
      | undefined;
    const [rows] = await db.query(
      getTransactionsCountQuery(),
      {
        userID: req.userID,
        accountID,
      }
    );

    return success(res, { data: rows || [] });
  } catch (error) {
    return fail(
      res,
      500,
      error instanceof Error
        ? error.message
        : 'Failed to Fetch Transactions Counts'
    );
  }
};

// Fetch Transactions with Pagination
export const getTransactions = async (
  req: Request,
  res: Response
) => {
  try {
    const accountID = req.query.accountID as
      | string
      | undefined;
    const searchTerm = req.query.searchTerm as
      | string
      | undefined;
    const page = parseInt(
      (req.query.page as string) || '1',
      10
    );
    const limit = 10;
    const offset = (page - 1) * limit;
    const userID = req.userID;

    if (!accountID) {
      throw Error('There is no selected account');
    }

    const [transactionCount] = await db.query<
      RowDataPacket[]
    >(getTransactionsCountQuery(), {
      userID,
      accountID,
      searchTerm,
    });

    const [rows] = await db.query<RowDataPacket[]>(
      getTransactionsQuery(),
      {
        userID,
        accountID,
        limit,
        offset,
        searchTerm,
      }
    );

    const hasMore =
      offset + limit < transactionCount[0].count;

    return success(res, {
      hasMore: hasMore,
      currentPage: page,
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

// Get Specific Transaction
export const getTransactionByID = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      getTransactionByIDQuery(),
      {
        userID: req.userID,
        id,
      }
    );

    return success(res, { data: rows || [] });
  } catch (error) {
    return fail(
      res,
      500,
      error instanceof Error
        ? error.message
        : 'Failed to Fetch Transaction'
    );
  }
};

// Update Transaction
export const updateTransaction = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      note,
      amount,
      transferFee,
      type,
      time,
      date,
      refAccountsID,
      refCategoriesID,
      refTransferToAccountsID,
    } = req.body;
    const { id } = req.params;
    const isTransfer = type === 'transfer';

    const processTransferFee = () => {
      if (type === 'income') return 0;
      return transferFee || 0;
    };

    const [resultUpdate] = await db.query<responseRow[]>(
      isTransfer
        ? transferTransactionQuery()
        : updateTransactionQuery(),
      {
        actionType: 'update',
        id,
        userID: req.userID,
        note,
        amount,
        transferFee: processTransferFee(),
        type,
        time,
        date,
        refAccountsID,
        refCategoriesID,
        refTransferToAccountsID,
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
        : 'Failed to Update Transaction'
    );
  }
};

// Delete Transaction
export const deleteTransaction = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const [resultDelete] = await db.query<responseRow[]>(
      deleteTransactionQuery(),
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
        : 'Failed to Delete Transaction'
    );
  }
};
