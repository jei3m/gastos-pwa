import { NextRequest } from 'next/server';
import { db } from '@/utils/db';
import { success, fail } from '@/utils/helpers';
import { responseRow } from '@/types/response.types';
import { fetchUserID } from '@/lib/auth/auth-session';
import { connection } from '@/utils/db';
import { removeMember } from '@/lib/sql/members/members.sql';

// Remove a member
export async function DELETE(
  _req: NextRequest,
  {
    params,
  }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id, userId } = await params;
    const userID = await fetchUserID();

    const [result] = await db.query<responseRow[]>(
      removeMember(),
      {
        accountID: id,
        userID,
        targetUserID: userId,
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
        : 'Failed to remove member'
    );
  } finally {
    connection.release();
  }
}
