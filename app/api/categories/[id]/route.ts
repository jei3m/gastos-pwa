import { NextRequest } from 'next/server';
import { connection, db } from '@/utils/db';
import { success, fail } from '@/utils/helpers';
import { responseRow } from '@/types/response.types';
import { fetchUserID } from '@/lib/auth/auth-session';
import {
  getCategoryByID,
  deleteCategory,
  updateCategory,
} from '@/lib/sql/categories/categories.sql';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [rows] = await db.query(getCategoryByID(), {
      userID: await fetchUserID(),
      id,
    });

    return success({ data: rows });
  } catch (error) {
    return fail(
      500,
      error instanceof Error
        ? error.message
        : 'Failed to Fetch Category'
    );
  } finally {
    connection.release();
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { name, type, icon, description } =
      await req.json();
    const { id } = await params;

    const [resultUpdate] = await db.query<responseRow[]>(
      updateCategory(),
      {
        actionType: 'update',
        id,
        userID: await fetchUserID(),
        name,
        type,
        description,
        icon,
      }
    );

    const parsedData = JSON.parse(
      resultUpdate[1][0].response
    );

    if (parsedData.responseCode !== 200) {
      return fail(
        parsedData.responseCode,
        parsedData.responseMessage
      );
    }

    return success({
      data: parsedData,
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
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [resultDelete] = await db.query<responseRow[]>(
      deleteCategory(),
      {
        actionType: 'delete',
        id,
        userID: await fetchUserID(),
      }
    );

    const parsedData = JSON.parse(
      resultDelete[1][0].response
    );

    if (parsedData.responseCode !== 200) {
      return fail(
        parsedData.responseCode,
        parsedData.responseMessage
      );
    }

    return success({
      data: parsedData,
    });
  } catch (error) {
    return fail(
      500,
      error instanceof Error
        ? error.message
        : 'Failed to Delete Category'
    );
  } finally {
    connection.release();
  }
}
