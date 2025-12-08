"use client"
import { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TypographyH4 } from '@/components/custom/typography';
import { fetchTransactions, fetchTransactionsCount } from '@/store/transactions.store';
import { Transaction, TransactionDetails } from '@/types/transactions.types';
import { toast } from 'sonner';
import { useAccount } from '@/context/account-context';
import Link from 'next/link';
import PulseLoader from '@/components/custom/pulse-loader';
import { Button } from '@/components/ui/button';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { fetchAccountByID } from '@/store/accounts.store';
import { Account } from '@/types/accounts.types';
import { Skeleton } from '@/components/ui/skeleton';

export default function Transactions() {
  const [account, setAccount] = useState<Account>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsCount, setTransactionsCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMoreLoading, setIsMoreLoading] = useState<boolean>(false);
  const isMobile = useIsMobile();
  const { selectedAccountID  } = useAccount();
  const router = useRouter();

  // Fetch Account Data
  useEffect(() => {
    if (selectedAccountID) {
      const fetchInitialDetails = async() => {
        try {
          setIsLoading(true);
          const [accountData, transactionCountData] = await Promise.all([
            fetchAccountByID(selectedAccountID),
            fetchTransactionsCount(selectedAccountID)
          ]);
          setAccount(accountData[0]);
          setTransactionsCount(transactionCountData[0].count);   
        } catch (error) {
          if (error instanceof Error) {
            toast.error(error.message)
          } else {
            toast.error('Failed to Fetch Account Details')
          };
        } finally {
          setIsLoading(false);
        }
      };
      fetchInitialDetails();
    }
  }, [selectedAccountID]);

  // Fetch Transactions
  useEffect(() => {
    if (selectedAccountID && account && transactionsCount) {
      setIsMoreLoading(true);
      fetchTransactions(selectedAccountID, page)
        .then((data) => {
          setTransactions((prev) => {
            return [
              ...prev,
              ...data
            ]
          });            
        })
        .catch((error) => {
          if (error instanceof Error) {
            toast.error(error.message)
          };
        })
        .finally(() => {
          setIsMoreLoading(false);
        })
    }
  }, [selectedAccountID, account, transactionsCount, page]);

  // Reset state when selectedAccountID changes
  useEffect(() => {
    setTransactions([]);
    setPage(1);
  }, [selectedAccountID]);

  // If transactions already exist, stop isLoading
  useEffect(() => {
    if (!transactions) return;
    setIsLoading(false);
  }, [transactions])

  // Handle scroll for pagination
  useEffect(() => {
    const handleScroll = () => {
      if (isLoading || transactions.length >= transactionsCount) return;
      
      const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const isBottomReached = scrollPosition + 1 >= scrollHeight;
      
      if (isBottomReached) {
        setPage((prev) => prev + 1);
      };
    }; 
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoading, transactions, transactionsCount]);

  return (
    <main className={`flex flex-col space-y-2 min-h-screen
      ${isMobile ? 'pb-18 mt-14' : 'pb-20 mt-16'}
    `}>
      {/* Total Amount Section */}
      <section className='pt-2 px-3'>
        <Card className='border-2 bg-white'>
          <CardHeader>
            <div className='flex flex-rows items-center justify-between'>
              <div className='text-xl font-bold'>
                {
                  account 
                    ? account?.name 
                    : <Skeleton className='h-4 w-[140px] bg-gray-300' />
                }
              </div>
              <div className='text-md text-gray-600 font-normal'>
                {
                  account 
                    ? account?.type 
                    : <Skeleton className='h-4 w-[140px] bg-gray-300' />
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
              {isLoading || !account ? (
                <h1 className='text-2xl font-extrabold flex'>
                  <Skeleton className='h-10 w-full bg-gray-300'/>
                </h1>               
              ):(
                <h1 className='text-2xl font-extrabold'>
                  PHP {account?.totalBalance}
                </h1> 
              )}
            </div>
            <div className='w-full flex flex-row justify-center space-x-2'>
              <Button
                className='w-[50%] flex flex-row -space-x-1'
                onClick={() => router.push(`/pages/transactions/add?type=income`)}
              >
                <ArrowDownLeft strokeWidth={3}/>
                <span>
                  Income
                </span>
              </Button>
              <Button
                variant='destructive'
                className='w-[50%] flex flex-row -space-x-1'
                onClick={() => router.push(`/pages/transactions/add?type=expense`)}
              >
                <ArrowUpRight strokeWidth={3}/>
                <span>
                  Expense
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>  
      </section>

      {/* Transactions Section */}
      <section className='flex flex-col space-y-2 px-3 mb-2'>
        <TypographyH4>
          Transactions
        </TypographyH4>
        {isLoading || !account || !transactions ? (
          <PulseLoader/>
        ):(
          <>
            {transactions.length > 0 ? (
              <>
                {transactions.map((transaction, index) => (
                  <Card key={index} className='border-2'>
                    <CardHeader>
                      <CardTitle className='flex justify-between'>
                        <span>
                          {new Date(transaction.date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                        <span
                          className={
                            `${
                              transaction.total.startsWith('-')
                                ? 'text-red-500'
                                : 'text-primary'
                            }`
                          }
                        >
                          PHP {transaction.total}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <div className='w-full border-t border-gray-300' />
                    <CardContent className='-mb-4'>
                      {transaction.details.map((detail: TransactionDetails, index: number) => (
                        <Link key={index} href={`transactions/${detail.id}`}>
                          <div className='space-y-3 flex flex-row items-center justify-between'>
                              <div className='flex flex-col text-sm'>
                                <span>
                                  {detail.category}
                                </span>
                                <span className='text-gray-600'>
                                  {detail.note}
                                </span>
                              </div>
                              <span className={`text-sm ${detail.type === 'income' ? 'text-primary' : 'text-red-500'}`}>
                              PHP
                                {
                                  detail.type === 'income'
                                    ? ' +'
                                    : ' -'
                                }
                              {detail.amount.toFixed(2)}
                              </span>                      
                          </div>
                        </Link>
                      ))}
                    </CardContent>
                  </Card>
                ))}
                {isMoreLoading && (
                  <PulseLoader className='mt-0'/>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <TypographyH4 className='text-gray-400 font-semibold text-center'>
                  No Transactions
                </TypographyH4>
                <p className="text-gray-500 text-sm text-center">
                  Start by adding your first transaction
                </p>
              </div>
            )}          
          </>
        )}
      </section>
    </main>
  );
};
