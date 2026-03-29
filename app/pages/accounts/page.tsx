'use client';
import { useRef, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import PulseLoader from '@/components/custom/pulse-loader';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { formatAmount } from '@/utils/format-amount';
import { Skeleton } from '@/components/ui/skeleton';
import { TypographyH4 } from '@/components/custom/typography';
import { Separator } from '@/components/ui/separator';
import { accountsQueryOptions } from '@/lib/tq-options/accounts.tq.options';
import { useQuery } from '@tanstack/react-query';
import { Account } from '@/types/accounts.types';
import { cn } from '@/lib/utils';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { accountTypes } from '@/lib/data';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScrollState } from '@/hooks/use-scroll-state';
import { useAccount } from '@/context/account-context';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function Accounts() {
  const [accountType, setAccountType] = useState('All');
  const isMobile = useIsMobile();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrolled = useScrollState(scrollRef);
  const { setSelectedAccount, selectedAccountID } =
    useAccount();

  const [hideNetWorthTotal, setHideNetWorthTotal] =
    useLocalStorage('hideNetWorthTotal', false);
  const [hideNetWorthDigital, setHideNetWorthDigital] =
    useLocalStorage('hideNetWorthDigital', false);
  const [hideNetWorthCash, setHideNetWorthCash] =
    useLocalStorage('hideNetWorthCash', false);

  const { data: accounts, isPending: isAccountsLoading } =
    useQuery(accountsQueryOptions());

  const filteredAccounts = accounts?.filter(
    (account: Account) =>
      accountType === 'All'
        ? true
        : account.type === accountType
  );

  const calculateNetWorth = () => {
    if (!accounts) return '0.00';

    const accountsToCalculate = isMobile
      ? filteredAccounts
      : accounts;

    // Sum up all account balances
    const netWorth = accountsToCalculate.reduce(
      (total: number, account: Account) => {
        const balance = parseFloat(account.totalBalance);
        return total + (isNaN(balance) ? 0 : balance);
      },
      0
    );

    return netWorth.toFixed(2);
  };

  const calculateNetWorthByType = (type: string) => {
    if (!accounts) return '0.00';

    const digitalAccounts = accounts.filter(
      (account: Account) => account.type === type
    );

    // Sum up all account balances
    const netWorth = digitalAccounts.reduce(
      (total: number, account: Account) => {
        const balance = parseFloat(account.totalBalance);
        return total + (isNaN(balance) ? 0 : balance);
      },
      0
    );

    return netWorth.toFixed(2);
  };

  const handleSelectAccount = (
    id: string,
    name: string
  ) => {
    if (selectedAccountID === id) return;
    setSelectedAccount(id);
    toast.success(`Selected ${name} as Active Account`);
  };

  return (
    <main
      ref={scrollRef}
      className={cn(
        'flex flex-col space-y-2 md:space-y-4 overflow-y-auto',
        isMobile ? 'h-screen pb-29' : 'pb-4'
      )}
    >
      {/* Net Worth Section */}
      <section
        className={cn(
          'transition-all ease-in-out',
          isScrolled && isMobile
            ? 'fixed w-full top-0 z-10'
            : 'pt-2 md:pt-4 px-3 flex md:flex-col md:flex-row gap-2 md:gap-4'
        )}
      >
        {/* Total Net Worth Card */}
        <Card
          className={cn(
            isScrolled && isMobile
              ? '-mt-2 border-0 rounded-none'
              : 'border-2 my-auto',
            isMobile ? 'w-full' : 'flex-3'
          )}
        >
          <CardContent>
            <div className="flex flex-row items-center -mb-0.5">
              <h3 className="text-gray-600 font-normal text-lg">
                Total Net Worth
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setHideNetWorthTotal(!hideNetWorthTotal)
                }
                className="h-8 w-8 text-gray-600"
              >
                {hideNetWorthTotal ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {isAccountsLoading ? (
              <h1 className="text-2xl font-extrabold flex">
                <Skeleton className="h-10 w-[50%] bg-gray-300" />
              </h1>
            ) : (
              <h1 className="text-2xl font-extrabold">
                PHP{' '}
                {hideNetWorthTotal
                  ? '********'
                  : formatAmount(calculateNetWorth())}
              </h1>
            )}
          </CardContent>
        </Card>

        {!isMobile && (
          <>
            {/* Total Digital Net Worth Card */}
            <Card className="border-2 my-auto flex-3">
              <CardContent>
                <div className="flex flex-row items-center -mb-0.5">
                  <h3 className="text-gray-600 font-normal text-lg">
                    Digital Net Worth
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setHideNetWorthDigital(
                        !hideNetWorthDigital
                      )
                    }
                    className="h-8 w-8 text-gray-600"
                  >
                    {hideNetWorthDigital ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {isAccountsLoading ? (
                  <h1 className="text-2xl font-extrabold flex">
                    <Skeleton className="h-10 w-[50%] bg-gray-300" />
                  </h1>
                ) : (
                  <h1 className="text-2xl font-extrabold">
                    PHP{' '}
                    {hideNetWorthDigital
                      ? '********'
                      : formatAmount(
                          calculateNetWorthByType('Digital')
                        )}
                  </h1>
                )}
              </CardContent>
            </Card>
            {/* Total Cash Net Worth Card */}
            <Card className="border-2 my-auto flex-3">
              <CardContent>
                <div className="flex flex-row items-center -mb-0.5">
                  <h3 className="text-gray-600 font-normal text-lg">
                    Cash Net Worth
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setHideNetWorthCash(!hideNetWorthCash)
                    }
                    className="h-8 w-8 text-gray-600"
                  >
                    {hideNetWorthCash ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {isAccountsLoading ? (
                  <h1 className="text-2xl font-extrabold flex">
                    <Skeleton className="h-10 w-[50%] bg-gray-300" />
                  </h1>
                ) : (
                  <h1 className="text-2xl font-extrabold">
                    PHP{' '}
                    {hideNetWorthCash
                      ? '********'
                      : formatAmount(
                          calculateNetWorthByType('Cash')
                        )}
                  </h1>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {isMobile && isScrolled && (
          <div className="w-full border-t-2 border-black" />
        )}
      </section>

      {/* Accounts Section */}
      <section
        className={cn(
          'flex flex-col space-y-2 md:space-y-4 px-3 mb-2',
          isScrolled && isMobile && 'mt-[104px]'
        )}
      >
        <Tabs
          value={accountType}
          onValueChange={setAccountType}
        >
          <div className="flex flex-row justify-between items-center w-full">
            <TypographyH4>Accounts</TypographyH4>
            <TabsList className="border-black border-2 p-1">
              {accountTypes.map((type, index) => (
                <TabsTrigger
                  className="text-sm md:text-md"
                  value={type}
                  key={index}
                >
                  {type}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
        {isAccountsLoading || !accounts ? (
          <PulseLoader />
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-2 md:gap-4">
              {filteredAccounts.map((account: Account) => (
                <Card
                  className="border-2 h-full"
                  key={account.id}
                  onClick={() =>
                    handleSelectAccount(
                      account.id,
                      account.name
                    )
                  }
                >
                  <CardHeader>
                    <div className="flex flex-rows items-center justify-between">
                      <div className="text-lg md:text-xl font-bold">
                        {isAccountsLoading ? (
                          <Skeleton className="h-4 md:h-5 w-[140px] bg-gray-300" />
                        ) : (
                          account?.name
                        )}
                        {selectedAccountID ===
                          account.id && (
                          <Badge
                            variant="outline"
                            className="ml-2 text-green-600 border-green-200 bg-green-50"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </div>
                      <div className="text-md text-gray-600 font-normal">
                        {isAccountsLoading ? (
                          <Skeleton className="h-4 md:h-5 w-[140px] bg-gray-300" />
                        ) : (
                          account?.type
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <Separator className="-mt-2" />
                  <CardContent className="space-y-2">
                    <div className="flex flex-col">
                      <h3 className="text-gray-600 font-normal text-lg">
                        Balance
                      </h3>
                      {isAccountsLoading ? (
                        <h1 className="text-2xl md:text-3xl font-extrabold flex">
                          <Skeleton className="h-10 w-[50%] bg-gray-300" />
                        </h1>
                      ) : (
                        <h1 className="text-2xl font-extrabold">
                          PHP{' '}
                          {formatAmount(
                            account?.totalBalance
                          )}
                        </h1>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
