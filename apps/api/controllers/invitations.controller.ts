import type { RowDataPacket } from 'mysql2';
import { db } from '../lib/db.ts';
import { success, fail } from '../utils/response.ts';
import type { responseRow } from '../lib/types.ts';
import {
  getInvitationByTokenQuery,
  respondToInvitationQuery,
} from '../lib/sql/members.sql.ts';
import type { Request, Response } from 'express';

// Fetch invitation details
export const getInvitation = async (
  req: Request,
  res: Response
) => {
  try {
    const token = req.query.token as string | undefined;

    if (!token) {
      return fail(res, 400, 'Invitation token is required');
    }

    const [inviteRows] = await db.query<RowDataPacket[]>(
      getInvitationByTokenQuery(),
      { token }
    );

    if (inviteRows.length === 0) {
      return fail(res, 404, 'Invitation not found');
    }

    const invite = inviteRows[0];

    if (invite.status !== 'pending') {
      return fail(
        res,
        400,
        `This invitation has already been ${invite.status}`
      );
    }

    if (new Date(invite.expiresAt) < new Date()) {
      return fail(res, 400, 'This invitation has expired');
    }

    return success(res, { data: invite });
  } catch (error) {
    return fail(
      res,
      500,
      error instanceof Error
        ? error.message
        : 'Failed to fetch invitation'
    );
  }
};

// Accept or decline an invitation
export const respondToInvitation = async (
  req: Request,
  res: Response
) => {
  try {
    const { token, action } = req.body;
    const userID = req.userID;

    if (
      !token ||
      !action ||
      !['accept', 'decline'].includes(action)
    ) {
      return fail(
        res,
        400,
        'Token and action (accept/decline) are required'
      );
    }

    const [result] = await db.query<responseRow[]>(
      respondToInvitationQuery(),
      {
        token,
        userID,
        invitationAction: action,
      }
    );

    const parsedData = JSON.parse(result[1][0].response);

    if (parsedData.responseCode !== 200) {
      return fail(
        res,
        parsedData.responseCode,
        parsedData.responseMessage
      );
    }

    return success(res, {
      data: {
        responseMessage: parsedData.responseMessage,
        accountID: parsedData.accountID,
      },
    });
  } catch (error) {
    return fail(
      res,
      500,
      error instanceof Error
        ? error.message
        : 'Failed to process invitation'
    );
  }
};
