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
	createTransaction
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
      accountID,
      categoryID,
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
        accountID,
        categoryID,
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