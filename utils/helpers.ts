import { NextResponse } from 'next/server';

export function success(
  data: Record<string, any>,
  status = 200
) {
  return NextResponse.json(
    {
      success: true,
      ...data,
    },
    {
      status,
    }
  );
}

export function fail(status: number, message: string) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    {
      status,
    }
  );
}
