'use client';
import React, { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { DockItem, DockProps } from '@/types/dock.types';
import { 
  ArrowLeftRight, 
  Tags
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const defaultItems: DockItem[] = [
  { 
    label: 'transactions', 
    icon: ArrowLeftRight, 
    route:'/pages/transactions' 
  },
  { 
    label: 'categories', 
    icon: Tags, 
    route:'/pages/transactions/add' 
  },
];
export const Dock: React.FC<DockProps> = ({ 
  items, 
  className,
  variant = 'default',
  orientation = 'horizontal',
  showLabels = false
}) => {
  const finalItems = useMemo(() => {
    const isValid = items && Array.isArray(items) && items.length >= 2 && items.length <= 8;
    if (!isValid) {
      console.warn("Dock: 'items' prop is invalid or missing. Using default items.", items);
      return defaultItems;
    }
    return items;
  }, [items]);

  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          container: 'p-1',
          item: 'p-2 min-w-12',
          icon: 'h-4 w-4',
          text: 'text-xs'
        };
      default:
        return {
          container: 'p-0',
          item: 'p-2 min-w-14',
          icon: 'h-7 w-7',
          text: 'text-[10px] -mt-1'
        };
    }
  };
  const styles = getVariantStyles();
  const pathName = usePathname();
  const isMobile = useIsMobile();
  return (
    <div className={`${isMobile ? 'px-0' : 'px-3'}`}>
      <nav
        className={cn(
          `overflow-x-hidden inline-flex justify-center bg-card w-full fixed bottom-0
          ${isMobile ? 'border-t-2' : 'border-2 rounded-lg mb-2' }`,
          orientation === 'horizontal' ? 'flex-row' : 'flex-col',
          styles.container,
          className
        )}
        role="navigation"
      >
        {finalItems.map((item, index) => {
          const isActive = pathName === item.route;
          const IconComponent = item.icon;
          return (
            <Link href={item.route} key={`${item.label}-${index}`}>
              <button
                className={cn(
                  'relative flex flex-col items-center justify-center rounded-lg transition-all duration-200',
                  'hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  styles.item,
                  isActive && 'text-primary',
                  !isActive && 'text-muted-foreground hover:text-foreground'
                )}
                aria-label={item.label}
                type="button"
              >
                <div className={cn(
                  'flex items-center justify-center transition-all duration-200',
                  orientation === 'horizontal' && showLabels ? 'mb-1' : '',
                  orientation === 'vertical' && showLabels ? 'mb-1' : ''
                )}>
                  <IconComponent className={cn(styles.icon, 'transition-colors duration-200')} />
                </div>
                
                {showLabels && (
                  <span
                    className={cn(
                      'font-medium transition-colors duration-200 capitalize',
                      styles.text,
                      'whitespace-nowrap'
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </button>
            </Link>
          );
        })}
      </nav>      
    </div>
  );
};