import { RowDataPacket } from 'mysql2';
import { db } from '@/utils/db';
import { success, fail } from '@/utils/helpers';
import { fetchUserID } from '@/lib/auth/auth-session';
import { connection } from '@/utils/db';
import { getExportData } from '@/lib/sql/user/users.sql';

export async function GET() {
  try {
    const userID = await fetchUserID();
    const [rows] = await db.query<RowDataPacket[]>(
      getExportData(),
      { userID }
    );

    const exportData =
      typeof rows[0]?.export === 'string'
        ? JSON.parse(rows[0].export)
        : rows[0]?.export;

    return success({
      data: {
        accounts: exportData?.accounts ?? [],
        categories: exportData?.categories ?? [],
        transactions: exportData?.transactions ?? [],
      },
    });
  } catch (error) {
    return fail(
      500,
      error instanceof Error
        ? error.message
        : 'Failed to Export Data'
    );
  } finally {
    connection.release();
  }
}
