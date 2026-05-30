import { NextRequest } from 'next/server';
import { db } from '@/utils/db';
import { success, fail } from '@/utils/helpers';
import { responseRow } from '@/types/response.types';
import { fetchUserID } from '@/lib/auth/auth-session';
import { connection } from '@/utils/db';
import { cancelInvitation } from '@/lib/sql/members/members.sql';

// Cancel a pending invitation
export async function DELETE(
  _req: NextRequest,
  {
    params,
  }: { params: Promise<{ id: string; inviteId: string }> }
) {
  try {
    const { id, inviteId } = await params;
    const userID = await fetchUserID();

    const [result] = await db.query<responseRow[]>(
      cancelInvitation(),
      {
        accountID: id,
        userID,
        invitationID: inviteId,
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
      data: { responseMessage: parsedData.responseMessage },
    });
  } catch (error) {
    return fail(
      500,
      error instanceof Error
        ? error.message
        : 'Failed to cancel invitation'
    );
  } finally {
    connection.release();
  }
}
