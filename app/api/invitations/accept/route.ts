import { NextRequest } from 'next/server';
import { db } from '@/utils/db';
import { success, fail } from '@/utils/helpers';
import { responseRow } from '@/types/response.types';
import { fetchUserID } from '@/lib/auth/auth-session';
import { connection } from '@/utils/db';
import { RowDataPacket } from 'mysql2';
import {
  getInvitationByToken,
  respondToInvitation,
} from '@/lib/sql/members/members.sql';

// Fetch invitation details
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return fail(400, 'Invitation token is required');
    }

    const [inviteRows] = await db.query<RowDataPacket[]>(
      getInvitationByToken(),
      { token }
    );

    if (inviteRows.length === 0) {
      return fail(404, 'Invitation not found');
    }

    const invite = inviteRows[0];

    if (invite.status !== 'pending') {
      return fail(
        400,
        `This invitation has already been ${invite.status}`
      );
    }

    if (new Date(invite.expiresAt) < new Date()) {
      return fail(400, 'This invitation has expired');
    }

    return success({ data: invite });
  } catch (error) {
    return fail(
      500,
      error instanceof Error
        ? error.message
        : 'Failed to fetch invitation'
    );
  } finally {
    connection.release();
  }
}

// Accept or decline an invitation
export async function POST(req: NextRequest) {
  try {
    const { token, action } = await req.json();
    const userID = await fetchUserID();

    if (
      !token ||
      !action ||
      !['accept', 'decline'].includes(action)
    ) {
      return fail(
        400,
        'Token and action (accept/decline) are required'
      );
    }

    const [result] = await db.query<responseRow[]>(
      respondToInvitation(),
      {
        token,
        userID,
        invitationAction: action,
      }
    );

    const parsedData = JSON.parse(result[1][0].response);

    if (parsedData.responseCode !== 200) {
      return fail(
        parsedData.responseCode,
        parsedData.responseMessage
      );
    }

    return success({
      data: {
        responseMessage: parsedData.responseMessage,
        accountID: parsedData.accountID,
      },
    });
  } catch (error) {
    return fail(
      500,
      error instanceof Error
        ? error.message
        : 'Failed to process invitation'
    );
  } finally {
    connection.release();
  }
}
