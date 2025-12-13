import { formatAmount } from "@/utils/format-amount";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { Account } from "@/types/accounts.types";

interface TotalAmountSectionProps {
  isScrolled: boolean,
  isLoading: boolean,
  account?: Account,
  isMobile: boolean,
};

export default function TotalAmountSection({
  isScrolled,
  isLoading,
  account,
  isMobile
}: TotalAmountSectionProps){

  const router = useRouter();

  return (
    <section
      className={`
        transition-all duration-150
        ease-in-out
        ${isScrolled
            ? 'sticky top-0 z-10' 
            : 'pt-2 px-3'}
      `}
    >
      <Card className={`
          ${
            isScrolled
            ? `-mt-2 ${isMobile ? 'border-0 rounded-none' : 'border-2'}` 
            : 'border-2 mt-0'
          }
        `}
      >
        <CardHeader>
          <div className='flex flex-rows items-center justify-between'>
            <div className='text-xl font-bold'>
              {
                isLoading || !account 
                  ? <Skeleton className='h-4 w-[140px] bg-gray-300' /> 
                  : account?.name
              }
            </div>
            <div className='text-md text-gray-600 font-normal'>
              {
                isLoading || !account 
                  ? <Skeleton className='h-4 w-[140px] bg-gray-300' />
                  : account?.type
              }
            </div>
          </div>
        </CardHeader>
        <Separator className='-mt-2'/>
        <CardContent className='space-y-2'>
          <div className='flex flex-col'>
            <h3 className='text-gray-600 font-normal text-lg'>
              Balance
            </h3>
            {isLoading || !account ? (
              <h1 className='text-2xl font-extrabold flex'>
                <Skeleton className='h-10 w-[50%] bg-gray-300'/>
              </h1>               
            ):(
              <h1 className='text-2xl font-extrabold'>
                PHP {formatAmount(account?.totalBalance)}
              </h1> 
            )}
          </div>
          {!isScrolled && (
            <div className='w-full flex flex-row justify-center space-x-2'>
              <Button
                className='w-[50%] flex flex-row -space-x-1'
                onClick={() => router.push(`/pages/transactions/add?type=income`)}
              >
                <ArrowDownLeft strokeWidth={3}/>
                <span>
                  Income
                </span>
              </Button>
              <Button
                variant='destructive'
                className='w-[50%] flex flex-row -space-x-1'
                onClick={() => router.push(`/pages/transactions/add?type=expense`)}
              >
                <ArrowUpRight strokeWidth={3}/>
                <span>
                  Expense
                </span>
              </Button>
            </div>              
          )}
        </CardContent>
      </Card> 
      {isMobile && isScrolled && (
        <div className='w-full border-t-2 border-black' />
      )} 
    </section>
  )
};
