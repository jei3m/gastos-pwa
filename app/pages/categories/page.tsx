'use client';
import { useEffect, useState } from 'react';
import { categoryTypes } from '@/lib/data';
import { useIsMobile } from '@/hooks/use-mobile';
import { Category } from '@/types/categories.types';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
// Icon Imports
import { ArrowDown, ArrowUp } from 'lucide-react';
import { TypographyH4 } from '@/components/custom/typography';
import { useAccount } from '@/context/account-context';
import DateSelectCard from '@/components/custom/date-select-card';
import PulseLoader from '@/components/custom/pulse-loader';
import { formatAmount } from '@/utils/format-amount';
import CategoryCard from '@/components/categories/category-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { categoryQueryOptions } from '@/lib/tq-options/categories.tq.options';
import NoSelectedAccountDiv from '@/components/custom/no-selected-account-div';

export default function Categories() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [dateStart, setDateStart] = useState<string>('');
  const [dateEnd, setDateEnd] = useState<string>('');
  const [categoryType, setCategoryType] =
    useState('expense');
  const [categories, setCategories] = useState<Category[]>(
    []
  );
  const [totalIncome, setTotalIncome] =
    useState<string>('0.00');
  const [totalExpense, setTotalExpense] =
    useState<string>('0.00');
  const { selectedAccountID } = useAccount();
  const isMobile = useIsMobile();

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
    window.scroll(0, 0);
    setIsScrolled(false);
  }, []);

  // Function to handle previous or next
  const handleDateRangeChange = (
    start: string,
    end: string
  ) => {
    setDateStart(start);
    setDateEnd(end);
  };

  const calculateBalance = () => {
    if (!totalIncome || !totalExpense) return '0.00';

    const total =
      Number(totalIncome) - Number(totalExpense);

    return total.toFixed(2);
  };

  const { data, isPending, error } = useQuery(
    categoryQueryOptions(
      categoryType,
      selectedAccountID,
      dateStart,
      dateEnd
    )
  );

  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
    setCategories(data?.[0]?.details);
    setTotalIncome(data?.[0]?.totalIncome || '0.00');
    setTotalExpense(data?.[0]?.totalExpense || '0.00');
  }, [data, error]);

  // Set isScrolled
  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', onScroll, {
      passive: true,
    });
    return () =>
      window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <main
      className={`flex flex-col space-y-2 min-h-screen
      ${isMobile ? 'pb-15' : 'pb-18'}
    `}
    >
      {/* Date Card Section */}
      <DateSelectCard
        isScrolled={isScrolled}
        onDateRangeChange={handleDateRangeChange}
        content={
          <>
            <div className="flex flex-col md:flex-row gap-2 md:justify-between md:items-center">
              <div className="flex flex-col">
                <h3 className="text-gray-600 font-normal text-lg">
                  Balance
                </h3>
                <h1 className="text-2xl font-extrabold">
                  {isPending ? (
                    <Skeleton className="h-[30px] w-[140px] bg-gray-300" />
                  ) : (
                    `PHP ${formatAmount(calculateBalance())}`
                  )}
                </h1>
              </div>
              <div className="w-full md:w-[64%] flex space-x-2">
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
                    <div className="text-md lg:text-lg">
                      Income
                    </div>
                    <div className="text-xl font-bold">
                      {isPending ? (
                        <Skeleton className="h-[30px] w-[100px] bg-green-300" />
                      ) : (
                        `${formatAmount(totalIncome)}`
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
                    <div className="text-md lg:text-lg">
                      Expense
                    </div>
                    <div className="text-xl font-bold">
                      {isPending ? (
                        <Skeleton className="h-[30px] w-[100px] bg-red-300" />
                      ) : (
                        `${formatAmount(totalExpense)}`
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        }
      />

      {/* Categories Section */}
      <section className="flex flex-col space-y-2 px-3 mb-2">
        <Tabs
          defaultValue="expense"
          value={categoryType}
          onValueChange={setCategoryType}
        >
          <div className="flex flex-row justify-between items-center w-full">
            <TypographyH4>Categories</TypographyH4>
            <TabsList
              defaultValue="expense"
              className="border-black border-2 p-1"
            >
              {categoryTypes.map((type, index) => (
                <TabsTrigger
                  value={type.toLowerCase()}
                  key={index}
                  className={`${
                    type === 'Expense'
                      ? 'data-[state=active]:bg-red-400'
                      : 'data-[state=active]:bg-green-300'
                  }`}
                >
                  {type}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
        {isPending ? (
          <PulseLoader />
        ) : (
          <>
            {selectedAccountID ? (
              <>
                {categories && categories.length > 0 ? (
                  <div className="grid lg:grid-cols-2 gap-2">
                    {categories.map(
                      (category: Category) => (
                        <CategoryCard
                          key={category.id}
                          category={category}
                          hideAmount={false}
                        />
                      )
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10">
                    <TypographyH4 className="text-gray-400 font-semibold text-center">
                      No Categories
                    </TypographyH4>
                    <p className="text-gray-500 text-sm text-center">
                      No {categoryType} activity for this
                      period
                    </p>
                  </div>
                )}
              </>
            ) : (
              <NoSelectedAccountDiv data="categories" />
            )}
          </>
        )}
      </section>
    </main>
  );
}
