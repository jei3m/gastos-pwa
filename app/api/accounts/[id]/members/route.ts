import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { db } from '@/utils/db';
import { success, fail } from '@/utils/helpers';
import { responseRow } from '@/types/response.types';
import { fetchUserID } from '@/lib/auth/auth-session';
import { connection } from '@/utils/db';
import { RowDataPacket } from 'mysql2';
import {
  inviteMember,
  getMembers,
  getPendingInvitations,
  checkAccountAccess,
} from '@/lib/sql/members/members.sql';

// List members and pending invitations
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userID = await fetchUserID();

    const [accessRows] = await db.query<RowDataPacket[]>(
      checkAccountAccess(),
      { accountID: id, userID }
    );
    if (accessRows.length === 0) {
      return fail(
        403,
        'You do not have access to this account'
      );
    }
    const isOwner = accessRows[0].role === 'owner';

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
      data: { members, invitations, isOwner },
    });
  } catch (error) {
    return fail(
      500,
      error instanceof Error
        ? error.message
        : 'Failed to fetch members'
    );
  } finally {
    connection.release();
  }
}

// Invite a user by email
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { email } = await req.json();
    const userID = await fetchUserID();

    if (!email || typeof email !== 'string') {
      return fail(400, 'Email is required');
    }

    const token = crypto.randomUUID();
    const invitationID = crypto.randomUUID();

    const [result] = await db.query<responseRow[]>(
      inviteMember(),
      {
        accountID: id,
        userID,
        invitationID,
        invitedEmail: email,
        token,
      }
    );

    const parsedData = JSON.parse(result[1][0].response);

    if (parsedData.responseCode !== 200) {
      return fail(
        parsedData.responseCode,
        parsedData.responseMessage
      );
    }

    const baseUrl =
      process.env.BETTER_AUTH_URL ||
      `${req.nextUrl?.protocol || 'http'}://${req.nextUrl?.host || 'localhost:3000'}`;
    const inviteLink = `${baseUrl}/pages/invitations/accept?token=${token}`;

    return success({
      data: {
        id: invitationID,
        token,
        inviteLink,
        invitedEmail: email,
        expiresAt: parsedData.expiresAt,
      },
    });
  } catch (error) {
    return fail(
      500,
      error instanceof Error
        ? error.message
        : 'Failed to invite member'
    );
  } finally {
    connection.release();
  }
}
