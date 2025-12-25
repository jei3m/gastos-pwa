"use client";
import { useEffect, useMemo, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { TypographyH4 } from '@/components/custom/typography';
import { useAccount } from '@/context/account-context';
import PulseLoader from '@/components/custom/pulse-loader';
import TransactionCard from '@/components/transactions/transaction-card';
import TotalAmountSection from '@/components/transactions/total-amount-section';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { transactionsInfiniteQueryOptions } from '@/lib/tq-options/transactions.tq.options';
import { accountByIDQueryOptions } from '@/lib/tq-options/accounts.tq.options';

export default function Transactions() {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const isMobile = useIsMobile();
  const { selectedAccountID } = useAccount();

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
    window.scroll(0, 0);
		setIsScrolled(false);
  }, []);

  const { data: account, isPending: isAccountLoading } = useQuery(
    accountByIDQueryOptions(
      selectedAccountID!
    )
  );

  const { 
    data: transactionsData, 
    hasNextPage, 
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery(
    transactionsInfiniteQueryOptions(
      selectedAccountID!
    )
  );

  const transactions = useMemo(() => {
    return transactionsData?.pages?.flatMap((item) => item.data)
  }, [transactionsData]);

  // Handle scroll for pagination
  useEffect(() => {
    const handleScroll = () => {
      if (isFetchingNextPage || !hasNextPage) return;
      
      const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const isBottomReached = scrollPosition + 1 >= scrollHeight;
      
      if (isBottomReached) {
        fetchNextPage();
      };
    }; 
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isFetchingNextPage, hasNextPage]);

  // Set isScrolled
  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <main className={`flex flex-col space-y-2 min-h-screen pb-18`}>
      {/* Total Amount Section */}
      <TotalAmountSection 
        isLoading={isAccountLoading}
        isScrolled={isScrolled}
        account={account}
        isMobile={isMobile}
      />

      {/* Transactions Section */}
      <section className='flex flex-col space-y-2 px-3 mb-2'>
        <TypographyH4>
          Recent Transactions
        </TypographyH4>
        {isAccountLoading ? (
          <PulseLoader/>
        ):(
          <>
            {transactions && transactions.length > 0 ? (
              <div className='grid md:grid-cols-2 gap-2'>
                {transactions.map((transaction, index) => (
                  <TransactionCard 
                    transaction={transaction}
                    key={index}
                  />
                ))}
                {isFetchingNextPage && (
                  <PulseLoader className='mt-0'/>
                )}
              </div>
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
