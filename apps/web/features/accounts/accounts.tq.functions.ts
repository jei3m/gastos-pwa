import { apiFetch } from '@/lib/api';
import type {
  Account,
  AccountDetails,
  CreateAccount,
  EditAccount,
} from './accounts.interface';

export const fetchAccounts = async () => {
  const res = await apiFetch<{ data: Account[] }>(
    '/api/accounts'
  );
  return res.data;
};

export const fetchAccountByID = async (
  id: string | null
) => {
  if (!id) return null;
  const res = await apiFetch<{ data: AccountDetails }>(
    `/api/accounts/${id}`
  );
  return res.data || null;
};

export const createAccount = async (
  account: CreateAccount
) => {
  const res = await apiFetch<{ data: unknown }>(
    '/api/accounts',
    {
      method: 'POST',
      body: JSON.stringify(account),
    }
  );
  return res.data;
};

export const editAccount = async (
  id: string,
  account: EditAccount
) => {
  const res = await apiFetch<{ data: unknown }>(
    `/api/accounts/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(account),
    }
  );
  return res.data;
};

export const deleteAccount = async (id: string) => {
  const res = await apiFetch<{ data: unknown }>(
    `/api/accounts/${id}`,
    {
      method: 'DELETE',
      body: JSON.stringify({}),
    }
  );
  return res.data;
};
