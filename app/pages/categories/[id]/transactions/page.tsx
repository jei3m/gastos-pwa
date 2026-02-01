'use client';
import { useEffect, useMemo } from 'react';
import { TypographyH4 } from '@/components/custom/typography';
import { useAccount } from '@/context/account-context';
import PulseLoader from '@/components/custom/pulse-loader';
import TransactionCard from '@/components/transactions/transaction-card';
import { useInfiniteQuery } from '@tanstack/react-query';
import { transactionsByCategoryInfiniteQueryOptions } from '@/lib/tq-options/transactions.tq.options';
import NoSelectedAccountDiv from '@/components/custom/no-selected-account-div';
import {
  useParams,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function Transactions() {
  const { selectedAccountID } = useAccount();
  const params = useParams();
  const categoryID = params.id as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateStart =
    searchParams.get('dateStart') || undefined;
  const dateEnd = searchParams.get('dateEnd') || undefined;

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
    window.scroll(0, 0);
  }, []);

  const {
    data: transactionsData,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isPending,
  } = useInfiniteQuery(
    transactionsByCategoryInfiniteQueryOptions(
      selectedAccountID,
      categoryID,
      dateStart,
      dateEnd
    )
  );

  const transactions = useMemo(() => {
    return transactionsData?.pages?.flatMap(
      (item) => item.data
    );
  }, [transactionsData]);

  // Handle scroll for pagination
  useEffect(() => {
    const handleScroll = () => {
      if (isFetchingNextPage || !hasNextPage) return;

      const scrollPosition =
        window.innerHeight +
        document.documentElement.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight;
      const isBottomReached =
        scrollPosition + 1 >= scrollHeight;

      if (isBottomReached) {
        fetchNextPage();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () =>
      window.removeEventListener('scroll', handleScroll);
  }, [isFetchingNextPage, hasNextPage]);

  return (
    <main
      className={`flex flex-col space-y-2 min-h-screen pb-18`}
    >
      {/* Transactions Section */}
      <section className="flex flex-col space-y-2 px-3 mb-2">
        <div className="flex flex-row items-center pt-2 -ml-1">
          <div
            onClick={() => router.back()}
            className="flex items-center cursor-pointer"
          >
            <ChevronLeft className="mr-2" size={22} />
            <TypographyH4>Transactions</TypographyH4>
          </div>
        </div>
        {!selectedAccountID ? (
          <NoSelectedAccountDiv data="transactions" />
        ) : isPending ? (
          <PulseLoader />
        ) : (
          <>
            {transactions && transactions.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 gap-2">
                  {transactions.map(
                    (transaction, index) => (
                      <TransactionCard
                        transaction={transaction}
                        key={index}
                      />
                    )
                  )}
                </div>
                {isFetchingNextPage && (
                  <PulseLoader className="mt-0" />
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <TypographyH4 className="text-gray-400 font-semibold text-center">
                  No Transactions
                </TypographyH4>
                <p className="text-gray-500 text-sm text-center">
                  No existing transactions for this period
                  and category
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
