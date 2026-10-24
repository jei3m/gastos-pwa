import { useState } from 'react';
import { useLocation } from 'react-router';
import { Loader } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAccount } from '@/context/account-context';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

export default function AccountSelector() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const isMobile = useIsMobile();

  const {
    selectedAccountID,
    setSelectedAccountID,
    isAccountsLoading,
    accounts,
  } = useAccount();

  const filteredAccounts = accounts
    ? accounts.filter(
        (account) =>
          account.isDropdown === 1 ||
          account.id === selectedAccountID
      )
    : [];

  const selectedAccount = accounts?.find(
    (account) => account.id === selectedAccountID
  );

  const handleSelect = (id: string | null) => {
    if (typeof id === 'string') {
      setSelectedAccountID(id);
    }
    setOpen(false);
  };

  const disableSelect = [
    pathname.startsWith('/accounts/'),
    pathname.startsWith('/categories/'),
    pathname.startsWith('/transactions/') &&
      !pathname.startsWith('/transactions/add'),
  ].includes(true);

  return (
    <Select
      open={open}
      onOpenChange={setOpen}
      disabled={disableSelect}
      onValueChange={handleSelect}
      value={selectedAccountID || ''}
    >
      <SelectTrigger
        className={cn(
          `
          w-[180px]
          bg-primary
          min-w-[120px]
          text-sm`,
          isMobile ? 'w-auto' : 'w-full'
        )}
      >
        <SelectValue placeholder="Accounts">
          {(value) => {
            if (!value) {
              return (
                <span className="text-muted-foreground">
                  Accounts
                </span>
              );
            }
            if (selectedAccount) {
              return (
                <>
                  {selectedAccount.name}
                  {Boolean(selectedAccount.isShared) && (
                    <span className="-ml-1 text-xs text-muted-foreground">
                      (Shared)
                    </span>
                  )}
                </>
              );
            }
            return null;
          }}
        </SelectValue>
      </SelectTrigger>

      <SelectContent>
        <SelectGroup>
          {isAccountsLoading ? (
            <div className="flex flex-col justify-center">
              <Loader className="mt-1 mb-1 h-6 w-6 animate-spin text-gray-600" />
            </div>
          ) : (
            <>
              {filteredAccounts && (
                <>
                  {filteredAccounts.map((account) => (
                    <SelectItem
                      key={account.id}
                      value={account.id}
                    >
                      {account.name}
                      {Boolean(account.isShared) && (
                        <span className="-ml-1 text-xs text-muted-foreground">
                          (Shared)
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </>
              )}
            </>
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
