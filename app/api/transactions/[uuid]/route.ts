import { NextRequest } from "next/server";
import { connection, db } from "@/utils/db";
import { 
  success, 
  fail 
} from "@/utils/helpers";
import { responseRow } from "@/types/response.types";
import { fetchUserID } from '@/lib/auth-session';
import { 
  deleteTransaction,
  updateTransaction 
} from "@/sql/transactions/transactions.sql";

// Update Transaction
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ uuid: string }> }
) {
    try {
        const { 
          note,
          amount,
          type,
          time,
          date,
          accountID,
          categoryID
        } = await req.json();
        const { uuid } = await params;

        const [resultUpdate] = await db.query<responseRow[]>(
            updateTransaction(),
            {
              actionType: 'update',
              uuid,
              userID: await fetchUserID(),
              note,
              amount,
              type,
              time,
              date,
              accountID,
              categoryID,
            }
        );

        const parsedData = JSON.parse(
            resultUpdate[1][0].response
        );

        if (parsedData.responseCode !== 200) {
            return fail(
                parsedData.responseCode,
                parsedData.responseMessage
            )
        };

        return success({
            data: parsedData
        });

    } catch (error) {
        return fail(
            500,
            error instanceof Error
                ? error.message
                : 'Failed to Update Transaction'
        )
    } finally {
        connection.release();
    }
};

// Delete Transaction
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ uuid: string }> }
) {
    try {
        const { uuid } = await params;

        const [resultDelete] = await db.query<responseRow[]>(
            deleteTransaction(),
            {
                actionType: 'delete',
                uuid,
                userID: await fetchUserID()
            }
        );

        const parsedData = JSON.parse(
            resultDelete[1][0].response
        );

        if (parsedData.responseCode !== 200) {
            return fail(
                parsedData.responseMessage,
                parsedData.responseCode
            )
        };

        return success({
            data: parsedData
        });

    } catch (error) {
        return fail(
            500,
            error instanceof Error
                ? error.message
                : 'Failed to Delete Transaction'
        )
    } finally {
        connection.release();
    }
};