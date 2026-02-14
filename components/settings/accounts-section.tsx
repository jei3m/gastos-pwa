'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Account } from '@/types/accounts.types';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { TypographyH4 } from '@/components/custom/typography';
import PulseLoader from '@/components/custom/pulse-loader';
import { cn, chunkArray } from '@/lib/utils';
import { PlusIcon } from 'lucide-react';

interface AccountsSectionProps {
  accounts: Account[];
  isAccountsLoading: boolean;
  isMobile: boolean;
}

export default function AccountsSection({
  accounts,
  isAccountsLoading,
  isMobile,
}: AccountsSectionProps) {
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

  if (isAccountsLoading) {
    return <PulseLoader />;
  }

  return (
    <section className={cn('space-y-4')}>
      <TypographyH4 className="font-semibold">
        Accounts
      </TypographyH4>
      <Separator className="-mt-2 bg-muted-foreground" />
      {accounts && accounts.length > 0 ? (
        <>
          <Carousel setApi={setApi} className="w-full">
            <CarouselContent>
              {chunkArray(accounts, itemsPerPage).map(
                (pageAccounts, pageIndex) => (
                  <CarouselItem key={pageIndex}>
                    <div className="grid md:grid-cols-2 gap-2 md:gap-4">
                      {pageAccounts.map(
                        (account: Account) => (
                          <Link
                            href={`/pages/accounts/${account.id}`}
                            key={account.id}
                          >
                            <Card className="border-2 h-full">
                              <CardHeader>
                                <div className="flex flex-rows items-center justify-between">
                                  <div className="text-lg md:text-xl font-bold">
                                    {isAccountsLoading ? (
                                      <Skeleton className="h-4 w-[140px] bg-gray-300" />
                                    ) : (
                                      account?.name
                                    )}
                                  </div>
                                  <div className="text-md text-gray-600 font-normal">
                                    {isAccountsLoading ? (
                                      <Skeleton className="h-4 w-[140px] bg-gray-300" />
                                    ) : (
                                      account?.type
                                    )}
                                  </div>
                                </div>
                              </CardHeader>
                              <Separator className="-mt-2" />
                              <CardContent className="text-md md:text-lg space-y-2 break-all">
                                {account.description}
                              </CardContent>
                            </Card>
                          </Link>
                        )
                      )}
                    </div>
                  </CarouselItem>
                )
              )}
            </CarouselContent>
          </Carousel>
          {accounts.length > itemsPerPage && (
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
                {chunkArray(accounts, itemsPerPage).map(
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
            No Accounts
          </TypographyH4>
          <p className="text-gray-500 text-sm text-center">
            Start by adding your first account
          </p>
        </div>
      )}
      <Link className="w-full" href={'/pages/accounts/add'}>
        <Button className="w-full">
          <PlusIcon size={40} className="-mr-1" /> Add New
          Account
        </Button>
      </Link>
    </section>
  );
}
