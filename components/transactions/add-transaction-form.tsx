'use client';
import { useState, useEffect, Key, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TypographyH3 } from '@/components/custom/typography';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { createTransactionSchema } from '@/lib/schema/transactions.schema';
import { useAccount } from '@/context/account-context';
import { Category } from '@/types/categories.types';
import { toast } from 'sonner';
import { createTransaction } from '@/lib/tq-functions/transactions.tq.functions';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ChevronDownIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { transactionTypes } from '@/lib/data';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import {
  dateToTimeString,
  TimePicker,
  timeStringToDate,
} from '@/components/custom/time-picker';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { CreateTransaction } from '@/types/transactions.types';
import { transactionsInfiniteQueryOptions } from '@/lib/tq-options/transactions.tq.options';
import { categoryQueryOptions } from '@/lib/tq-options/categories.tq.options';
import { Account } from '@/types/accounts.types';
import CustomAlertDialog from '../custom/custom-alert-dialog';
import { cn } from '@/lib/utils';

interface AddTransactionFormProps {
  isModal?: boolean;
  transactionTypeParam: string | null;
  onClose?: () => void;
}

export default function AddTransactionForm({
  isModal = false,
  transactionTypeParam,
  onClose,
}: AddTransactionFormProps) {
  const [datePickerOpen, setDatePickerOpen] =
    useState<boolean>(false);
  const router = useRouter();
  const { selectedAccountID, accounts } = useAccount();
  const queryClient = useQueryClient();
  const pathname = window.location.pathname;

  const filteredAccounts =
    accounts?.filter(
      (account: Account) => account.id !== selectedAccountID
    ) || [];

  const form = useForm<
    z.infer<typeof createTransactionSchema>
  >({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      note: '',
      amount: '',
      transferFee: '',
      type: '',
      time: '',
      date: '', // Use 'en-CA' locale which formats as YYYY-MM-DD
      refCategoriesID: '',
      refAccountsID: '',
      refTransferToAccountsID: '',
    },
  });
  const transactionDate = form.getValues('date');
  const transactionType = useWatch({
    control: form.control,
    name: 'type',
  });

  const {
    data: categoriesData,
    isPending: isCategoriesPending,
  } = useQuery(
    categoryQueryOptions(
      transactionType,
      selectedAccountID!,
      null,
      null,
      'list'
    )
  );
  const categories = useMemo(() => {
    return categoriesData;
  }, [categoriesData]);

  const {
    mutate: createTransactionMutation,
    isPending: isCreateTransactionPending,
  } = useMutation({
    mutationFn: (transactionData: CreateTransaction) =>
      createTransaction(transactionData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: transactionsInfiniteQueryOptions(
          selectedAccountID!
        ).queryKey,
      });
      form.reset();
      toast.success(data.responseMessage);
      isModal && onClose
        ? onClose()
        : router.push('/pages/transactions');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  async function onSubmit(
    values: z.infer<typeof createTransactionSchema>
  ) {
    const transactionData = {
      ...values,
      amount: parseFloat(values.amount), // Convert string to number
      transferFee: parseFloat(values.transferFee || '0'),
    };
    createTransactionMutation(transactionData);
  }

  // Set initial tab value and form value from url param
  useEffect(() => {
    if (
      transactionTypeParam &&
      (transactionTypeParam === 'income' ||
        transactionTypeParam === 'expense')
    ) {
      form.setValue('type', transactionTypeParam);
    }
  }, [form, transactionTypeParam]);

  // Set refAccountsID
  useEffect(() => {
    if (!selectedAccountID) return;
    form.setValue('refAccountsID', selectedAccountID);
    form.setValue(
      'time',
      new Date().toTimeString().substring(0, 5)
    );
    form.setValue(
      'date',
      new Date().toLocaleDateString('en-CA')
    );
  }, [selectedAccountID]);

  const isLoading = useMemo(() => {
    return transactionType !== 'transfer'
      ? isCategoriesPending || isCreateTransactionPending
      : isCreateTransactionPending;
  }, [
    transactionType,
    isCategoriesPending,
    isCreateTransactionPending,
  ]);

  return (
    <main
      className={cn(
        'flex flex-col space-y-4',
        !isModal && 'p-3'
      )}
    >
      {!isModal && (
        <TypographyH3>New Transaction</TypographyH3>
      )}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col space-y-4"
        >
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Tabs
                    value={field.value.toLowerCase()}
                    onValueChange={field.onChange}
                    className="-mt-1"
                  >
                    <TabsList className="bg-white border-2 w-full h-10">
                      {transactionTypes.map(
                        (type, index) => (
                          <TabsTrigger
                            value={type.toLowerCase()}
                            key={index}
                            disabled={isLoading}
                            className={`text-md
                            ${
                              field.value.toLowerCase() ===
                                'expense' ||
                              field.value.toLowerCase() ===
                                'transfer'
                                ? 'data-[state=active]:bg-red-400'
                                : 'data-[state=active]:bg-green-300'
                            }`}
                          >
                            {type}
                          </TabsTrigger>
                        )
                      )}
                    </TabsList>
                  </Tabs>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            disabled={isLoading}
            render={({ field }) => (
              <FormItem className="-space-y-1">
                <FormLabel className="text-md font-medium">
                  Amount
                </FormLabel>
                <FormControl>
                  <Input
                    required
                    placeholder="0.00"
                    {...field}
                    className="h-9 rounded-lg border-2 border-black bg-white"
                    type="number"
                    inputMode="decimal"
                    pattern="[0-9\.]*"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {transactionType !== 'transfer' ? (
            <FormField
              control={form.control}
              name="refCategoriesID"
              render={({ field }) => (
                <FormItem className="-space-y-1">
                  <FormLabel className="text-md font-medium">
                    Category
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-[180px] bg-white border-2 border-black w-full h-9">
                        <SelectValue placeholder="Select Category..." />
                      </SelectTrigger>
                      <SelectContent className="border-2">
                        {categories && (
                          <>
                            {categories.map(
                              (
                                category: Category,
                                index: Key
                              ) => (
                                <SelectItem
                                  key={index}
                                  value={category.id}
                                >
                                  {category.name}
                                </SelectItem>
                              )
                            )}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <div className="flex gap-2 items-center w-full">
              <FormField
                control={form.control}
                name="refTransferToAccountsID"
                render={({ field }) => (
                  <FormItem className="flex-2">
                    <FormLabel className="-mb-1 text-md font-medium">
                      Transfer to
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="w-[180px] bg-white border-2 border-black w-full h-9 rounded-lg">
                          <SelectValue placeholder="Select Account..." />
                        </SelectTrigger>
                        <SelectContent className="border-2">
                          {accounts && (
                            <>
                              {filteredAccounts.map(
                                (
                                  account: Account,
                                  index: Key
                                ) => (
                                  <SelectItem
                                    key={index}
                                    value={account.id}
                                  >
                                    {account.name}
                                  </SelectItem>
                                )
                              )}
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="transferFee"
                disabled={isLoading}
                render={({ field }) => (
                  <FormItem className="flex-2">
                    <FormLabel className="-mb-1 text-md font-medium">
                      Transfer Fee
                    </FormLabel>
                    <FormControl>
                      <Input
                        required
                        placeholder="0.00"
                        {...field}
                        className="h-9 rounded-lg border-2 border-black bg-white"
                        type="number"
                        inputMode="decimal"
                        pattern="[0-9\.]*"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
          <FormField
            control={form.control}
            name="note"
            disabled={isLoading}
            render={({ field }) => (
              <FormItem className="-space-y-1">
                <FormLabel className="text-md font-medium">
                  Note
                </FormLabel>
                <FormControl>
                  <Input
                    required
                    placeholder="Transaction note..."
                    {...field}
                    className="h-9
                    rounded-lg border-2
                    border-black bg-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-row space-x-2">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="-space-y-1 w-full">
                  <FormLabel className="text-md font-medium">
                    Date
                  </FormLabel>
                  <FormControl>
                    <Popover
                      open={datePickerOpen}
                      onOpenChange={setDatePickerOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          disabled={isLoading}
                          variant="outline"
                          id="date"
                          className="justify-between font-normal border-2 bg-white text-[16px]"
                        >
                          {transactionDate
                            ? new Date(
                                transactionDate
                              ).toLocaleDateString()
                            : 'Select date'}
                          <ChevronDownIcon />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto overflow-hidden p-0"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={
                            transactionDate
                              ? new Date(transactionDate)
                              : undefined
                          }
                          captionLayout="dropdown"
                          disabled={(date) =>
                            date > new Date()
                          }
                          onSelect={(date) => {
                            if (date) {
                              const year =
                                date.getFullYear();
                              const month = String(
                                date.getMonth() + 1
                              ).padStart(2, '0');
                              const day = String(
                                date.getDate()
                              ).padStart(2, '0');
                              const formattedDate = `${year}-${month}-${day}`;
                              field.onChange(formattedDate);
                            }
                            setDatePickerOpen(false);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem className="-space-y-1 w-full">
                  <FormLabel className="text-md font-medium">
                    Time
                  </FormLabel>
                  <FormControl>
                    <TimePicker
                      value={timeStringToDate(field.value)}
                      onChange={(date) => {
                        if (date) {
                          const timeString =
                            dateToTimeString(date);
                          field.onChange(timeString);
                        }
                      }}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-row justify-between">
            <Button
              onClick={() => {
                form.reset();
                if (isModal && onClose) {
                  onClose();
                } else {
                  router.back();
                }
              }}
              className="bg-red-500 border-2 hover:none"
              disabled={isLoading}
              type="button"
            >
              Cancel
            </Button>
            {transactionType === 'transfer' ? (
              <CustomAlertDialog
                isDisabled={isLoading}
                trigger={
                  <Button
                    className="border-2"
                    type="button"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Submitting...' : 'Submit'}
                  </Button>
                }
                title="Transfer Transaction"
                description="You are about to transfer this transaction to another account."
                body={
                  <>
                    <span className="font-semibold">
                      Important notes:
                    </span>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-800">
                      <li>
                        Changes are not synchronized
                        automatically between accounts
                      </li>
                      <li>
                        To edit a transferred transaction,
                        you must update it separately in
                        both accounts
                      </li>
                    </ul>
                  </>
                }
                confirmMessage={
                  isLoading ? 'Confirming...' : 'Confirm'
                }
                type="submit"
                onConfirm={form.handleSubmit(onSubmit)}
              />
            ) : (
              <Button
                className="border-2"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit'}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </main>
  );
}
