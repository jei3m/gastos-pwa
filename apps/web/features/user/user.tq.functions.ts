import { apiFetch } from '@/lib/api';
import type { UserDataExport } from './user.interface';

export const fetchUserDataExport = async () => {
  const res = await apiFetch<{ data: UserDataExport }>(
    '/api/export'
  );
  return res.data as UserDataExport;
};
