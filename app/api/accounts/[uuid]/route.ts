import { NextRequest } from "next/server";
import { connection, db } from "@/utils/db";
import { success, fail } from "@/utils/helpers";
import { responseRow } from "@/types/response.types";
import { fetchUserID } from '@/lib/auth-session';
import {
    getAccountByID,
    deleteAccount,
    updateAccount
} from "@/sql/accounts/accounts.sql";

// Get Specific Account
export async function GET(
    _req: Request,
    { params }: { params: Promise<{uuid: string}> }
) {
    try {
        const { uuid } = await params;
        
        const [rows] = await db.query(
            getAccountByID(),
            {
                userID: await fetchUserID(),
                uuid
            }
        );

        return success({data: rows});

    } catch (error) {
        return fail(
            500,
            error instanceof Error
                ? error.message
                : 'Failed to Fetch Account'
        )
    } finally {
        connection.release();
    }
};

// Update Account
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ uuid: string }> }
) {
    try {
        const { 
            name, 
            type, 
            description 
        } = await req.json();
        const { uuid } = await params;

        const [resultUpdate] = await db.query<responseRow[]>(
            updateAccount(),
            {
                actionType: 'update',
                uuid,
                userID: await fetchUserID(),
                name,
                type,
                description
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
                : 'Failed to Update Account'
        )
    } finally {
        connection.release();
    }
};

// Delete Account
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ uuid: string }> }
) {
    try {
        const { uuid } = await params;

        const [resultDelete] = await db.query<responseRow[]>(
            deleteAccount(),
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
                : 'Failed to Delete Account'
        )
    } finally {
        connection.release();
    }
};