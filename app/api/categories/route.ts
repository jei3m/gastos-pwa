import { NextRequest } from "next/server";
import crypto from 'crypto';
import { connection, db } from "@/utils/db";
import { success, fail } from "@/utils/helpers";
import { responseRow } from "@/types/response.types";
import { createCategory, getCategories } from "@/lib/sql/categories/categories.sql";
import { fetchUserID } from "@/lib/auth/auth-session";

export async function POST(req: NextRequest) {
	try {
		const {
			name,
			type,
			icon,
			description
		} = await req.json();

		const [resultCreate] = await db.query<responseRow[]>(
			createCategory(),
			{
				actionType: 'create',
				id: crypto.randomUUID(),
				userID: await fetchUserID(),
				name,
				type,
				icon,
				description,
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
				: 'Failed to Create Category'
		);
	} finally {
		connection.release();
	}
};

export async function GET(request: Request) {
	try {
		const url = new URL(request.url);
		const filter = url.searchParams.get('filter');
		const accountID = url.searchParams.get('accountID');
		const dateStart = url.searchParams.get('dateStart');
		const dateEnd = url.searchParams.get('dateEnd');

		if (!accountID) {
			throw Error("There is no selected account");
		};

		const [selectQuery] = await db.query(
			getCategories(),
			{
				userID: await fetchUserID(),
				accountID,
				filter,
				dateStart,
				dateEnd,
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