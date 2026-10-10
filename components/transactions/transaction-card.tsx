'use client';
import { createElement } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card, CardContent } from '../ui/card';
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
    <section className="flex flex-col gap-1">
      <div className="flex justify-between items-center px-2 font-semibold">
        <span className="text-md">
          {new Date(transaction.date).toLocaleDateString(
            'en-US',
            {
              month: 'long',
              day: 'numeric',
            }
          )}
        </span>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger>
              <InfoIcon
                className="text-muted-foreground -mt-0.5"
                size={20}
              />
            </PopoverTrigger>
            <PopoverContent className="border-2 w-auto flex flex-col p-2 text-sm">
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
              'text-md'
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
      </div>
      <Card className="p-[10px]">
        <CardContent className="flex flex-col gap-3 md:gap-4 -p-1">
          {transaction.details.map(
            (detail: TransactionDetails, index: number) => (
              <Link
                key={index}
                href={`${hrefPrefix}/${detail.id}`}
              >
                <div className="flex flex-row justify-between text-sm md:text-md">
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
                          <Avatar className="size-6">
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
                      <span className="text-muted-foreground truncate">
                        {detail.note}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col text-sm md:text-md shrink-0">
                    <span
                      className={`${detail.type === 'income' ? 'text-primary' : 'text-red-500'}`}
                    >
                      PHP
                      {detail.type === 'income'
                        ? ' +'
                        : ' -'}
                      {formatAmount(detail.amount)}
                    </span>
                    <span className="text-muted-foreground text-right">
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
    </section>
  );
}

export default TransactionCard;
