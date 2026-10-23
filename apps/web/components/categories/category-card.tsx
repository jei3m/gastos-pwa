import { createElement } from 'react';
import type { Category } from '@/features/categories/categories.interface';
import { Card, CardContent } from '@/components/ui/card';
import { getIconById } from '@/lib/icons';
import { TypographyH5 } from '@/components/custom/typography';
import { formatAmount } from '@/lib/format-amount';
import { Link, useSearchParams } from 'react-router';
import { SquareDashed } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  category: Category;
  hideAmount: boolean;
  showDescription?: boolean;
  isEdit?: boolean;
}

export default function CategoryCard({
  category,
  hideAmount,
  showDescription,
  isEdit = true,
}: CategoryCardProps) {
  const [searchParams] = useSearchParams();
  const dateStart = searchParams.get('dateStart');
  const dateEnd = searchParams.get('dateEnd');

  const getHref = () => {
    const base = isEdit
      ? `/categories/${category.id}`
      : `/categories/${category.id}/transactions`;
    const params = new URLSearchParams();
    if (dateStart) params.set('dateStart', dateStart);
    if (dateEnd) params.set('dateEnd', dateEnd);
    const queryString = params.toString();
    return queryString ? `${base}?${queryString}` : base;
  };

  const isExpense = (type: string) => {
    return type.toLowerCase() === 'expense';
  };

  return (
    <Link to={getHref()}>
      <Card className="p-[10px]">
        <CardContent className="flex flex-row justify-between items-center -p-1">
          <div className="flex flex-row space-x-2 md:space-x-3 items-center">
            <div
              className={cn(
                'p-2 rounded-lg',
                isExpense(category.type)
                  ? 'bg-red-500/15'
                  : 'bg-primary/15'
              )}
            >
              {createElement(
                getIconById(category.icon)?.icon ||
                  SquareDashed,
                {
                  size: 26,
                  className: cn(
                    isExpense(category.type)
                      ? 'text-red-500'
                      : 'text-primary'
                  ),
                }
              )}
            </div>
            <div>
              <TypographyH5 className="font-semibold">
                {category.name}
              </TypographyH5>
              {showDescription && (
                <div className="truncate w-[280px]">
                  {category.description || ''}
                </div>
              )}
              {!hideAmount && (
                <div
                  className={cn(
                    'text-sm md:text-lg font-semibold',
                    isExpense(category.type)
                      ? 'text-red-500'
                      : 'text-primary'
                  )}
                >
                  PHP {isExpense(category.type) ? '-' : '+'}
                  {formatAmount(category.totalAmount) ??
                    0.0}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
