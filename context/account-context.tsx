'use client';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  getSelectedAccountID,
  setAccountIDInStorage,
} from '@/utils/account';
import { Account } from '@/types/accounts.types';
import {
  QueryObserverResult,
  useQuery,
} from '@tanstack/react-query';
import { accountsQueryOptions } from '@/lib/tq-options/accounts.tq.options';

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
    useState<string | null>(null);

  const {
    data: accounts,
    isPending: isAccountsLoading,
    refetch,
  } = useQuery(accountsQueryOptions());

  const refetchAccountsData = () => {
    return refetch();
  };

  useEffect(() => {
    // Initialize the selected account from localStorage
    const accountID = getSelectedAccountID();
    setSelectedAccountID(accountID);
  }, []);

  const setSelectedAccount = (uuid: string) => {
    setAccountIDInStorage(uuid); // Update localStorage
    setSelectedAccountID(uuid); // Update state
  };

  return (
    <AccountContext.Provider
      value={{
        selectedAccountID,
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
