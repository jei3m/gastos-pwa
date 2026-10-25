import {
  createContext,
  useContext,
  type ReactNode,
} from 'react';
import type { QueryObserverResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type {
  Account,
  AccountDetails,
} from '@/features/accounts/accounts.interface';
import {
  accountByIDQueryOptions,
  accountsQueryOptions,
} from '@/features/accounts/accounts.tq.options';
import { useLocalStorage } from '@/hooks/use-local-storage';

type AccountContextType = {
  selectedAccountID: string | null;
  setSelectedAccountID: (uuid: string) => void;
  refetchAccountsData: () => Promise<QueryObserverResult>;
  isAccountsLoading: boolean;
  accounts: Account[] | undefined;
  selectedAccountDetails: AccountDetails | null | undefined;
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
    accountByIDQueryOptions(selectedAccountID ?? null)
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
