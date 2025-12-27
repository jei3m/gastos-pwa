'use server';
import { updateTag } from 'next/cache';

export async function revalidateCategories(id?: string) {
  if (id) {
    updateTag(`category-${id}`);
  };
  updateTag('categories');
  updateTag('categories-options')
};