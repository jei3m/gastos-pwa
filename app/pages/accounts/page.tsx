"use client";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import PulseLoader from "@/components/custom/pulse-loader";
import { 
  Card, 
  CardContent, 
  CardHeader,
} from "@/components/ui/card";
import { formatAmount } from "@/utils/format-amount";
import { Skeleton } from "@/components/ui/skeleton";
import { TypographyH4 } from "@/components/custom/typography";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { accountsQueryOptions } from "@/lib/tq-options/accounts.tq.options";
import { useQuery } from "@tanstack/react-query";
import { Account } from "@/types/accounts.types";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { accountTypes } from "@/lib/data";


export default function Accounts() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [accountType, setAccountType] = useState("All");
  const isMobile = useIsMobile();

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
    window.scroll(0, 0);
    setIsScrolled(false);
  }, []);

  const { data: accounts, isPending: isAccountsLoading} = useQuery(
    accountsQueryOptions()
  );

  const filteredAccounts = accounts?.filter((account: Account) => 
    accountType === 'All'
    ? true 
    : account.type === accountType
  );

  const calculateNetWorth = () => {
    if (!accounts) return '0.00';

    const accountsToCalculate = isMobile
      ? filteredAccounts
      : accounts
    
    // Sum up all account balances
    const netWorth = accountsToCalculate.reduce(
      (total: number, account: Account) => {
        const balance = parseFloat(account.totalBalance);
        return total + (isNaN(balance) ? 0 : balance);
    }, 0);
    
    return netWorth.toFixed(2);
  };

  const calculateNetWorthByType = (type: string) => {
    if (!accounts) return '0.00';

    const digitalAccounts = accounts.filter((account: Account) => account.type === type);
    
    // Sum up all account balances
    const netWorth = digitalAccounts.reduce((total: number, account: Account) => {
      const balance = parseFloat(account.totalBalance);
      return total + (isNaN(balance) ? 0 : balance);
    }, 0);
    
    return netWorth.toFixed(2);
  };

  // Set isScrolled
  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
		<main className={cn(
      'flex flex-col space-y-2 min-h-screen',
      isMobile ? "pb-20" : "pb-4"
    )}>
      <section className={cn(
        'transition-all duration-150 ease-in-out',
          isScrolled && isMobile
            ? 'sticky top-0 z-10'
            : 'pt-2 px-3 flex md:flex-col lg:flex-row gap-2'
      )}>
        {/* Total Net Worth Card */}
        <Card className={cn(
            isScrolled && isMobile
              ? '-mt-2 border-0 rounded-none'
              : 'border-2 mt-0',
            isMobile ? 'w-full' : 'flex-3'
          )}
        >
          <CardContent className='space-y-2'>
            <div className='flex flex-col'>
              <h3 className='text-gray-600 font-normal text-lg'>
                Total Net Worth
              </h3>
              {isAccountsLoading ? (
                <h1 className='text-2xl font-extrabold flex'>
                  <Skeleton className='h-10 w-[50%] bg-gray-300'/>
                </h1>               
              ):(
                <h1 className='text-2xl font-extrabold'>
                  PHP {formatAmount(calculateNetWorth())}
                </h1> 
              )}
            </div>
          </CardContent>
        </Card>
        
        {!isMobile && (
          <>
            {/* Total Digital Net Worth Card */}
            <Card className="border-2 mt-0 flex-3">
              <CardContent className='space-y-2'>
                <div className='flex flex-col'>
                  <h3 className='text-gray-600 font-normal text-lg'>
                    Digital Net Worth
                  </h3>
                  {isAccountsLoading ? (
                    <h1 className='text-2xl font-extrabold flex'>
                      <Skeleton className='h-10 w-[50%] bg-gray-300'/>
                    </h1>               
                  ):(
                    <h1 className='text-2xl font-extrabold'>
                      PHP {formatAmount(calculateNetWorthByType('Digital'))}
                    </h1> 
                  )}
                </div>
              </CardContent>
            </Card>
            {/* Total Cash Net Worth Card */}
            <Card className="border-2 mt-0 flex-3">
              <CardContent className='space-y-2'>
                <div className='flex flex-col'>
                  <h3 className='text-gray-600 font-normal text-lg'>
                    Cash Net Worth
                  </h3>
                  {isAccountsLoading ? (
                    <h1 className='text-2xl font-extrabold flex'>
                      <Skeleton className='h-10 w-[50%] bg-gray-300'/>
                    </h1>               
                  ):(
                    <h1 className='text-2xl font-extrabold'>
                      PHP {formatAmount(calculateNetWorthByType('Cash'))}
                    </h1> 
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {isMobile && isScrolled && (
          <div className='w-full border-t-2 border-black' />
        )}
      </section>

      {/* Accounts Section */}
      <section className='flex flex-col space-y-2 px-3 mb-2'>
				<Tabs value={accountType} onValueChange={setAccountType}>
					<div className='flex flex-row justify-between items-center w-full'>
						<TypographyH4>
							Accounts
						</TypographyH4>					
						<TabsList className='border-black border-2 p-1'>
							{accountTypes.map((type, index) => (
								<TabsTrigger
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
          <PulseLoader/>
        ):(
          <>
            <div className="grid md:grid-cols-2 gap-2">
              {filteredAccounts.map((account: Account) => (
                <Link
                  href={`/pages/accounts/${account.id}`}
                  key={account.id}
                >
                  <Card className='border-2 h-full'>
                    <CardHeader>
                      <div className='flex flex-rows items-center justify-between'>
                        <div className='text-lg font-bold'>
                          {
                            isAccountsLoading 
                              ? <Skeleton className='h-4 w-[140px] bg-gray-300' /> 
                              : account?.name
                          }
                        </div>
                        <div className='text-md text-gray-600 font-normal'>
                          {
                            isAccountsLoading 
                              ? <Skeleton className='h-4 w-[140px] bg-gray-300' />
                              : account?.type
                          }
                        </div>
                      </div>
                    </CardHeader>
                    <Separator className='-mt-2'/>
                    <CardContent className='space-y-2'>
                      <div className='flex flex-col'>
                        <h3 className='text-gray-600 font-normal text-lg'>
                          Balance
                        </h3>
                        {isAccountsLoading ? (
                          <h1 className='text-2xl font-extrabold flex'>
                            <Skeleton className='h-10 w-[50%] bg-gray-300'/>
                          </h1>               
                        ):(
                          <h1 className='text-2xl font-extrabold'>
                            PHP {formatAmount(account?.totalBalance)}
                          </h1> 
                        )}
                      </div>
                    </CardContent>
                  </Card>              
                </Link>
              ))}
            </div>
          </>
        )}        
      </section>
    </main>
  )
};
