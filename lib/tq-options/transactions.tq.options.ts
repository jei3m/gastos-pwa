import {
  infiniteQueryOptions,
  queryOptions,
} from '@tanstack/react-query';
import {
  fetchTransactionByID,
  fetchTransactions,
  fetchTransactionsByCategory,
  fetchTransactionsCount,
} from '../tq-functions/transactions.tq.functions';

export function transactionsInfiniteQueryOptions(
  selectedAccountID: string | null
) {
  return infiniteQueryOptions({
    queryKey: ['transactions', selectedAccountID],
    queryFn: ({ pageParam }) =>
      fetchTransactions(selectedAccountID, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore
        ? lastPage.currentPage + 1
        : undefined;
    },
    enabled: !!selectedAccountID,
    retry: false,
  });
}

export function transactionsByCategoryInfiniteQueryOptions(
  selectedAccountID: string | null,
  categoryID: string | null,
  dateStart?: string,
  dateEnd?: string
) {
  return infiniteQueryOptions({
    queryKey: [
      'transactions',
      selectedAccountID,
      categoryID,
      dateStart,
      dateEnd,
    ],
    queryFn: ({ pageParam }) =>
      fetchTransactionsByCategory(
        selectedAccountID,
        categoryID,
        pageParam,
        dateStart,
        dateEnd
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore
        ? lastPage.currentPage + 1
        : undefined;
    },
    enabled: !!selectedAccountID || !!categoryID,
    retry: false,
  });
}

export function transactionByIDQueryOptions(id: string) {
  return queryOptions({
    queryKey: ['transactions', `transaction-${id}`],
    queryFn: () => {
      return fetchTransactionByID(id!);
    },
    enabled: !!id,
  });
}

export function transactionsCountQueryOptions(
  selectedAccountID: string
) {
  return queryOptions({
    queryKey: ['transactionsCount', selectedAccountID],
    queryFn: () => {
      return fetchTransactionsCount(selectedAccountID!);
    },
    enabled: !!selectedAccountID,
  });
}
