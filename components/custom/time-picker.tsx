"use client"
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value?: Date
  onChange?: (date: Date) => void
  placeholder?: string
  disabled?: boolean
}

export const timeStringToDate = (timeString?: string): Date | undefined => {
  if (!timeString) return undefined;
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const dateToTimeString = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export function TimePicker({ value, onChange, placeholder = "Select Time...", disabled = false }: TimePickerProps) {
  const [open, setOpen] = useState(false)
  const [hour, setHour] = useState<number>(12)
  const [minute, setMinute] = useState<number>(0)
  const [period, setPeriod] = useState<"AM" | "PM">("AM")

  useEffect(() => {
    if (value) {
      const h = value.getHours();
      const m = value.getMinutes();
      const p = h >= 12 ? "PM" : "AM";
      const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;

      setHour(displayHour);
      setMinute(m);
      setPeriod(p);
    }
  }, [value]);

  const handleCancel = () => {
    const revertDate = value ? value : new Date();
    const h = revertDate.getHours();
    const m = revertDate.getMinutes();
    const p = h >= 12 ? "PM" : "AM";
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;

    setHour(displayHour);
    setMinute(m);
    setPeriod(p);
    setOpen(false);
  };

  const handleApply = () => {
    const newDate = new Date();
    let h = hour;
    if (period === "PM" && h !== 12) {
      h += 12;
    } else if (period === "AM" && h === 12) {
      h = 0;
    };
    newDate.setHours(h, minute, 0, 0);
    onChange?.(newDate);
    setOpen(false);
  };

  const formatTime = (h: number, m: number, p: "AM" | "PM") => {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${p}`
  };

  const displayTime = value ? formatTime(hour, minute, period) : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          type="button"
          className={cn("bg-white border-2 w-full justify-between text-left font-normal h-9", !value && "text-muted-foreground")}
        >
          <span className="text-[16px] text-black">{displayTime}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3 mr-3" align="start">
        <div className="flex items-center gap-2">
          <ScrollWheel value={hour} onChange={setHour} min={1} max={12} label="Hour" />
          <div className="text-sm font-semibold text-muted-foreground self-start mt-4">:</div>
          <ScrollWheel value={minute} onChange={setMinute} min={0} max={59} label="Minute" />
          <ScrollWheelPeriod value={period} onChange={setPeriod} />
        </div>

        <div className="flex gap-2 pt-3">
          <Button size="sm" type="button" onClick={() => handleCancel()} className="flex-1 bg-red-500 text-xs">
            Cancel
          </Button>
          <Button size="sm" type="button" onClick={() => handleApply()} className="flex-1 text-xs">
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function ScrollWheel({
  value,
  onChange,
  min,
  max,
  label,
}: {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  label: string
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const itemHeight = 24;
  const visibleItems = 3;
  const containerHeight = itemHeight * visibleItems;
  const paddingHeight = ((visibleItems - 1) / 2) * itemHeight;

  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  useEffect(() => {
    if (scrollContainerRef.current && !isScrolling.current) {
      const targetScroll = (value - min) * itemHeight
      scrollContainerRef.current.scrollTop = targetScroll
    };
  }, [value, min]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    isScrolling.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const scrollTop = scrollContainerRef.current.scrollTop;
    const index = Math.round(scrollTop / itemHeight);
    const newValue = Math.min(max, Math.max(min, min + index));

    if (newValue !== value) {
      onChange(newValue);
    };

    timeoutRef.current = setTimeout(() => {
      isScrolling.current = false;
      if(scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: (newValue - min) * itemHeight,
          behavior: 'smooth'
        })
      };
    }, 150);
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <label className="text-[0.625rem] font-medium text-muted-foreground">{label}</label>
      <div
        className="relative border border-input rounded-md bg-white overflow-hidden"
        style={{ width: "50px", height: containerHeight }}
      >
        <div className="absolute inset-x-0 top-1/2 h-6 border-t border-b border-input pointer-events-none -translate-y-1/2" />

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth scrollbar-hide"
          style={{
            scrollBehavior: "smooth",
            scrollSnapType: "y mandatory",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {/* Corrected Padding */}
          <div style={{ height: paddingHeight }} />

          {values.map((v) => (
            <div
              key={v}
              className="h-6 flex items-center justify-center text-xs font-medium text-foreground cursor-pointer hover:bg-accent transition-colors"
              style={{
                scrollSnapAlign: "center",
                minHeight: itemHeight,
              }}
              onClick={() => {
                onChange(v)
                // Immediate snap on click
                if (scrollContainerRef.current) {
                   isScrolling.current = true; // prevent useEffect loop
                   scrollContainerRef.current.scrollTop = (v - min) * itemHeight
                   setTimeout(() => isScrolling.current = false, 200);
                }
              }}
            >
              {String(v).padStart(2, "0")}
            </div>
          ))}

          {/* Corrected Padding */}
          <div style={{ height: paddingHeight }} />
        </div>
      </div>
    </div>
  )
}

function ScrollWheelPeriod({
  value,
  onChange,
}: {
  value: "AM" | "PM"
  onChange: (value: "AM" | "PM") => void
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const itemHeight = 24;
  const visibleItems = 3;
  const containerHeight = itemHeight * visibleItems;
  const paddingHeight = ((visibleItems - 1) / 2) * itemHeight;

  const periods = useMemo(():("AM" | "PM")[] => ["AM", "PM"], []);

  useEffect(() => {
    if (scrollContainerRef.current && !isScrolling.current) {
      const targetScroll = (periods.indexOf(value) || 0) * itemHeight
      scrollContainerRef.current.scrollTop = targetScroll
    };
  }, [value, periods]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    isScrolling.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const scrollTop = scrollContainerRef.current.scrollTop;
    const index = Math.round(scrollTop / itemHeight);
    const clampedIndex = Math.max(0, Math.min(1, index));
    const newValue = periods[clampedIndex];

    if (newValue !== value) {
      onChange(newValue);
    };

    timeoutRef.current = setTimeout(() => {
      isScrolling.current = false
       if(scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: clampedIndex * itemHeight,
          behavior: 'smooth'
        })
      };
    }, 150);
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <label className="text-[0.625rem] font-medium text-muted-foreground">Period</label>
      <div
        className="relative border border-input rounded-md bg-white overflow-hidden"
        style={{ width: "50px", height: containerHeight }}
      >
        <div className="absolute inset-x-0 top-1/2 h-6 border-t border-b border-input pointer-events-none -translate-y-1/2" />

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth scrollbar-hide"
          style={{
            scrollBehavior: "smooth",
            scrollSnapType: "y mandatory",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <div style={{ height: paddingHeight }} />

          {periods.map((p, i) => (
            <div
              key={p}
              className="h-6 flex items-center justify-center text-xs font-medium text-foreground cursor-pointer hover:bg-accent transition-colors"
              style={{
                scrollSnapAlign: "center",
                minHeight: itemHeight,
              }}
              onClick={() => {
                onChange(p)
                if (scrollContainerRef.current) {
                   isScrolling.current = true;
                   scrollContainerRef.current.scrollTop = i * itemHeight
                   setTimeout(() => isScrolling.current = false, 200);
                }
              }}
            >
              {p}
            </div>
          ))}

          <div style={{ height: paddingHeight }} />
        </div>
      </div>
    </div>
  )
}