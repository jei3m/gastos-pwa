"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { tabItems, transactions } from '@/lib/data';
import { fetchSession } from '@/utils/session';
import { useIsMobile } from '@/hooks/use-mobile';

// ShadCN Components
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Tabs,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";

// Icon Imports
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { TypographyH4 } from '@/components/custom/typography';
import { Button } from '@/components/ui/button';

export default function Transactions() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const router = useRouter();
  const isMobile = useIsMobile();

  // Validate user session
  useEffect(() => {
    fetchSession().then(({ session }) => {
      if (!session) {
        router.push('/auth/login')
      }
    })
  }, [router]);

  // Set isScrolled
  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Function to handle previous or next 
  const handleDateChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (activeTab === 'daily') {
      newDate.setDate(
        newDate.getDate() + (direction === 'prev' ? -1 : 1)
      );
    } else if (activeTab === 'weekly') {
      newDate.setDate(
        newDate.getDate() + (direction === 'prev' ? -7 : 7)
      );
    } else {
      newDate.setMonth(
        newDate.getMonth() + (direction === 'prev' ? -1 : 1)
      );
    }
    setCurrentDate(newDate);
  };

  // Return dateStart, dateEnd, and dateDisplay
  const getDateRange = () => {
    const toISODate = (d: Date) => d.toISOString().slice(0, 10);
    const date = new Date(currentDate);

    if (activeTab === 'daily') {
      const dateStart = new Date(date),
        dateEnd = new Date(date);
      return {
        dateStart: toISODate(dateStart),
        dateEnd: toISODate(dateEnd),
        dateDisplay: dateStart.toLocaleDateString(
          'en-US',
          {
            month: 'long',
            day: 'numeric'
          }
        )
      }
    } else if (activeTab === 'weekly') {
      const dateStart = new Date(date),
        dayOfWeek = dateStart.getDay(),
        diff = dateStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1),
        dateEnd = new Date(dateStart);

      // Set dateStart and dateEnd
      dateStart.setDate(diff);
      dateEnd.setDate(dateStart.getDate() + 6);

      return {
        dateStart: toISODate(dateStart),
        dateEnd: toISODate(dateEnd),
        dateDisplay: `${dateStart.toLocaleDateString(
          'en-US',
          {
            month: 'long',
            day: 'numeric'
          })} - 
					${dateEnd.toLocaleDateString(
            'en-US',
            {
              month: 'long',
              day: 'numeric'
            }
          )}`
      }
    } else {
      const dateStart = new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), 1)
      )
      const dateEnd = new Date(
        Date.UTC(date.getFullYear(), date.getMonth() + 1, 0)
      );

      return {
        dateStart: toISODate(dateStart),
        dateEnd: toISODate(dateEnd),
        dateDisplay: dateStart.toLocaleDateString(
          'en-US',
          {
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC'
          }
        )
      };
    };
  };

  // Declaration of variables for filtering and display
  const { dateStart, dateEnd, dateDisplay } = getDateRange();  

  useEffect(() => {
    console.log(`Date Start: ${dateStart}`);
    console.log(`Date End: ${dateEnd}`);
  },[dateStart, dateEnd])

  // Reset currentDate every tab change
  useEffect(() => {
    setCurrentDate(new Date())
  }, [activeTab])

  return (
    <main className={`flex flex-col space-y-2 min-h-screen
      ${isMobile ? 'pb-15' : 'pb-18'}
    `}>
      {/* Date Card Section */}
      {isScrolled ?         
        <section 
          className={`sticky top-0 z-10 
            transition-all duration-150 
            ease-in-out
            ${isMobile ? 'px-0' : 'px-3'}
          `}
        >
          <Card 
            className={`
              -mt-2 
              border-0 
              rounded-none
              w-full rounded-lg
              ${!isMobile && 'border-2'}
            `}
          >
            <CardHeader
              className='flex
              flex-col 
              justify-center 
              items-center'
            >
              {/* Tabs Selection */}
              <div className='flex items-center gap-x-2'>
                <Calendar />
                <Tabs defaultValue='daily' value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className='bg-white'>
                    {tabItems.map((item, index) => (
                      <TabsTrigger
                        value={item.value}
                        key={index}
                      >
                        {/* Capitalized first letter of item.value */}
                        {item.value.charAt(0).toUpperCase() + item.value.slice(1)}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              {/* Date Display and Date Change */}
              <div className='w-full'>
                <div className="flex 
                    justify-between 
                    items-center
                    font-semibold"
                >
                  <ChevronLeft
                    className='cursor-pointer'
                    onClick={() => handleDateChange('prev')}
                  />
                  {dateDisplay}
                  <ChevronRight
                    className='cursor-pointer'
                    onClick={() => handleDateChange('next')}
                  />
                </div>
              </div>
            </CardHeader>
          </Card>
          {isMobile && (
            <div className='w-full border-t-2 border-black' />
          )}
        </section>
        :
        <section 
          className='pt-2 px-3 
          transition-all duration-150 
          ease-in-out'
        >
          <Card className="mt-0 border-2 ">
            <CardHeader
              className='flex
              flex-col 
              justify-center 
              items-center -mt-2'
            >
              {/* Tabs Selection */}
              <div className='flex items-center gap-x-2'>
                <Calendar />
                <Tabs defaultValue='daily' value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className='bg-white'>
                    {tabItems.map((item, index) => (
                      <TabsTrigger
                        value={item.value}
                        key={index}
                      >
                        {/* Capitalized first letter of item.value */}
                        {item.value.charAt(0).toUpperCase() + item.value.slice(1)}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              {/* Date Display and Date Change */}
              <div className='w-full'>
                <div className="flex 
                    justify-between 
                    items-center
                    font-semibold"
                >
                  <ChevronLeft
                    className='cursor-pointer'
                    onClick={() => handleDateChange('prev')}
                  />
                  {dateDisplay}
                  <ChevronRight
                    className='cursor-pointer'
                    onClick={() => handleDateChange('next')}
                  />
                </div>
              </div>
            </CardHeader>

            {/* Line Separator */}
            <div className='w-full border-t border-gray-300' />

            <CardContent className='flex flex-col gap-y-4'>
              <div className='flex flex-col'>
                <h3 className='text-gray-600 font-normal text-lg'>
                  Total Balance
                </h3>
                <h1 className='text-2xl font-extrabold'>
                  PHP 1,200.00
                </h1>
              </div>
            </CardContent>
            <CardFooter className='w-full flex flex-row justify-center space-x-2'>
              <Button className='w-[50%] flex flex-row -space-x-1'>
                <ArrowDownLeft strokeWidth={3}/> 
                <span>
                  Income
                </span>
              </Button>
              <Button 
                variant='destructive'
                className='w-[50%] flex flex-row -space-x-1' 
              >
                <ArrowUpRight strokeWidth={3}/> 
                <span>
                  Expense
                </span>
              </Button>
            </CardFooter>
          </Card>
        </section>
      }

      {/* Transactions Section */}
      <section className='flex flex-col space-y-2 px-3 mb-2'>
        <TypographyH4>
          Transactions
        </TypographyH4>
        {transactions && ( 
          <>
            {transactions.map((transaction, index) => (
              <Card key={index} className='border-2'>
                <CardHeader>
                  <CardTitle className='flex justify-between'>
                    <span>{transaction.date}</span>
                    <span className='text-red-500'>{transaction.total}</span>
                  </CardTitle>
                </CardHeader>
                <div className='w-full border-t border-gray-300' />
                <CardContent className='-mb-4'>
                  {transaction.details.map((detail, index) => (
                    <div key={index} className='space-y-3 flex flex-row items-center justify-between'>
                      <div className='flex flex-col text-sm'>
                        <span>
                          {detail.category}
                        </span>
                        <span className='text-gray-600'>
                          {detail.note}
                        </span>
                      </div>
                      <span className='text-sm text-red-500'>
                        {detail.amount}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </>
        )}

      </section>
    </main>
  );
};
