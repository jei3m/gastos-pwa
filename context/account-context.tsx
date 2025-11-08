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

type AccountContextType = {
  selectedAccountID: string | null;
  setSelectedAccount: (uuid: string) => void;
};

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [selectedAccountID, setSelectedAccountID] = useState<string | null>(null);

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
    <AccountContext.Provider value={{ selectedAccountID, setSelectedAccount }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
}