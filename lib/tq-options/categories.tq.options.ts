"use client";
import { queryOptions } from "@tanstack/react-query";
import { fetchCategories, fetchCategoryByID } from "../tq-functions/categories.tq.functions";

export function categoryQueryOptions(
  categoryType: string,
  selectedAccountID: string | null,
  dateStart?: string,
  dateEnd?: string
) {
  return queryOptions({
    queryKey: [
      'categories',
      categoryType,
      selectedAccountID,
      dateStart,
      dateEnd
    ],
    queryFn: () => {
      return fetchCategories(
        categoryType!,
        selectedAccountID,
        dateStart,
        dateEnd
      );
    },
    enabled: categoryType !== 'transfer',
    retry: false,
  })
};

export function categoryByIDQueryOptions(
  id: string
) {
  return queryOptions({
    queryKey: [
      'categories',
      `category-${id}`
    ],
    queryFn: () => {
      return fetchCategoryByID(id)
    },
    enabled: !!id
  })
};