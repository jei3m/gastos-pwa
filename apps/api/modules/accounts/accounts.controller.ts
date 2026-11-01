import { db } from '../../lib/db.ts';
import {
  createAccountQuery,
  deleteAccountQuery,
  getAccountByIDQuery,
  getAccountsQuery,
  getMembersQuery,
  getPendingInvitationsQuery,
  updateAccountQuery,
} from './accounts.sql.ts';
import type { responseRow } from '../../lib/types.ts';
import type { Request, Response } from 'express';
import { fail, success } from '../../utils/response.ts';
import type { RowDataPacket } from 'mysql2';

// Create New Account
export const createAccount = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, type, description, isDropdown, emails } =
      req.body;

    const accountID = crypto.randomUUID();
    const [resultCreate] = await db.query<responseRow[]>(
      createAccountQuery(),
      {
        actionType: 'create',
        id: accountID,
        userID: req.userID,
        name,
        type,
        description,
        isDropdown,
        emails: JSON.stringify(emails),
        cancelInvitationIds: '[]',
        removeMemberIds: '[]',
      }
    );

    const parsedData = JSON.parse(
      resultCreate[1][0].response
    );

    if (parsedData.responseCode !== 200) {
      return fail(
        res,
        parsedData.responseCode,
        parsedData.responseMessage
      );
    }

    return success(res, {
      data: parsedData,
    });
  } catch (error) {
    return fail(
      res,
      500,
      error instanceof Error
        ? error.message
        : 'Failed to Create Account'
    );
  }
};

// Get All Accounts of the user
export const getAccounts = async (
  req: Request,
  res: Response
) => {
  try {
    const [rows] = await db.query(getAccountsQuery(), {
      userID: req.userID,
    });

    return success(res, { data: rows || [] });
  } catch (error) {
    return fail(
      res,
      500,
      error instanceof Error
        ? error.message
        : 'Failed to Fetch Accounts'
    );
  }
};

export const getAccountByID = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userID = req.userID;

    if (!id || id === 'null') {
      throw Error('There is no selected account');
    }

    const [rows] = await db.query<RowDataPacket[]>(
      getAccountByIDQuery(),
      {
        userID,
        id,
      }
    );

    const isOwner = rows[0]?.isOwner === 1;

    const [members] = await db.query<RowDataPacket[]>(
      getMembersQuery(),
      {
        accountID: id,
      }
    );

    let invitations: RowDataPacket[] = [];
    if (isOwner) {
      [invitations] = await db.query<RowDataPacket[]>(
        getPendingInvitationsQuery(),
        {
          accountID: id,
        }
      );

      const baseUrl =
        process.env.ORIGIN_URL || 'http://localhost:5173';
      invitations = invitations.map(
        (inv: RowDataPacket) => ({
          ...inv,
          inviteLink: `${baseUrl}/pages/invitations/accept?token=${inv.token}`,
        })
      );
    }

    return success(res, {
      data: {
        ...rows[0],
        members,
        invitations,
        isOwner,
      },
    });
  } catch (error) {
    return fail(
      res,
      500,
      error instanceof Error
        ? error.message
        : 'Failed to Fetch Account'
    );
  }
};

export const updateAccount = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      type,
      description,
      isDropdown,
      emails,
      cancelInvitationIds,
      removeMemberIds,
    } = req.body;
    const { id } = req.params;

    const [resultUpdate] = await db.query<responseRow[]>(
      updateAccountQuery(),
      {
        actionType: 'update',
        id,
        userID: req.userID,
        name,
        type,
        description,
        isDropdown,
        emails: JSON.stringify(emails),
        cancelInvitationIds: JSON.stringify(
          cancelInvitationIds
        ),
        removeMemberIds: JSON.stringify(removeMemberIds),
      }
    );

    const parsedData = JSON.parse(
      resultUpdate[1][0].response
    );

    if (parsedData.responseCode !== 200) {
      return fail(
        res,
        parsedData.responseCode,
        parsedData.responseMessage
      );
    }

    return success(res, {
      data: parsedData,
    });
  } catch (error) {
    return fail(
      res,
      500,
      error instanceof Error
        ? error.message
        : 'Failed to Update Account'
    );
  }
};

export const deleteAccount = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const [resultDelete] = await db.query<responseRow[]>(
      deleteAccountQuery(),
      {
        actionType: 'delete',
        id,
        userID: req.userID,
      }
    );

    const parsedData = JSON.parse(
      resultDelete[1][0].response
    );

    if (parsedData.responseCode !== 200) {
      return fail(
        res,
        parsedData.responseCode,
        parsedData.responseMessage
      );
    }

    return success(res, {
      data: parsedData,
    });
  } catch (error) {
    return fail(
      res,
      500,
      error instanceof Error
        ? error.message
        : 'Failed to Delete Account'
    );
  }
};
