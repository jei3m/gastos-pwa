'use client';
import { 
  createContext, 
  useContext, 
  useEffect, 
  useState, 
  ReactNode 
} from 'react';
import { 
  getSelectedAccountID, 
  setAccountIDInStorage 
} from '@/utils/account';
import { Account } from '@/types/accounts.types';
import { fetchAccounts } from '@/lib/tq-functions/accounts.tq.functions';
import { toast } from 'sonner';

type AccountContextType = {
  selectedAccountID: string | null;
  setSelectedAccount: (uuid: string) => void;
  refetchAccountsData: () => Promise<void>;
  isAccountsLoading: boolean;
  accounts: Account[]
};

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [selectedAccountID, setSelectedAccountID] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
	const [isAccountsLoading, setIsAccountsLoading] = useState(true);

  const fetchAccountsData = async () => {
    setIsAccountsLoading(true);
    await fetchAccounts()
      .then((data) => {
        setAccounts(data);
      })
      .catch((error) => {
        toast.error(error.message);
      })
      .finally(() => {
        setIsAccountsLoading(false);
      });
  };
  
  // Fetch on initial load
  useEffect(() => {
    fetchAccountsData()
  },[]);

  const refetchAccountsData = () => {
    return fetchAccountsData()
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
        accounts
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export function useAccount() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
};