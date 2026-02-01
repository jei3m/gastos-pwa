'use client';
import Link from 'next/link';
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
import { InfoIcon } from 'lucide-react';

interface TransactionCardProps {
  transaction: Transaction;
}

function TransactionCard({
  transaction,
}: TransactionCardProps) {
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>
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
              className={`${
                transaction.total.startsWith('-')
                  ? 'text-red-500'
                  : 'text-primary'
              }`}
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
              href={`/pages/transactions/${detail.id}`}
            >
              <div className="space-y-3 flex flex-row items-center justify-between">
                <div className="flex flex-col text-sm">
                  <span>{detail.category}</span>
                  <span className="text-gray-600">
                    {detail.note}
                  </span>
                </div>
                <span
                  className={`text-sm ${detail.type === 'income' ? 'text-primary' : 'text-red-500'}`}
                >
                  PHP
                  {detail.type === 'income' ? ' +' : ' -'}
                  {formatAmount(detail.amount)}
                </span>
              </div>
            </Link>
          )
        )}
      </CardContent>
    </Card>
  );
}

export default TransactionCard;
