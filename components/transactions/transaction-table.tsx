'use client';
import Link from 'next/link';
import {
  Transaction,
  TransactionDetails,
} from '@/types/transactions.types';
import { formatAmount } from '@/utils/format-amount';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { InfoIcon } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface TransactionTableProps {
  transactions: Transaction[];
}

function TransactionTable({
  transactions,
}: TransactionTableProps) {
  return (
    <div className="border-2 border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            <TableHead className="font-semibold text-gray-700">
              Date
            </TableHead>
            <TableHead className="text-right font-semibold text-gray-700">
              Total
            </TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction, index) => (
            <TableRow
              key={index}
              className="hover:bg-gray-50/50 border-b border-gray-100 last:border-b-0"
            >
              <TableCell className="py-4">
                {new Date(
                  transaction.date
                ).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </TableCell>
              <TableCell className="text-right py-4">
                <div className="flex items-center justify-end gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <InfoIcon
                        className="text-muted-foreground cursor-pointer hover:text-gray-700 transition-colors"
                        size={16}
                      />
                    </PopoverTrigger>
                    <PopoverContent className="w-auto flex flex-col p-3 text-sm border-2 shadow-md">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          Income:
                        </span>
                        <span className="text-primary">
                          {Number.parseFloat(
                            transaction.totalIncome
                          ) > 0
                            ? '+'
                            : ''}
                          {formatAmount(
                            transaction.totalIncome
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          Expense:
                        </span>
                        <span className="text-red-500">
                          {formatAmount(
                            transaction.totalExpense
                          )}
                        </span>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <span
                    className={cn(
                      'font-medium',
                      transaction.total.startsWith('-')
                        ? 'text-red-500'
                        : 'text-primary'
                    )}
                  >
                    PHP{' '}
                    {transaction.total.startsWith('-')
                      ? ''
                      : Number.parseFloat(
                            transaction.total
                          ) > 0
                        ? '+'
                        : ''}
                    {formatAmount(transaction.total)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <Accordion
                  type="single"
                  collapsible
                  className="w-full"
                >
                  <AccordionItem
                    value={`item-${index}`}
                    className="border-none"
                  >
                    <AccordionTrigger className="py-2 hover:no-underline">
                      <span className="sr-only">
                        View details
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-0">
                      <div className="space-y-2 mt-2">
                        {transaction.details.map(
                          (
                            detail: TransactionDetails,
                            detailIndex: number
                          ) => (
                            <Link
                              key={detailIndex}
                              href={`transactions/${detail.id}`}
                              className="block"
                            >
                              <div className="flex items-center justify-between p-3 rounded-md hover:bg-gray-100 transition-colors border border-gray-100">
                                <div className="flex items-center gap-3">
                                  <Badge
                                    variant={
                                      detail.type ===
                                      'income'
                                        ? 'default'
                                        : 'destructive'
                                    }
                                  >
                                    {detail.category}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {detail.note}
                                  </span>
                                </div>
                                <span
                                  className={cn(
                                    'text-sm font-medium',
                                    detail.type === 'income'
                                      ? 'text-primary'
                                      : 'text-red-500'
                                  )}
                                >
                                  PHP{' '}
                                  {detail.type === 'income'
                                    ? '+'
                                    : '-'}
                                  {formatAmount(
                                    detail.amount
                                  )}
                                </span>
                              </div>
                            </Link>
                          )
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default TransactionTable;
