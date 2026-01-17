import { db } from '@/utils/db';
import { success, fail } from '@/utils/helpers';
import { fetchUserID } from '@/lib/auth/auth-session';
import { connection } from '@/utils/db';
import { getTransactionsCount } from '@/lib/sql/transactions/transactions.sql';

// Get Count of Transactions
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const accountID = url.searchParams.get('accountID');
    const [rows] = await db.query(getTransactionsCount(), {
      userID: await fetchUserID(),
      accountID,
    });

    return success({ data: rows });
  } catch (error) {
    return fail(
      500,
      error instanceof Error
        ? error.message
        : 'Failed to Fetch Transactions Counts'
    );
  } finally {
    connection.release();
  }
}
