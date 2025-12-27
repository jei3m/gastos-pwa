'use server';
import { updateTag } from 'next/cache';

export async function revalidateTransactions(id?: string) {
  if (id) {
    updateTag(`transaction-${id}`);
  };
  updateTag('transactions');
  updateTag('transactions-count');
};
