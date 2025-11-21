import { NextRequest } from 'next/server';
import crypto from 'crypto'
import { db } from '@/utils/db';
import {
	success,
	fail
} from '@/utils/helpers';
import { responseRow } from '@/types/response.types';
import { fetchUserID } from '@/lib/auth-session';
import { connection } from '@/utils/db';
import {
	createTransaction,
  getTransactions
} from '@/sql/transactions/transactions.sql';

// Create New Transaction
export async function POST(req: NextRequest) {
  try {
    const {
      note,
      amount,
      type,
      time,
      date,
      refAccountsID,
      refCategoriesID,
    } = await req.json();

    const [resultCreate] = await db.query<responseRow[]>(
      createTransaction(),
      {
        actionType: 'create',
        uuid: crypto.randomUUID(),
        userID: await fetchUserID(),
        note,
        amount,
        type,
        time,
        date,
        refAccountsID,
        refCategoriesID,
      }
    );

    const parsedData = JSON.parse(
      resultCreate[1][0].response
    );

    if (parsedData.responseCode !== 200) {
      return fail(
        parsedData.responseCode,
        parsedData.responseMessage
      )
    };

    return success({
      data: parsedData
    });

  } catch (error) {
    return fail(
      500,
      error instanceof Error
        ? error.message
        : 'Failed to Create Transaction'
    );
  } finally {
    connection.release();
  }
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const accountID = url.searchParams.get('accountID');
    const dateStart = url.searchParams.get('dateStart');
    const dateEnd = url.searchParams.get('dateEnd');
    const [rows] = await db.query(
      getTransactions(),
      {
        userID: await fetchUserID(),
        accountID,
        dateStart,
        dateEnd,
      }
    );

    return success({data: rows});

  } catch (error) {
    return fail(
      500,
      error instanceof Error
        ? error.message
        : "Failed to Fetch Transactions"
    )
  } finally {
    connection.release()
  }
};