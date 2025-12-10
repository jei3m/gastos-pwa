import React, { ReactNode, useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { tabItems } from '@/lib/data';
import { Separator } from '@/components/ui/separator';

interface DateTransactionCardProps {
  onDateRangeChange?: (dateStart: string, dateEnd: string, dateDisplay: string) => void;
  content?: ReactNode
}

function DateSelectCard({ content, onDateRangeChange }: DateTransactionCardProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const newDate = new Date(currentDate);
  const isMobile = useIsMobile();

  // Return dateStart, dateEnd, and dateDisplay
  const getDateRange = () => {
    const toISODate = (d: Date) => d.toISOString().slice(0, 10);

    if (activeTab === 'weekly') {
      const dateStart = new Date(newDate),
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
    } else if (activeTab === 'monthly') {
      const dateStart = new Date(
        Date.UTC(newDate.getFullYear(), newDate.getMonth(), 1)
      )
      const dateEnd = new Date(
        Date.UTC(newDate.getFullYear(), newDate.getMonth() + 1, 0)
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
    } else {
      const dateStart = new Date(
        Date.UTC(newDate.getFullYear(), 0, 1)
      )
      const dateEnd = new Date(
        Date.UTC(newDate.getFullYear(), 11, 31)
      );

      return {
        dateStart: toISODate(dateStart),
        dateEnd: toISODate(dateEnd),
        dateDisplay: dateStart.toLocaleDateString(
          'en-US',
          {
            year: 'numeric',
            timeZone: 'UTC'
          }
        )
      };
    }
  };

  // Declaration of variables for filtering and display
  const { dateStart, dateEnd, dateDisplay } = getDateRange();

  // Function to handle previous or next
  const handleDateChange = (direction: 'prev' | 'next') => {
    const convertedDateEnd = new Date(dateEnd); // string to date
    const today = new Date();

    // Prevent moving to future dates
    if (convertedDateEnd > today && direction === 'next') {
      console.log('Validation Triggered')
      return;
    }

    if (activeTab === 'daily') {
      newDate.setDate(
        newDate.getDate() + (direction === 'prev' ? -1 : 1)
      );
    } else if (activeTab === 'weekly') {
      newDate.setDate(
        newDate.getDate() + (direction === 'prev' ? -7 : 7)
      );
    } else if (activeTab === 'monthly') {
      newDate.setMonth(
        newDate.getMonth() + (direction === 'prev' ? -1 : 1)
      );
    } else if (activeTab === 'yearly') {
      newDate.setFullYear(
        newDate.getFullYear() + (direction === 'prev' ? -1 : 1)
      );
    }

    setCurrentDate(newDate);
  };

  // Call onDateRangeChange whenever the date range changes
  useEffect(() => {
    if (onDateRangeChange) {
      onDateRangeChange(dateStart, dateEnd, dateDisplay);
    }
  }, [dateStart, dateEnd, dateDisplay, onDateRangeChange]);

  // Set isScrolled
  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
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
            {content && (
              <>
                <Separator />
                <CardContent className='flex flex-col gap-y-2'>
                  {content}
                </CardContent>
              </>
            )}
          </Card>
        </section>
      }
    </>
  )
}

export default DateSelectCard;