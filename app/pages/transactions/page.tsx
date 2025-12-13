"use client"
import { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { TypographyH4 } from '@/components/custom/typography';
import { fetchTransactions, fetchTransactionsCount } from '@/lib/store/transactions.store';
import { Transaction } from '@/types/transactions.types';
import { toast } from 'sonner';
import { useAccount } from '@/context/account-context';
import PulseLoader from '@/components/custom/pulse-loader';
import { Button } from '@/components/ui/button';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { fetchAccountByID } from '@/lib/store/accounts.store';
import { Account } from '@/types/accounts.types';
import { Skeleton } from '@/components/ui/skeleton';
import TransactionCard from '@/components/transactions/transaction-card';
import { formatAmount } from '@/utils/format-amount';
import TotalAmountSection from '@/components/transactions/total-amount-section';

export default function Transactions() {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [account, setAccount] = useState<Account>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsCount, setTransactionsCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMoreLoading, setIsMoreLoading] = useState<boolean>(false);
  const isMobile = useIsMobile();
  const { selectedAccountID, refetchAccountsData  } = useAccount();
  const router = useRouter();

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
    window.scroll(0, 0);
		setIsScrolled(false);
  }, []);

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
    if (selectedAccountID && page) {
      setIsMoreLoading(true);
      fetchTransactions(selectedAccountID, page)
        .then((data) => {
          setTransactions((prev) => {
            const combinedData = [...prev, ...data]; 
            const uniqueData = new Set();
            // Remove duplicates accdg to transaction.date
            return combinedData.filter(transaction => {
              if (uniqueData.has(transaction.date)) {
                return false;
              };
              uniqueData.add(transaction.date);
              return true;
            })
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
  }, [selectedAccountID, page]);

  // Reset state when selectedAccountID changes
  useEffect(() => {
    setTransactions([]);
    setPage(1);
  }, [selectedAccountID]);

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
      ${isMobile ? 'pb-18' : 'pb-20'}
    `}>
      {/* Total Amount Section */}
      <TotalAmountSection 
        isLoading={isLoading}
        isScrolled={isScrolled}
        account={account}
        isMobile={isMobile}
      />

      {/* Transactions Section */}
      <section className='flex flex-col space-y-2 px-3 mb-2'>
        <TypographyH4>
          Recent Transactions
        </TypographyH4>
        {isLoading || !account ? (
          <PulseLoader/>
        ):(
          <>
            {transactions && transactions.length > 0 ? (
              <>
                {transactions.map((transaction, index) => (
                  <TransactionCard 
                    transaction={transaction}
                    key={index}
                  />
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
