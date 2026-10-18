import { apiFetch, toSearchParams } from '@/lib/api';
import type {
  Category,
  CreateCategory,
  EditCategory,
} from './categories.interface';

export const fetchCategories = async (
  type: string | null,
  accountID: string | null,
  dateStart?: string | null,
  dateEnd?: string | null,
  filter?: string
) => {
  const query = toSearchParams({
    type,
    accountID,
    dateStart,
    dateEnd,
    filter,
  });

  const res = await apiFetch<{ data: Category[] }>(
    `/api/categories${query}`
  );
  return res.data;
};

export const fetchCategoryByID = async (id: string) => {
  const res = await apiFetch<{ data: Category[] }>(
    `/api/categories/${id}`
  );
  return res.data[0] || null;
};

export const createCategory = async (
  category: CreateCategory
) => {
  const res = await apiFetch<{ data: unknown }>(
    '/api/categories',
    {
      method: 'POST',
      body: JSON.stringify(category),
    }
  );
  return res.data;
};

export const editCategory = async (
  id: string,
  category: EditCategory
) => {
  const res = await apiFetch<{ data: unknown }>(
    `/api/categories/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(category),
    }
  );
  return res.data;
};

export const deleteCategory = async (id: string) => {
  const res = await apiFetch<{ data: unknown }>(
    `/api/categories/${id}`,
    {
      method: 'DELETE',
      body: JSON.stringify({}),
    }
  );
  return res.data;
};
