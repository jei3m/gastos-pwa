import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { db } from '@/utils/db';
import {
  createAccounts,
  getAccounts,
  inviteMember,
} from '@/lib/sql/accounts/accounts.sql';
import { success, fail } from '@/utils/helpers';
import { responseRow } from '@/types/response.types';
import { fetchUserID } from '@/lib/auth/auth-session';
import { connection } from '@/utils/db';

async function processInvitations(
  accountID: string,
  emails: string[]
) {
  if (!emails || emails.length === 0) return;

  const userID = await fetchUserID();
  const uniqueEmails = [...new Set(emails)];

  for (const invitedEmail of uniqueEmails) {
    const token = crypto.randomUUID();
    const invitationID = crypto.randomUUID();
    const [] = await db.query<responseRow[]>(
      inviteMember(),
      {
        accountID,
        userID,
        invitationID,
        invitedEmail,
        token,
      }
    );
  }
}

// Create New Account
export async function POST(req: NextRequest) {
  try {
    const { name, type, description, isDropdown, emails } =
      await req.json();

    const accountID = crypto.randomUUID();
    const [resultCreate] = await db.query<responseRow[]>(
      createAccounts(),
      {
        actionType: 'create',
        id: accountID,
        userID: await fetchUserID(),
        name,
        type,
        description,
        isDropdown,
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

    const allEmails: string[] = [];
    if (Array.isArray(emails)) allEmails.push(...emails);

    await processInvitations(accountID, allEmails);

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

    return success({ data: rows || [] });
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
