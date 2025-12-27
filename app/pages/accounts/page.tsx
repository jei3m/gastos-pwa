"use client";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import PulseLoader from "@/components/custom/pulse-loader";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader,
} from "@/components/ui/card";
import { formatAmount } from "@/utils/format-amount";
import { Skeleton } from "@/components/ui/skeleton";
import { TypographyH4 } from "@/components/custom/typography";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { accountsQueryOptions } from "@/lib/tq-options/accounts.tq.options";
import { useQuery } from "@tanstack/react-query";
import { Account } from "@/types/accounts.types";


export default function Accounts() {
  const [isScrolled, setIsScrolled] = useState(false);
  const isMobile = useIsMobile();
  const router = useRouter();

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
    window.scroll(0, 0);
    setIsScrolled(false);
  }, []);

  const { data: accounts, isPending: isAccountsLoading} = useQuery(
    accountsQueryOptions()
  );

  const calculateNetWorth = () => {
    if (!accounts) return '0.00';
    
    // Sum up all account balances
    const netWorth = accounts.reduce((total: number, account: Account) => {
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
		<main className={`flex flex-col space-y-2 min-h-screen
      ${isMobile ? 'pb-15' : 'pb-18'}
    `}>
      <section className={`
        transition-all duration-150
        ease-in-out
        ${
          isScrolled && isMobile
            ? 'sticky top-0 z-10'
            : 'pt-2 px-3'
        }
      `}>
        <Card className={`
            ${
              isScrolled && isMobile
                ? `-mt-2 ${isMobile ? 'border-0 rounded-none' : 'border-2'}` 
                : 'border-2 mt-0'
            }
          `}
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
        {isMobile && isScrolled && (
          <div className='w-full border-t-2 border-black' />
        )}
      </section>

      {/* Accounts Section */}
      <section className='flex flex-col space-y-2 px-3 mb-2'>
        <TypographyH4>
          Accounts
        </TypographyH4>
        {isAccountsLoading || !accounts ? (
          <PulseLoader/>
        ):(
          <>
            <div className="grid md:grid-cols-2 gap-2">
              {accounts.map((account: Account) => (
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
