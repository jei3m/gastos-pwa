import { NextRequest } from 'next/server';
import { connection, db } from '@/utils/db';
import { success, fail } from '@/utils/helpers';
import { responseRow } from '@/types/response.types';
import { fetchUserID } from '@/lib/auth/auth-session';
import {
  deleteTransaction,
  getTransactionByID,
  transferTransaction,
  updateTransaction,
} from '@/lib/sql/transactions/transactions.sql';

// Get Specific Transaction
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [rows] = await db.query(getTransactionByID(), {
      userID: await fetchUserID(),
      id,
    });

    return success({ data: rows });
  } catch (error) {
    return fail(
      500,
      error instanceof Error
        ? error.message
        : 'Failed to Fetch Transaction'
    );
  } finally {
    connection.release();
  }
}

// Update Transaction
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    } = await req.json();
    const { id } = await params;
    const isTransfer = type === 'transfer';

    const processTransferFee = () => {
      if (type === 'income') return 0;
      return transferFee || 0;
    };

    const [resultUpdate] = await db.query<responseRow[]>(
      isTransfer
        ? transferTransaction()
        : updateTransaction(),
      {
        actionType: 'update',
        id,
        userID: await fetchUserID(),
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
        parsedData.responseCode,
        parsedData.responseMessage
      );
    }

    return success({
      data: parsedData,
    });
  } catch (error) {
    return fail(
      500,
      error instanceof Error
        ? error.message
        : 'Failed to Update Transaction'
    );
  } finally {
    connection.release();
  }
}

// Delete Transaction
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [resultDelete] = await db.query<responseRow[]>(
      deleteTransaction(),
      {
        actionType: 'delete',
        id,
        userID: await fetchUserID(),
      }
    );

    const parsedData = JSON.parse(
      resultDelete[1][0].response
    );

    if (parsedData.responseCode !== 200) {
      return fail(
        parsedData.responseCode,
        parsedData.responseMessage
      );
    }

    return success({
      data: parsedData,
    });
  } catch (error) {
    return fail(
      500,
      error instanceof Error
        ? error.message
        : 'Failed to Delete Transaction'
    );
  } finally {
    connection.release();
  }
}
