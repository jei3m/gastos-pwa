'use client';
import {
  createContext,
  useContext,
  ReactNode,
} from 'react';
import { Account } from '@/types/accounts.types';
import {
  QueryObserverResult,
  useQuery,
} from '@tanstack/react-query';
import {
  accountByIDQueryOptions,
  accountsQueryOptions,
} from '@/lib/tq-options/accounts.tq.options';
import { useLocalStorage } from '@/hooks/use-local-storage';

type AccountContextType = {
  selectedAccountID: string | null;
  setSelectedAccountID: (uuid: string) => void;
  refetchAccountsData: () => Promise<QueryObserverResult>;
  isAccountsLoading: boolean;
  accounts: Account[];
  selectedAccountDetails: Account;
};

const AccountContext = createContext<
  AccountContextType | undefined
>(undefined);

export function AccountProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [selectedAccountID, setSelectedAccountID] =
    useLocalStorage<string | null>('accountID', undefined);

  const {
    data: accounts,
    isPending: isAccountsLoading,
    refetch,
  } = useQuery(accountsQueryOptions());

  const { data: selectedAccountDetails } = useQuery(
    accountByIDQueryOptions(selectedAccountID!)
  );

  const refetchAccountsData = () => {
    return refetch();
  };

  return (
    <AccountContext.Provider
      value={{
        selectedAccountID: selectedAccountID ?? null,
        setSelectedAccountID,
        refetchAccountsData,
        isAccountsLoading,
        accounts,
        selectedAccountDetails,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error(
      'useAccount must be used within an AccountProvider'
    );
  }
  return context;
}
