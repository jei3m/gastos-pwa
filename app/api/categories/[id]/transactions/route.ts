import { db } from '@/utils/db';
import { success, fail } from '@/utils/helpers';
import { fetchUserID } from '@/lib/auth/auth-session';
import { connection } from '@/utils/db';
import {
  getTransactionsByCategory,
  getTransactionsByCategoryCount,
} from '@/lib/sql/transactions/transactions.sql';
import { RowDataPacket } from 'mysql2';
import { getCategoryByID } from '@/lib/sql/categories/categories.sql';

// Fetch Transactions By Category with Pagination
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const accountID = url.searchParams.get('accountID');
    const page = parseInt(
      url.searchParams.get('page') || '1',
      10
    );
    const dateStart =
      url.searchParams.get('dateStart') || null;
    const dateEnd = url.searchParams.get('dateEnd') || null;
    const limit = 10;
    const offset = (page - 1) * limit;
    const userID = await fetchUserID();

    if (!accountID) {
      throw Error('There is no selected account');
    }

    const [categoryDetails] = await db.query<
      RowDataPacket[]
    >(getCategoryByID(), {
      userID,
      id,
      accountID,
      dateStart,
      dateEnd,
    });

    const [transactionCount] = await db.query<
      RowDataPacket[]
    >(getTransactionsByCategoryCount(), {
      userID,
      accountID,
      categoryID: id,
      dateStart,
      dateEnd,
    });

    const [rows] = await db.query<RowDataPacket[]>(
      getTransactionsByCategory(),
      {
        userID,
        accountID,
        categoryID: id,
        limit,
        offset,
        dateStart,
        dateEnd,
      }
    );

    const hasMore =
      offset + limit < transactionCount[0].count;

    return success({
      hasMore: hasMore,
      currentPage: page,
      categoryDetails: categoryDetails,
      data: rows,
    });
  } catch (error) {
    return fail(
      500,
      error instanceof Error
        ? error.message
        : 'Failed to Fetch Transactions'
    );
  } finally {
    connection.release();
  }
}
