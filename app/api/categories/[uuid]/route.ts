import { NextRequest } from "next/server";
import { connection, db } from "@/utils/db";
import { success, fail } from "@/utils/helpers";
import { responseRow } from "@/types/response.types";
import { fetchUserID } from '@/lib/auth-session';
import { deleteCategory, updateCategory } from "@/sql/categories/categories.sql";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{uuid: string}> }
) {
    try {
        const {
            name,
            type
        } = await req.json();
        const { uuid } = await params;
        
        const [resultUpdate] = await db.query<responseRow[]>(
            updateCategory(),
            {   
                actionType: 'update',
                uuid,
                userID: await fetchUserID(),
                name,
                type,
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
                : 'Failed to Update Category'
        );
    } finally {
        connection.release();
    }
};

export async function DELETE(
    _req: NextRequest,
    { params }: {params: Promise<{ uuid: string }> }
) {
    try {
        const { uuid } = await params;

        const [resultDelete] = await db.query<responseRow[]>(
            deleteCategory(),
            {
                actionType: 'delete',
                uuid,
                userID: await fetchUserID()
            }
        );

        const parsedData = JSON.parse(
            resultDelete[1][0].response
        );

        if (parsedData.responseMessage !== 200) {
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
                : 'Failed to Delete Category'
        )
    } finally {
        connection.release();
    }
};