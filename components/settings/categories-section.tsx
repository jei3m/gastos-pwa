'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Category } from '@/types/categories.types';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import {
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Tabs } from '@radix-ui/react-tabs';
import { TypographyH4 } from '@/components/custom/typography';
import PulseLoader from '@/components/custom/pulse-loader';
import CategoryCard from '@/components/categories/category-card';
import { cn, chunkArray } from '@/lib/utils';
import { categoryTypes } from '@/lib/data';
import { PlusIcon } from 'lucide-react';

interface CategoriesSectionProps {
  categories: Category[];
  isCategoriesLoading: boolean;
  isMobile: boolean;
  activeTab: string;
  onTabChange: (value: string) => void;
}

export default function CategoriesSection({
  categories,
  isCategoriesLoading,
  isMobile,
  activeTab,
  onTabChange,
}: CategoriesSectionProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const itemsPerPage = isMobile ? 4 : 6;

  useEffect(() => {
    if (!api) return;

    const updateState = () => {
      setCount(api.scrollSnapList().length);
      setCurrent(api.selectedScrollSnap());
    };

    updateState();
    api.on('select', updateState);

    return () => {
      api.off('select', updateState);
    };
  }, [api]);

  const handleTabChange = (value: string) => {
    onTabChange(value);
    api?.scrollTo(0);
  };

  if (isCategoriesLoading) {
    return <PulseLoader />;
  }

  return (
    <section className={cn('space-y-4')}>
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
      >
        <div className="flex justify-between items-center">
          <TypographyH4 className="font-semibold">
            Categories
          </TypographyH4>
          <TabsList
            defaultValue="expense"
            className="border-black border-2 p-1"
          >
            {categoryTypes.map((type, index) => (
              <TabsTrigger
                value={type.toLowerCase()}
                key={index}
                className={cn(
                  'text-sm md:text-md',
                  type === 'Expense'
                    ? 'data-[state=active]:bg-red-400'
                    : 'data-[state=active]:bg-green-300'
                )}
              >
                {type}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>
      <Separator className="-mt-2 bg-muted-foreground" />
      {categories && categories.length > 0 ? (
        <>
          <Carousel setApi={setApi} className="w-full">
            <CarouselContent>
              {chunkArray(categories, itemsPerPage).map(
                (pageCategories, pageIndex) => (
                  <CarouselItem key={pageIndex}>
                    <div className="grid md:grid-cols-2 gap-2 md:gap-4">
                      {(pageCategories as Category[]).map(
                        (category) => (
                          <CategoryCard
                            key={category.id}
                            category={category}
                            hideAmount={true}
                            showDescription={true}
                          />
                        )
                      )}
                    </div>
                  </CarouselItem>
                )
              )}
            </CarouselContent>
          </Carousel>
          {categories.length > 0 && (
            <div className="flex justify-center items-center gap-2 mt-2">
              <button
                onClick={() => api?.scrollPrev()}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <div className="flex gap-1.5">
                {chunkArray(categories, itemsPerPage).map(
                  (_, index) => (
                    <button
                      key={index}
                      onClick={() => api?.scrollTo(index)}
                      className={cn(
                        'w-2 h-2 rounded-full transition-all',
                        current === index
                          ? 'bg-primary w-4'
                          : 'bg-gray-300'
                      )}
                    />
                  )
                )}
              </div>
              <button
                onClick={() => api?.scrollNext()}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-10">
          <TypographyH4 className="text-gray-400 font-semibold text-center">
            No Categories
          </TypographyH4>
          <p className="text-gray-500 text-sm text-center">
            Start by adding your first category
          </p>
        </div>
      )}
      <Link
        className="w-full"
        href={'/pages/categories/add'}
      >
        <Button className="w-full">
          <PlusIcon size={40} className="-mr-1" /> Add New
          Category
        </Button>
      </Link>
    </section>
  );
}
