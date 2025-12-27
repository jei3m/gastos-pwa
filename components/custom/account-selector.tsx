"use client";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2 } from 'lucide-react';
import { useAccount } from '@/context/account-context';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

export default function AccountSelector() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const { 
    selectedAccountID, 
    setSelectedAccount,
    isAccountsLoading,
    accounts
  } = useAccount();

	const handleSelect = (id: string) => {
		setSelectedAccount(id);
		setOpen(false)
	};

	const disableSelect = [
		pathname.startsWith('/pages/accounts/')
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
        className={cn(`
          w-[180px]
          bg-primary
          border-2 border-black
          min-w-[120px]
          text-sm`,
          isMobile ? 'w-auto' : 'w-full'
        )}
      >
        <SelectValue placeholder="Accounts" />
      </SelectTrigger>

      <SelectContent className='border-2 border-black'>
        <SelectGroup>
          {isAccountsLoading ?
            <div className='flex flex-col justify-center'>
              <Loader2 className='w-full h-6 w-6 mt-1 mb-1 text-gray-600 animate-spin'/>
            </div>
          :
            <>
              {accounts && (
                <>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}										
                </>
              )}
            </>
          }
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
