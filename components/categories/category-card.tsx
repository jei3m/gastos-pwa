import { createElement } from 'react';
import { Category } from '@/types/categories.types';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '../ui/card';
import { getIconById } from '@/lib/icons';
import { TypographyH5 } from '../custom/typography';
import { formatAmount } from '@/utils/format-amount';
import Link from 'next/link';
import { SquareDashed } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const dateStart = searchParams.get('dateStart');
  const dateEnd = searchParams.get('dateEnd');

  const getHref = () => {
    const base = isEdit
      ? `/pages/categories/${category.id}`
      : `/pages/categories/${category.id}/transactions`;
    const params = new URLSearchParams();
    if (dateStart) params.set('dateStart', dateStart);
    if (dateEnd) params.set('dateEnd', dateEnd);
    const queryString = params.toString();
    return queryString ? `${base}?${queryString}` : base;
  };

  const isExpense = (type: string) => {
    return type === 'Expense';
  };

  return (
    <Link href={getHref()} scroll={false}>
      <Card className="border-2 p-[10px]">
        <CardContent className="flex flex-row justify-between items-center -p-1">
          <div className="flex flex-row space-x-2 items-center">
            <div
              className={cn(
                'p-1.5 rounded-lg border-2 ',
                isExpense(category.type)
                  ? 'bg-red-500'
                  : 'bg-primary'
              )}
            >
              {createElement(
                getIconById(category.icon)?.icon ||
                  SquareDashed,
                { size: 30 }
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
            </div>
          </div>
          {!hideAmount && (
            <div className="text-right">
              <CardDescription className="text-sm">
                Total Amount:
              </CardDescription>
              <CardTitle
                className={cn(
                  'text-md md:text-lg',
                  isExpense(category.type)
                    ? 'text-red-500'
                    : 'text-primary'
                )}
              >
                PHP {isExpense(category.type) ? '-' : '+'}
                {formatAmount(category.totalAmount) ?? 0.0}
              </CardTitle>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
