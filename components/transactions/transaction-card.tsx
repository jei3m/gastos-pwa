"use client";
import Link from "next/link";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "../ui/card";
import { 
  Transaction, 
  TransactionDetails 
} from "@/types/transactions.types";
import { formatAmount } from "@/utils/format-amount";

interface TransactionCardProps {
  transaction: Transaction
};

function TransactionCard({
  transaction
}: TransactionCardProps) {
  return (
    <Card className='border-2'>
      <CardHeader>
        <CardTitle className='flex justify-between'>
          <span>
            {new Date(transaction.date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric'
            })}
          </span>
          <span
            className={
              `${
                transaction.total.startsWith('-')
                  ? 'text-red-500'
                  : 'text-primary'
              }`
            }
          >
            PHP {formatAmount(transaction.total)}
          </span>
        </CardTitle>
      </CardHeader>
      <div className='w-full border-t border-gray-300' />
      <CardContent className='-mb-4'>
        {transaction.details.map((detail: TransactionDetails, index: number) => (
          <Link key={index} href={`transactions/${detail.id}`}>
            <div className='space-y-3 flex flex-row items-center justify-between'>
                <div className='flex flex-col text-sm'>
                  <span>
                    {detail.category}
                  </span>
                  <span className='text-gray-600'>
                    {detail.note}
                  </span>
                </div>
                <span className={`text-sm ${detail.type === 'income' ? 'text-primary' : 'text-red-500'}`}>
                  PHP
                  {
                    detail.type === 'income'
                      ? ' +'
                      : ' -'
                  }
                  {formatAmount(detail.amount) }
                </span>                      
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
};

export default TransactionCard;
