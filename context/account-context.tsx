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
import { accountsQueryOptions } from '@/lib/tq-options/accounts.tq.options';
import { useLocalStorage } from '@/hooks/use-local-storage';

type AccountContextType = {
  selectedAccountID: string | null;
  setSelectedAccount: (uuid: string) => void;
  refetchAccountsData: () => Promise<QueryObserverResult>;
  isAccountsLoading: boolean;
  accounts: Account[];
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

  const refetchAccountsData = () => {
    return refetch();
  };

  const setSelectedAccount = (uuid: string) => {
    setSelectedAccountID(uuid);
  };

  return (
    <AccountContext.Provider
      value={{
        selectedAccountID: selectedAccountID ?? null,
        setSelectedAccount,
        refetchAccountsData,
        isAccountsLoading,
        accounts,
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
