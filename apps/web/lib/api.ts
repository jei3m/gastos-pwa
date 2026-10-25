const API_URL = import.meta.env.VITE_API_URL ?? '';

export type ApiResult<T> = {
  success: boolean;
  message?: string;
  code: number;
} & T;

export class ApiError extends Error {
  status: number;
  code?: number;

  constructor(
    message: string,
    status: number,
    code: number
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export async function apiFetch<T extends object>(
  path: string,
  init?: RequestInit
): Promise<ApiResult<T>> {
  try {
    const headers = new Headers(init?.headers);

    if (init?.body) {
      headers.set('Content-Type', 'application/json');
    }

    const res = await fetch(`${API_URL}${path}`, {
      credentials: 'include',
      ...init,
      headers,
    });

    const data = (await res.json()) as ApiResult<T>;

    if (!data.success) {
      throw new ApiError(
        data.message ?? 'Request failed',
        res.status,
        data.code
      );
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Request failed', { cause: error });
  }
}

export function toSearchParams(
  params: Record<string, string | number | null | undefined>
): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (
      value !== undefined &&
      value !== null &&
      value !== ''
    ) {
      search.append(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : '';
}
