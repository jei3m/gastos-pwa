'use server';
import { updateTag } from 'next/cache';

export async function revalidateAccounts(id?: string) {
  if (id) {
    updateTag(`account-${id}`);
  };
  updateTag('accounts');
};