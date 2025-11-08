'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { DockItem, DockProps } from '@/types/dock.types';
import { 
  ArrowLeftRight, 
  Tags
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const dockItems: DockItem[] = [
  { 
    label: 'transactions', 
    icon: ArrowLeftRight, 
    route:'/pages/transactions' 
  },
  { 
    label: 'categories', 
    icon: Tags, 
    route:'/pages/categories' 
  },
];
export const Dock: React.FC<DockProps> = ({ 
  className,
  variant = 'default',
  orientation = 'horizontal',
  showLabels = false
}) => {
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
    <div className={`${isMobile ? 'px-0' : 'px-3'} max-w-[600px]`}>
      <nav
        className={cn(
          `overflow-x-hidden flex flex-col justify-center 
            w-full bg-card fixed m-auto
          ${
            isMobile ? 'border-t-2 w-full bottom-0' 
              : 'border-2 rounded-lg mb-2 max-w-[576px] m-auto bottom-2' 
          }`,
          orientation === 'horizontal' ? 'flex-row' : 'flex-col',
          styles.container,
          className
        )}
        role="navigation"
      >
        {dockItems.map((item, index) => {
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