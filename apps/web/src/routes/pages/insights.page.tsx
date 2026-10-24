import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { categoryTypes } from '@/lib/data';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ArrowDown, ArrowUp, Inbox } from 'lucide-react';
import { TypographyH4 } from '@/components/custom/typography';
import { useAccount } from '@/context/account-context';
import DateSelectCard from '@/components/custom/date-select-card';
import PulseLoader from '@/components/custom/pulse-loader';
import { formatAmount } from '@/lib/format-amount';
import CategoryCard from '@/components/categories/category-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import NoSelectedAccountDiv from '@/components/custom/no-selected-account-div';
import { cn } from '@/lib/utils';
import { CategoryPieChart } from '@/components/categories/categories-pie-chart-card';
import { insightsQueryOptions } from '@/features/insights/insights.tq.options';
import type { InsightsData } from '@/features/insights/insights.interface';

export default function InsightsPage() {
  const [categoryType, setCategoryType] = useState<
    'income' | 'expense'
  >('expense');
  const { selectedAccountID } = useAccount();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [dateStart, setDateStart] = useState(() => {
    const urlDateStart = searchParams.get('dateStart');
    return urlDateStart || '';
  });
  const [dateEnd, setDateEnd] = useState(() => {
    const urlDateEnd = searchParams.get('dateEnd');
    return urlDateEnd || '';
  });

  const handleDateRangeChange = (
    start: string,
    end: string
  ) => {
    setDateStart(start);
    setDateEnd(end);
    const params = new URLSearchParams();
    if (start) params.set('dateStart', start);
    if (end) params.set('dateEnd', end);
    void navigate(`/insights?${params.toString()}`);
  };

  const calculateBalance = () => {
    if (!totalIncome || !totalExpense) return '0.00';

    const total =
      Number(totalIncome) - Number(totalExpense);

    return total.toFixed(2);
  };

  const { data, isPending, error } = useQuery(
    insightsQueryOptions(
      categoryType,
      selectedAccountID,
      !!categoryType && !!selectedAccountID,
      dateStart,
      dateEnd
    )
  );

  const { categories, totalIncome, totalExpense } =
    useMemo(() => {
      const result = data as InsightsData[];
      return {
        categories: result?.[0]?.categories || [],
        totalIncome: result?.[0]?.totalIncome || '0.00',
        totalExpense: result?.[0]?.totalExpense || '0.00',
      };
    }, [data]);

  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  return (
    <main
      className={cn(
        'flex flex-col space-y-4 md:space-y-6 overflow-y-auto',
        isMobile ? 'h-screen pb-29' : 'pb-4'
      )}
    >
      <DateSelectCard
        onDateRangeChange={handleDateRangeChange}
        content={
          <>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col">
                <h3 className="text-gray-600 font-normal text-lg md:text-xl">
                  Balance
                </h3>
                <h1 className="text-2xl md:text-3xl font-extrabold">
                  {isPending ? (
                    <Skeleton className="h-[30px] w-[140px] bg-gray-300" />
                  ) : (
                    `PHP ${formatAmount(calculateBalance())}`
                  )}
                </h1>
              </div>
              <div className="w-full flex space-x-2">
                <div
                  className="
								bg-primary 
								w-[50%] flex flex-row
								justify-between items-center text-white
								border-2 rounded-xl h-16 container p-2"
                >
                  <div>
                    <ArrowDown size={32} />
                  </div>
                  <div className="text-right -space-y-1">
                    <div className="text-md md:text-lg">
                      Income
                    </div>
                    <div className="text-xl md:text-2xl font-bold">
                      {isPending ? (
                        <Skeleton className="h-[30px] w-[100px] bg-green-300" />
                      ) : (
                        `${totalIncome.toLocaleString()}`
                      )}
                    </div>
                  </div>
                </div>
                <div
                  className="
								bg-red-500
								w-[50%] flex flex-row
								justify-between items-center text-white
								border-2 rounded-xl h-16 container p-2"
                >
                  <div>
                    <ArrowUp size={32} />
                  </div>
                  <div className="text-right -space-y-1">
                    <div className="text-md md:text-lg">
                      Expense
                    </div>
                    <div className="text-xl md:text-2xl font-bold">
                      {isPending ? (
                        <Skeleton className="h-[30px] w-[100px] bg-red-300" />
                      ) : (
                        `${totalExpense.toLocaleString()}`
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        }
      />

      <section
        className={cn(
          'flex flex-col space-y-2 md:space-y-4 px-3'
        )}
      >
        <Tabs
          defaultValue="expense"
          value={categoryType}
          onValueChange={setCategoryType}
        >
          <div className="flex flex-row justify-between items-center w-full">
            <TypographyH4>Breakdown</TypographyH4>
            <TabsList className="border-black border-2 p-1">
              {categoryTypes.map((type, index) => (
                <TabsTrigger
                  value={type.toLowerCase()}
                  key={index}
                  className={`${
                    type === 'Expense'
                      ? 'data-active:bg-red-400'
                      : 'data-active:bg-green-300'
                  }`}
                >
                  {type}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
        {!selectedAccountID ? (
          <NoSelectedAccountDiv data="categories" />
        ) : isPending ? (
          <PulseLoader />
        ) : (
          <CategoryPieChart
            categories={categories}
            categoryType={categoryType}
            dateStart={dateStart}
            dateEnd={dateEnd}
          />
        )}
      </section>

      <section
        className={cn(
          'flex flex-col space-y-2 md:space-y-4 px-3 mb-2'
        )}
      >
        <TypographyH4>Categories</TypographyH4>
        {!selectedAccountID ? (
          <NoSelectedAccountDiv data="categories" />
        ) : isPending ? (
          <PulseLoader />
        ) : categories && categories.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 md:gap-4">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                hideAmount={false}
                isEdit={false}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
            <div>
              <Inbox size={80} strokeWidth={1.5} />
            </div>
            <p className="text-sm text-center">
              No {categoryType} activity for this period
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
