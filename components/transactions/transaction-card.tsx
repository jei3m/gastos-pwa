'use client';
import { createElement } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Transaction,
  TransactionDetails,
} from '@/types/transactions.types';
import { formatAmount } from '@/utils/format-amount';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { InfoIcon, SquareDashed } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getIconById } from '@/lib/icons';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';

interface TransactionCardProps {
  transaction: Transaction;
  isShared?: boolean;
}

function TransactionCard({
  transaction,
  isShared = false,
}: TransactionCardProps) {
  const pathname = usePathname();
  const isCategoryRoute = pathname.match(
    /^\/pages\/categories\/[^/]+\/transactions$/
  );
  const hrefPrefix = isCategoryRoute
    ? pathname
    : '/pages/transactions';
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span className="text-md md:text-xl">
            {new Date(transaction.date).toLocaleDateString(
              'en-US',
              {
                month: 'long',
                day: 'numeric',
              }
            )}
          </span>
          <div className="flex items-center gap-2 md:gap-4">
            <Popover>
              <PopoverTrigger>
                <InfoIcon
                  className="text-muted-foreground -mt-[1px]"
                  size={20}
                />
              </PopoverTrigger>
              <PopoverContent className="w-auto flex flex-col p-2 text-sm md:text-md">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    Income:
                  </span>
                  <span className="text-primary">
                    {Number.parseFloat(
                      transaction.totalIncome
                    ) > 0
                      ? ' +'
                      : ' '}
                    {formatAmount(transaction.totalIncome)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    Expense:
                  </span>
                  <span className="text-red-500">
                    {formatAmount(transaction.totalExpense)}
                  </span>
                </div>
              </PopoverContent>
            </Popover>
            <span
              className={cn(
                transaction.total.startsWith('-')
                  ? 'text-red-500'
                  : 'text-primary',
                'text-md md:text-lg'
              )}
            >
              PHP
              {transaction.total.startsWith('-')
                ? ' '
                : Number.parseFloat(transaction.total) > 0
                  ? ' +'
                  : ' '}
              {formatAmount(transaction.total)}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <div className="w-full border-t border-gray-300" />
      <CardContent className="-mb-4">
        {transaction.details.map(
          (detail: TransactionDetails, index: number) => (
            <Link
              key={index}
              href={`${hrefPrefix}/${detail.id}`}
            >
              <div className="space-y-3 md:space-y-4 flex flex-row justify-between text-sm md:text-md py-1">
                <div
                  className={cn(
                    'flex items-center min-w-0',
                    isShared ? 'gap-3' : 'gap-2'
                  )}
                >
                  <div className="relative shrink-0">
                    <div
                      className={cn(
                        'p-2 rounded-lg',
                        detail.type === 'income'
                          ? 'bg-primary/15'
                          : 'bg-red-500/15'
                      )}
                    >
                      {createElement(
                        getIconById(detail.icon ?? '')
                          ?.icon || SquareDashed,
                        {
                          size: 26,
                          className: cn(
                            detail.type === 'income'
                              ? 'text-primary'
                              : 'text-red-500'
                          ),
                        }
                      )}
                    </div>
                    {isShared && detail.userName && (
                      <div className="absolute -bottom-1.5 -right-1.5">
                        <Avatar className="size-6 border-2 border-background">
                          <AvatarImage
                            src={detail.userImage ?? ''}
                            alt={detail.userName}
                          />
                          <AvatarFallback className="text-[8px]">
                            {detail.userName
                              .charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="truncate">
                      {detail.category}
                    </span>
                    <span className="text-gray-500 truncate">
                      {detail.note}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col text-sm md:text-md shrink-0">
                  <span
                    className={`${detail.type === 'income' ? 'text-primary' : 'text-red-500'}`}
                  >
                    PHP
                    {detail.type === 'income' ? ' +' : ' -'}
                    {formatAmount(detail.amount)}
                  </span>
                  <span className="text-gray-500 text-right">
                    {new Date(
                      `2000-01-01T${detail.time}`
                    ).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </span>
                </div>
              </div>
            </Link>
          )
        )}
      </CardContent>
    </Card>
  );
}

export default TransactionCard;
