import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { connection, db } from '@/utils/db';
import { success, fail } from '@/utils/helpers';
import { responseRow } from '@/types/response.types';
import { fetchUserID } from '@/lib/auth/auth-session';
import {
  getAccountByID,
  deleteAccount,
  updateAccount,
  inviteMember,
  removeMemberAccount,
  cancelInvitationAccount,
} from '@/lib/sql/accounts/accounts.sql';
import {
  getMembers,
  getPendingInvitations,
  checkAccountAccess,
} from '@/lib/sql/members/members.sql';
import { RowDataPacket } from 'mysql2';

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
    await db.query<responseRow[]>(inviteMember(), {
      accountID,
      userID,
      invitationID,
      invitedEmail,
      token,
    });
  }
}

async function processCancelledInvitations(
  accountID: string,
  invitationIds: string[]
) {
  if (!invitationIds || invitationIds.length === 0) return;
  const userID = await fetchUserID();
  for (const invitationID of invitationIds) {
    await db.query<responseRow[]>(
      cancelInvitationAccount(),
      { accountID, userID, invitationID }
    );
  }
}

async function processRemovedMembers(
  accountID: string,
  memberIds: string[]
) {
  if (!memberIds || memberIds.length === 0) return;
  const userID = await fetchUserID();
  for (const targetUserID of memberIds) {
    await db.query<responseRow[]>(removeMemberAccount(), {
      accountID,
      userID,
      targetUserID,
    });
  }
}

// Get Specific Account
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userID = await fetchUserID();

    if (!id || id === 'null') {
      throw Error('There is no selected account');
    }

    const [rows] = await db.query<RowDataPacket[]>(
      getAccountByID(),
      {
        userID,
        id,
      }
    );

    const [accessRows] = await db.query<RowDataPacket[]>(
      checkAccountAccess(),
      { accountID: id, userID }
    );
    const isOwner =
      accessRows.length > 0 &&
      accessRows[0].role === 'owner';

    const [members] = await db.query<RowDataPacket[]>(
      getMembers(),
      { accountID: id }
    );

    let invitations: RowDataPacket[] = [];
    if (isOwner) {
      [invitations] = await db.query<RowDataPacket[]>(
        getPendingInvitations(),
        { accountID: id }
      );

      const baseUrl =
        process.env.BETTER_AUTH_URL ||
        'http://localhost:3000';
      invitations = invitations.map(
        (inv: RowDataPacket) => ({
          ...inv,
          inviteLink: `${baseUrl}/pages/invitations/accept?token=${inv.token}`,
        })
      );
    }

    return success({
      data: {
        ...(rows[0] || {}),
        members,
        invitations,
        isOwner,
      },
    });
  } catch (error) {
    return fail(
      500,
      error instanceof Error
        ? error.message
        : 'Failed to Fetch Account'
    );
  } finally {
    connection.release();
  }
}

// Update Account
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const {
      name,
      type,
      description,
      isDropdown,
      emails,
      cancelInvitationIds,
      removeMemberIds,
    } = await req.json();
    const { id } = await params;

    const [resultUpdate] = await db.query<responseRow[]>(
      updateAccount(),
      {
        actionType: 'update',
        id,
        userID: await fetchUserID(),
        name,
        type,
        description,
        isDropdown,
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

    const allEmails: string[] = [];
    if (Array.isArray(emails)) allEmails.push(...emails);

    await processInvitations(id, allEmails);
    await processCancelledInvitations(
      id,
      cancelInvitationIds
    );
    await processRemovedMembers(id, removeMemberIds);

    return success({
      data: parsedData,
    });
  } catch (error) {
    return fail(
      500,
      error instanceof Error
        ? error.message
        : 'Failed to Update Account'
    );
  } finally {
    connection.release();
  }
}

// Delete Account
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [resultDelete] = await db.query<responseRow[]>(
      deleteAccount(),
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
        parsedData.responseMessage,
        parsedData.responseCode
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
        : 'Failed to Delete Account'
    );
  } finally {
    connection.release();
  }
}
