import { useState } from 'react';
import { formatAmount } from '@/utils/format-amount';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Account } from '@/types/accounts.types';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import AddTransactionForm from '@/components/transactions/add-transaction-form';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Eye, EyeOff } from 'lucide-react';

interface TotalAmountSectionProps {
  isScrolled: boolean;
  isLoading: boolean;
  account?: Account;
  isMobile: boolean;
}

export default function TotalAmountSection({
  isScrolled,
  isLoading,
  account,
  isMobile,
}: TotalAmountSectionProps) {
  const [transactionTypeParam, setTransactionTypeParam] =
    useState<'income' | 'expense'>('income');
  const [isAddDialogOpen, setIsAddDialogOpen] =
    useState<boolean>(false);
  const [hideBalance, setHideBalance] = useLocalStorage(
    'hideBalance',
    false
  );
  return (
    <section
      className={`
        transition-all duration-150
        ease-in-out
        ${
          isScrolled && isMobile
            ? 'sticky top-0 z-10'
            : 'pt-2 px-3'
        }
      `}
    >
      <Card
        className={`
          ${
            isScrolled && isMobile
              ? `-mt-2 ${isMobile ? 'border-0 rounded-none' : 'border-2'}`
              : 'border-2 mt-0'
          }
        `}
      >
        <CardHeader>
          <div className="flex flex-rows items-center justify-between">
            <div className="text-xl font-bold">
              {isLoading ? (
                <Skeleton className="h-4 w-[140px] bg-gray-300" />
              ) : (
                account?.name || 'N/A'
              )}
            </div>
            <div className="text-md text-gray-600 font-normal">
              {isLoading ? (
                <Skeleton className="h-4 w-[140px] bg-gray-300" />
              ) : (
                account?.type || 'N/A'
              )}
            </div>
          </div>
        </CardHeader>
        <Separator className="-mt-2" />
        <CardContent className="space-y-2">
          <div className="flex flex-col">
            <div className="flex flex-row items-center">
              <h3 className="text-gray-600 font-normal text-lg">
                Balance
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setHideBalance(!hideBalance)}
                className="h-8 w-8 text-gray-600"
              >
                {hideBalance ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {isLoading ? (
              <h1 className="text-2xl font-extrabold flex">
                <Skeleton className="h-10 w-[50%] bg-gray-300" />
              </h1>
            ) : (
              <h1 className="text-2xl font-extrabold">
                PHP{' '}
                {hideBalance
                  ? '********'
                  : formatAmount(
                      account?.totalBalance || 0
                    )}
              </h1>
            )}
          </div>
          {(!isMobile || !isScrolled) && (
            <div className="w-full flex flex-row justify-center space-x-2">
              {isMobile ? (
                <>
                  <Link
                    href={`/pages/transactions/add?type=income`}
                    className="w-full"
                  >
                    <Button className="w-full flex flex-row -space-x-1">
                      <ArrowDownLeft strokeWidth={3} />
                      <span>Income</span>
                    </Button>
                  </Link>

                  <Link
                    href={`/pages/transactions/add?type=expense`}
                    className="w-full"
                  >
                    <Button
                      variant="destructive"
                      className="w-full flex flex-row -space-x-1"
                    >
                      <ArrowUpRight strokeWidth={3} />
                      <span>Expense</span>
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="w-full flex space-x-2">
                  <Dialog
                    open={isAddDialogOpen}
                    onOpenChange={setIsAddDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        className="flex-1 flex flex-row -space-x-1"
                        onClick={() =>
                          setTransactionTypeParam('income')
                        }
                      >
                        <ArrowDownLeft strokeWidth={3} />
                        <span>Income</span>
                      </Button>
                    </DialogTrigger>
                    <DialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="flex-1 flex flex-row -space-x-1"
                        onClick={() =>
                          setTransactionTypeParam('expense')
                        }
                      >
                        <ArrowUpRight strokeWidth={3} />
                        <span>Expense</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      onOpenAutoFocus={(e) =>
                        e.preventDefault()
                      }
                      showCloseButton={false}
                      className="border-2 min-w-[600px]"
                    >
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">
                          New Transaction
                        </DialogTitle>
                        <DialogDescription></DialogDescription>
                      </DialogHeader>
                      <AddTransactionForm
                        isModal={true}
                        transactionTypeParam={
                          transactionTypeParam
                        }
                        onClose={() =>
                          setIsAddDialogOpen(false)
                        }
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      {isMobile && isScrolled && (
        <div className="w-full border-t-2 border-black" />
      )}
    </section>
  );
}
