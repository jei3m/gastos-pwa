'use client';
import { createElement, useEffect, useMemo } from 'react';
import {
  TypographyH4,
  TypographyH5,
} from '@/components/custom/typography';
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
import { ChevronLeft, SquareDashed } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getIconById } from '@/lib/icons';
import { formatAmount } from '@/utils/format-amount';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useScrollState } from '@/hooks/use-scroll-state';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export default function Transactions() {
  const { selectedAccountID } = useAccount();
  const params = useParams();
  const categoryID = params.id as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateStart =
    searchParams.get('dateStart') || undefined;
  const dateEnd = searchParams.get('dateEnd') || undefined;
  const isScrolled = useScrollState();
  const isMobile = useIsMobile();

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

  const category = useMemo(() => {
    return (
      transactionsData?.pages[0]?.categoryDetails[0] || {
        id: '',
        name: '',
        type: '',
        icon: '',
        description: '',
        refUserID: '',
        totalAmount: 0,
      }
    );
  }, [transactionsData]);

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
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  const isExpense = (type: string) => {
    return type === 'Expense';
  };

  return (
    <main className="flex flex-col space-y-2 md:space-y-4 min-h-screen pb-18">
      {/* Category Details Section */}
      <section
        className={cn(
          'transition-all ease-in-out',
          isScrolled && isMobile
            ? 'sticky top-0 z-10'
            : 'pt-2 md:pt-4 px-3'
        )}
      >
        <Card
          className={cn(
            'border-2',
            isScrolled && isMobile
              ? `${isMobile ? 'border-0 rounded-none' : 'border-2'}`
              : 'border-2 mt-0'
          )}
        >
          <CardHeader className="flex flex-row justify-between items-center">
            <div className="flex flex-row space-x-2 items-center">
              <div
                className={cn(
                  'p-1.5 rounded-lg border-2',
                  !category.type
                    ? 'bg-white'
                    : isExpense(category.type)
                      ? 'bg-red-500'
                      : 'bg-primary'
                )}
              >
                {createElement(
                  getIconById(category.icon)?.icon ||
                    SquareDashed,
                  { size: 30 }
                )}
              </div>
              <div>
                {isPending ? (
                  <Skeleton className="h-6 w-32 bg-gray-300" />
                ) : (
                  <TypographyH5 className="font-semibold">
                    {category.name}
                  </TypographyH5>
                )}
              </div>
            </div>
            <div className="text-right">
              <CardDescription className="text-sm md:text-md">
                Total Amount:
              </CardDescription>
              <CardTitle
                className={cn(
                  'text-md md:text-xl',
                  isExpense(category.type)
                    ? 'text-red-500'
                    : 'text-primary'
                )}
              >
                PHP {isExpense(category.type) ? '-' : '+'}
                {formatAmount(category.totalAmount)}
              </CardTitle>
            </div>
          </CardHeader>
          <Separator />
          {isPending ? (
            <CardContent className="-mb-2">
              <Skeleton className="h-6 w-[50%] bg-gray-300" />
            </CardContent>
          ) : (
            <CardContent className="-mb-2 text-md md:text-lg">
              {category.description}
            </CardContent>
          )}
        </Card>
        {isMobile && isScrolled && (
          <div className="w-full border-t-2 border-black" />
        )}
      </section>

      {/* Transactions Section */}
      <section className="flex flex-col space-y-2 md:space-y-4 px-3 mb-2">
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
                <div className="grid gap-2 md:gap-4">
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
