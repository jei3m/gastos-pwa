import { NextRequest } from "next/server";
import crypto from 'crypto';
import { connection, db } from "@/utils/db";
import { success, fail } from "@/utils/helpers";
import { responseRow } from "@/types/response.types";
import { createCategory, getCategories } from "@/sql/categories/categories.sql";
import { fetchUserID } from "@/lib/auth-session";

export async function POST(req: NextRequest) {
    try {
        const {
            name,
            type
        } = await req.json();

        const [resultCreate] = await db.query<responseRow[]>(
            createCategory(),
            {
                actionType: 'create',
                uuid: crypto.randomUUID(),
                userID: await fetchUserID(),
                name,
                type
            }
        );

        const parsedData = JSON.parse(
            resultCreate[1][0].response
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
                : 'Failed to Create Categery'
        );
    } finally {
        connection.release();
    }
};

export async function GET() {
    try {
        const [selectQuery] = await db.query(
            getCategories(),
            {
                userID: await fetchUserID()
            }
        );

        return success({
            data: selectQuery
        });
    } catch (error) {
        return fail(
            500,
            error instanceof Error
                ? error.message
                : 'Failed to Fetch Categories'
        );
    } finally {
        connection.release();
    }
};