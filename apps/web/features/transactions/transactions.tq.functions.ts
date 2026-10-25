import { apiFetch, toSearchParams } from '@/lib/api';
import type {
  CategoryTransactionsPage,
  CreateTransaction,
  EditTransactionPayload,
  Transaction,
  TransactionData,
  TransactionDetails,
} from './transactions.interface';

const sortDetails = (transactions: Transaction[]) => {
  for (const transaction of transactions) {
    transaction.details.sort((a, b) =>
      b.time.localeCompare(a.time)
    );
  }
};

export const createTransaction = async (
  transaction: CreateTransaction
) => {
  const res = await apiFetch<{ data: unknown }>(
    '/api/transactions',
    {
      method: 'POST',
      body: JSON.stringify(transaction),
    }
  );
  return res.data;
};

export const fetchTransactions = async (
  selectedAccountID: string | null,
  page: number,
  searchTerm: string
) => {
  const query = toSearchParams({
    accountID: selectedAccountID,
    page,
    searchTerm,
  });

  const res = await apiFetch<TransactionData>(
    `/api/transactions${query}`
  );

  sortDetails(res.data);
  return res;
};

export const fetchTransactionsByCategory = async (
  selectedAccountID: string | null,
  categoryID: string | null,
  page: number,
  dateStart?: string,
  dateEnd?: string
) => {
  const query = toSearchParams({
    accountID: selectedAccountID,
    page,
    dateStart,
    dateEnd,
  });

  const res = await apiFetch<CategoryTransactionsPage>(
    `/api/categories/${categoryID}/transactions${query}`
  );

  sortDetails(res.data);
  return res;
};

export const fetchTransactionByID = async (id: string) => {
  const res = await apiFetch<{
    data: TransactionDetails[];
  }>(`/api/transactions/${id}`);
  return res.data;
};

export const fetchTransactionsCount = async (
  selectedAccountID: string
) => {
  const res = await apiFetch<{ data: { count: number }[] }>(
    `/api/transactions/count?accountID=${selectedAccountID}`
  );
  return res.data?.[0].count;
};

export const editTransaction = async (
  id: string,
  transaction: EditTransactionPayload
) => {
  const res = await apiFetch<{ data: unknown }>(
    `/api/transactions/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(transaction),
    }
  );
  return res.data;
};

export const deleteTransaction = async (id: string) => {
  const res = await apiFetch<{ data: unknown }>(
    `/api/transactions/${id}`,
    {
      method: 'DELETE',
      body: JSON.stringify({}),
    }
  );
  return res.data;
};
