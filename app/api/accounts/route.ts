import { NextRequest } from 'next/server';
import crypto from 'crypto'
import { db } from '@/utils/db';
import { 
  createAccounts, 
  getAccounts
} from '@/sql/accounts/accounts.sql';
import { 
  success, 
  fail 
} from '@/utils/helpers';
import { responseRow } from '@/types/response.types';
import { fetchUserID } from '@/utils/session';

// Create New Account
export async function POST(req: NextRequest) {
  try {
    const { 
      name, 
      type, 
      description 
    } = await req.json();
    
    const [resultCreate] = await db.query<responseRow[]>(
      createAccounts(), 
      { 
        actionType: 'create',
        uuid: crypto.randomUUID(),
        userID: await fetchUserID(),
        name,
        type,
        description 
      }
    );

    return success({ 
      response: JSON.parse(resultCreate[1][0].response)
    });

  } catch (error) {
    return fail(
      error instanceof Error 
        ? error.message 
        : 'Failed to Create Tests'
    );
  }
};

// Get All Accounts of the user
export async function GET() {
  try {
    const [rows] = await db.query(
      getAccounts(),
      {
        userID: await fetchUserID()
      }
    );

    return success({data: rows});
    
  } catch (err) {
    return fail(
      err instanceof Error ? err.message : "Failed to Fetch Accounts"
    );
  }
};