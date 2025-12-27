import { 
  infiniteQueryOptions, 
  queryOptions 
} from "@tanstack/react-query";
import { 
  fetchTransactionByID, 
  fetchTransactions, 
  fetchTransactionsCount 
} from "../tq-functions/transactions.tq.functions";

export function transactionsInfiniteQueryOptions(
  selectedAccountID: string
) {
  return infiniteQueryOptions({
    queryKey: ['transactions', selectedAccountID],
    queryFn: ({ pageParam }) => 
      fetchTransactions(selectedAccountID, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore
        ? lastPage.currentPage + 1
        : undefined
    },
    enabled: !!selectedAccountID
  })
};

export function transactionByIDQueryOptions(
  id: string,
) {
  return queryOptions({
    queryKey: [
      'transactions',
      `transaction-${id}`,
    ],
    queryFn: () => {
      return fetchTransactionByID(
        id!
      );
    },
    enabled: !!id
  })
};

export function transactionsCountQueryOptions(
  selectedAccountID: string,
) {
  return queryOptions({
    queryKey: [
      'transactionsCount',
      selectedAccountID,
    ],
    queryFn: () => {
      return fetchTransactionsCount(
        selectedAccountID!
      );
    },
    enabled: !!selectedAccountID
  })
};