import { useState, useEffect, useMemo } from 'react';
import type { Key } from 'react';
import { useNavigate } from 'react-router';
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
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { createTransactionSchema } from '@/features/transactions/transactions.schema';
import { useAccount } from '@/context/account-context';
import type { Category } from '@/features/categories/categories.interface';
import { toast } from '@/lib/toast';
import { createTransaction } from '@/features/transactions/transactions.tq.functions';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ChevronDown, Loader } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { transactionTypes } from '@/lib/data';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { TimePicker } from '@/components/custom/time-picker';
import {
  dateToTimeString,
  timeStringToDate,
} from '@/lib/time';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { CreateTransaction } from '@/features/transactions/transactions.interface';
import { transactionsInfiniteQueryOptions } from '@/features/transactions/transactions.tq.options';
import { categoryQueryOptions } from '@/features/categories/categories.tq.options';
import type { Account } from '@/features/accounts/accounts.interface';
import CustomAlertDialog from '@/components/custom/custom-alert-dialog';
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
  const navigate = useNavigate();
  const { selectedAccountID, accounts } = useAccount();
  const queryClient = useQueryClient();

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
      date: '',
      refCategoriesID: '',
      refAccountsID: '',
      refTransferToAccountsID: '',
    },
  });
  const transactionDate = useWatch({
    control: form.control,
    name: 'date',
  });
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
      !!transactionType && !!selectedAccountID,
      null,
      null,
      'options'
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
      void queryClient.invalidateQueries({
        queryKey: transactionsInfiniteQueryOptions(
          selectedAccountID!,
          ''
        ).queryKey,
      });
      form.reset();
      toast.success(
        (data as { responseMessage: string })
          .responseMessage
      );
      if (isModal && onClose) {
        onClose();
      } else {
        void navigate('/transactions');
      }
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
      amount: parseFloat(values.amount),
      transferFee: parseFloat(values.transferFee || '0'),
    };
    createTransactionMutation(transactionData);
  }

  useEffect(() => {
    if (
      transactionTypeParam &&
      (transactionTypeParam === 'income' ||
        transactionTypeParam === 'expense')
    ) {
      form.setValue('type', transactionTypeParam);
    }
  }, [form, transactionTypeParam]);

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
  }, [selectedAccountID, form]);

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
        'flex flex-col space-y-2 md:space-y-4',
        !isModal && 'p-3'
      )}
    >
      {!isModal && (
        <TypographyH3>New Transaction</TypographyH3>
      )}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col space-y-6"
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
                                ? 'data-active:bg-red-400'
                                : 'data-active:bg-green-300'
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
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    required
                    placeholder="0.00"
                    {...field}
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
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Category..." />
                      </SelectTrigger>
                      <SelectContent>
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
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="Select Account..." />
                        </SelectTrigger>
                        <SelectContent>
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
                <FormLabel>Note</FormLabel>
                <FormControl>
                  <Input
                    required
                    placeholder="Transaction note..."
                    {...field}
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
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Popover
                      open={datePickerOpen}
                      onOpenChange={setDatePickerOpen}
                    >
                      <PopoverTrigger
                        render={
                          <Button
                            disabled={isLoading}
                            variant="outline"
                            id="date"
                            className="justify-between font-normal text-[16px] h-9 md:h-10"
                          >
                            {transactionDate
                              ? new Date(
                                  transactionDate
                                ).toLocaleDateString()
                              : 'Select date'}
                            <ChevronDown />
                          </Button>
                        }
                      />
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
                  <FormLabel>Time</FormLabel>
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
                  void navigate(-1);
                }
              }}
              className="bg-red-500"
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
                className="space-x-2"
                type="submit"
                disabled={isLoading}
              >
                {isLoading && (
                  <Loader className="animate-spin" />
                )}
                Submit
              </Button>
            )}
          </div>
        </form>
      </Form>
    </main>
  );
}
