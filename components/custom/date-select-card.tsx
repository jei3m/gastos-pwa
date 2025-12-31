"use client";
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { tabItems } from '@/lib/data';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from 'react-day-picker';

interface DateTransactionCardProps {
  onDateRangeChange?: (dateStart: string, dateEnd: string, dateDisplay: string) => void;
  content?: ReactNode,
  isScrolled: boolean
};

function DateSelectCard({ content, onDateRangeChange, isScrolled }: DateTransactionCardProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const newDate = new Date(currentDate);
  const isMobile = useIsMobile();
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  // Set mounted once component loads in the browser
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Return dateStart, dateEnd, and dateDisplay
  const getDateRange = () => {
    // Format dates in local timezone (not UTC)
    const toLocalISODate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (isCustomRange && dateRange?.from && dateRange?.to) {
      // Start and end of the day in local time
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);

      return {
        dateStart: toLocalISODate(fromDate),
        dateEnd: toLocalISODate(toDate),
        dateDisplay: `${fromDate.toLocaleDateString(
          'en-US',
          {
            month: 'long',
            day: 'numeric'
          })} - ${toDate.toLocaleDateString(
            'en-US',
            {
              month: 'long',
              day: 'numeric'
            }
          )}`
      };
    };

    if (activeTab === 'weekly') {
      const dateStart = new Date(newDate),
        dayOfWeek = dateStart.getDay(),
        diff = dateStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1),
        dateEnd = new Date(dateStart);

      // Set dateStart and dateEnd
      dateStart.setDate(diff);
      dateStart.setHours(0, 0, 0, 0);
      
      dateEnd.setDate(dateStart.getDate() + 6);
      dateEnd.setHours(23, 59, 59, 999);

      return {
        dateStart: toLocalISODate(dateStart),
        dateEnd: toLocalISODate(dateEnd),
        dateDisplay: `${dateStart.toLocaleDateString(
          'en-US',
          {
            month: 'long',
            day: 'numeric'
          })} - ${dateEnd.toLocaleDateString(
            'en-US',
            {
              month: 'long',
              day: 'numeric'
            }
          )}`
      };
    } else if (activeTab === 'monthly') {
      // Use local time, not UTC
      const dateStart = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
      dateStart.setHours(0, 0, 0, 0);
      
      const dateEnd = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0);
      dateEnd.setHours(23, 59, 59, 999);

      return {
        dateStart: toLocalISODate(dateStart),
        dateEnd: toLocalISODate(dateEnd),
        dateDisplay: dateStart.toLocaleDateString(
          'en-US',
          {
            month: 'long',
            year: 'numeric'
          }
        )
      };
    } else {
      // Yearly
      const dateStart = new Date(newDate.getFullYear(), 0, 1);
      dateStart.setHours(0, 0, 0, 0);
      
      const dateEnd = new Date(newDate.getFullYear(), 11, 31);
      dateEnd.setHours(23, 59, 59, 999);

      return {
        dateStart: toLocalISODate(dateStart),
        dateEnd: toLocalISODate(dateEnd),
        dateDisplay: dateStart.toLocaleDateString(
          'en-US',
          {
            year: 'numeric'
          }
        )
      };
    }
  };

  // Variables for date handling: filtering, display, etc
  const { dateStart, dateEnd, dateDisplay } = getDateRange();
  const convertedDateEnd = new Date(dateEnd); // string to date
  const today = new Date();

  // Disabled state for prev and next buttons
  const disabled = useMemo(() => {
    if (isCustomRange) {
      return { prev: true, next: true };
    }
    if (convertedDateEnd >= today) {
      return { prev: false, next: true };
    }
    return { prev: false, next: false };
  }, [isCustomRange, convertedDateEnd, today]);

  // Function to handle previous or next
  const handleDateChange = (direction: 'prev' | 'next') => {
    // Prevent moving to future dates
    if (disabled.next && direction === 'next') {
      return;
    };

    // Prevent moving if Custom Range is applied
    if (isCustomRange && disabled.prev && disabled.next) {
      return;
    };

    if (activeTab === 'weekly') {
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

  // Custom Date Range Handling
  const handleCancelCustomRange = (value?: string) => {
    setIsCustomRange(false);
    setDateRange({
      from: undefined,
      to: undefined
    });
    setActiveTab(value || "weekly");
    setDatePickerOpen(false);
  };
  const handleApplyCustomRange = () => {
    if (dateRange?.from && dateRange?.to) {
      setActiveTab("");
      setIsCustomRange(true);
      setDatePickerOpen(false);
    }
  };

  // Call onDateRangeChange whenever the date range changes
  useEffect(() => {
    if (onDateRangeChange) {
      onDateRangeChange(dateStart, dateEnd, dateDisplay);
    }
  }, [dateStart, dateEnd, dateDisplay, onDateRangeChange]);

  // Prevent rendering until the client has mounted
  if (!isMounted) {
    return null; 
  };

  return (
    <section
      className={`
        transition-all duration-150
        ease-in-out
        ${isScrolled && isMobile
            ? 'sticky top-0 z-10' 
            : 'pt-2 px-3'}
      `}
    >
      <Card className={`
          ${
            isScrolled
            ? `-mt-2 ${isMobile ? 'border-0 rounded-none' : 'border-2'}` 
            : 'border-2 mt-0'
          }
        `}
      >
        <CardHeader
          className='flex
          flex-col
          justify-center
          items-center -mt-2'
        >
          <div className='flex justify-center items-center gap-x-2'>
            {/* Date Range Selection */}
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <div className={`${isCustomRange ? 'bg-green-300' : ''} p-[3px] flex justify-center items-center rounded-sm`}>
                  <CalendarIcon />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <div className='p-0 flex flex-col'>
                  <Calendar
                    mode="range"
                    disabled={(date) => date > new Date()}
                    selected={dateRange}
                    onSelect={setDateRange}
                  />
                  <div className="p-2 flex gap-2 -mt-3">
                    <Button size="sm" onClick={() => handleCancelCustomRange()} className="flex-1 bg-red-500 text-xs">
                      {isCustomRange ? 'Clear' : 'Cancel'}
                    </Button>
                    <Button size="sm" onClick={handleApplyCustomRange} className="flex-1 text-xs">
                      Apply
                    </Button> 
                  </div>                      
                </div>
              </PopoverContent>
            </Popover>

            {/* Tabs Selection */}
            <Tabs 
              defaultValue='daily' 
              value={activeTab} 
              onValueChange={(value) => {
                setActiveTab(value);
                handleCancelCustomRange(value);
              }}
            >
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
                className={`cursor-pointer ${disabled.prev && 'opacity-50'}`}
                onClick={() => handleDateChange('prev')}
              />
              {dateDisplay}
              <ChevronRight
                className={`cursor-pointer ${disabled.next && 'opacity-50'}`}
                onClick={() => handleDateChange('next')}
              />
            </div>
          </div>
        </CardHeader>
        {content && (!isMobile || !isScrolled) && (
          <>
            <Separator />
            <CardContent className='flex flex-col gap-y-2'>
              {content}
            </CardContent>
          </>
        )}
      </Card>
      {isMobile && isScrolled && (
        <div className='w-full border-t-2 border-black' />
      )}
    </section>
  )
}

export default DateSelectCard;