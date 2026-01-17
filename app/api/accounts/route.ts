import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { db } from '@/utils/db';
import {
  createAccounts,
  getAccounts,
} from '@/lib/sql/accounts/accounts.sql';
import { success, fail } from '@/utils/helpers';
import { responseRow } from '@/types/response.types';
import { fetchUserID } from '@/lib/auth/auth-session';
import { connection } from '@/utils/db';

// Create New Account
export async function POST(req: NextRequest) {
  try {
    const { name, type, description } = await req.json();

    const [resultCreate] = await db.query<responseRow[]>(
      createAccounts(),
      {
        actionType: 'create',
        id: crypto.randomUUID(),
        userID: await fetchUserID(),
        name,
        type,
        description,
      }
    );

    const parsedData = JSON.parse(
      resultCreate[1][0].response
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
        : 'Failed to Create Tests'
    );
  } finally {
    connection.release();
  }
}

// Get All Accounts of the user
export async function GET() {
  try {
    const [rows] = await db.query(getAccounts(), {
      userID: await fetchUserID(),
    });

    return success({ data: rows });
  } catch (error) {
    return fail(
      500,
      error instanceof Error
        ? error.message
        : 'Failed to Fetch Accounts'
    );
  } finally {
    connection.release();
  }
}
