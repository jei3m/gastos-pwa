import { createElement } from 'react';
import { Category } from '@/types/categories.types';
import { Card, CardContent, CardDescription, CardTitle } from '../ui/card';
import { getIconById } from '@/lib/icons';
import { TypographyH5 } from '../custom/typography';
import { formatAmount } from '@/utils/format-amount';
import Link from 'next/link';
import { SquareDashed } from 'lucide-react';

interface CategoryCardProps {
  category: Category,
  hideAmount: boolean,
  showDescription?: boolean,
};

export default function CategoryCard({
  category,
  hideAmount,
  showDescription,
}: CategoryCardProps) {

  // Returns true or false
  const isExpense = (type: string) => {
    return type === 'Expense';
  };

  return (
    <Link href={`/pages/categories/${category.id}`}>
      <Card className='border-2 p-[10px]'>
        <CardContent className='flex flex-row justify-between items-center -p-1'>
          <div className='flex flex-row space-x-2 items-center'>
            <div className={`
              p-1.5 rounded-lg border-2 
              ${isExpense(category.type)
                ? 'bg-red-500'
                : 'bg-primary'
              }
            `}>
              {createElement(
                getIconById(category.icon)?.icon 
                || SquareDashed, { size: 30 }
              )}
            </div>
            <div>
              <TypographyH5 className='font-semibold'>
                {category.name}
              </TypographyH5>
              {showDescription && (
                <div className=''>
                  {category.description || ''}
                </div>                
              )}
            </div>
          </div>
          {!hideAmount && (
            <div className='text-right'>
              <CardDescription>
                Total Amount:
              </CardDescription>	
              <CardTitle
                className={`
                  ${
                    isExpense(category.type)
                      ? 'text-red-500'
                      : 'text-primary'
                  }
                `}
              >
                PHP {isExpense(category.type) ? '-' : '+'}{formatAmount(category.totalAmount) ?? 0.00}
              </CardTitle>										
            </div>            
          )}
        </CardContent>
      </Card>
    </Link>
  )
};
