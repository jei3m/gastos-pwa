import { queryOptions } from "@tanstack/react-query";
import { fetchAccountByID, fetchAccounts } from "../tq-functions/accounts.tq.functions";

export function accountsQueryOptions() {
  return queryOptions({
    queryKey: [
      'accounts',
    ],
    queryFn: () => {
      return fetchAccounts();
    },
  })
};

export function accountByIDQueryOptions(
  selectedAccountID: string | null,
) {
  return queryOptions({
    queryKey: [
      'accounts',
      `account-${selectedAccountID}`,
    ],
    queryFn: () => {
      return fetchAccountByID(
        selectedAccountID,
      );
    },
    retry: false
  })
};