import { apiFetch } from '@/lib/api';
import type {
  User,
  UserDataExport,
} from './user.interface';

export const fetchUserByEmail = async (email: string) => {
  const res = await apiFetch<{ data: User[] }>(
    `/api/users/${encodeURIComponent(email)}`
  );
  return res.data[0] ?? null;
};

export const fetchUserDataExport = async () => {
  const res = await apiFetch<{ data: UserDataExport }>(
    '/api/export'
  );
  return res.data as UserDataExport;
};
