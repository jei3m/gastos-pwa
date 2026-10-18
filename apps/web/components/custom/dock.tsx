import React from 'react';
import { Link, useLocation } from 'react-router';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { menuItems } from '@/lib/data';

interface DockProps {
  className?: string;
  variant?: 'default' | 'compact';
  orientation?: 'horizontal' | 'vertical';
  showLabels?: boolean;
}

export const Dock: React.FC<DockProps> = ({
  className,
  variant = 'default',
  orientation = 'horizontal',
  showLabels = false,
}) => {
  const { pathname } = useLocation();
  const isMobile = useIsMobile();
  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          container: 'p-1',
          item: 'p-2 min-w-12',
          icon: 'h-4 w-4',
          text: 'text-xs',
        };
      default:
        return {
          container: cn('p-0', isMobile ? 'pb-2' : 'pb-0'),
          item: 'p-2 min-w-14',
          icon: 'h-7 w-7',
          text: 'text-[10px] -mt-1',
        };
    }
  };
  const styles = getVariantStyles();
  return (
    <>
      {isMobile && (
        <div className="px-0">
          <nav
            className={cn(
              'fixed m-auto flex w-full flex-col justify-center overflow-x-hidden bg-card',
              isMobile
                ? 'bottom-0 w-full border-t-2'
                : 'bottom-2 mb-2 max-w-[676px] rounded-lg border-2',
              orientation === 'horizontal'
                ? 'flex-row'
                : 'flex-col',
              styles.container,
              className
            )}
            role="navigation"
          >
            {menuItems.map((item, index) => {
              const isActive = pathname === item.route;
              const IconComponent = item.icon;
              return (
                <Link
                  to={item.route}
                  key={`${item.label}-${index}`}
                  onClick={() => {
                    window.scrollTo(0, 0);
                  }}
                >
                  <button
                    className={cn(
                      'relative flex flex-col items-center justify-center rounded-lg transition-all duration-200',
                      'hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                      styles.item,
                      isActive && 'text-primary',
                      !isActive &&
                        'text-muted-foreground hover:text-foreground'
                    )}
                    aria-label={item.label}
                    type="button"
                  >
                    <div
                      className={cn(
                        'flex items-center justify-center transition-all duration-200',
                        orientation === 'horizontal' &&
                          showLabels
                          ? 'mb-1'
                          : '',
                        orientation === 'vertical' &&
                          showLabels
                          ? 'mb-1'
                          : ''
                      )}
                    >
                      <IconComponent
                        className={cn(
                          styles.icon,
                          'transition-colors duration-200'
                        )}
                      />
                    </div>

                    {showLabels && (
                      <span
                        className={cn(
                          'font-medium capitalize transition-colors duration-200',
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
      )}
    </>
  );
};
