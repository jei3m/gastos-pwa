'use client';
import { useState, useEffect, useMemo, Key } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { editTransactionSchema } from '@/lib/schema/transactions.schema';
import { useAccount } from '@/context/account-context';
import { Category } from '@/types/categories.types';
import { toast } from 'sonner';
import {
  deleteTransaction,
  editTransaction,
} from '@/lib/tq-functions/transactions.tq.functions';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ChevronDownIcon, Trash2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { transactionTypes } from '@/lib/data';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { EditTransactionPayload } from '@/types/transactions.types';
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
import { categoryQueryOptions } from '@/lib/tq-options/categories.tq.options';
import { transactionByIDQueryOptions } from '@/lib/tq-options/transactions.tq.options';
import CustomAlertDialog from '@/components/custom/custom-alert-dialog';
import { Account } from '@/types/accounts.types';
import { cn } from '@/lib/utils';

interface EditTransactionFormProps {
  id?: string;
  isModal?: boolean;
  onClose?: () => void;
}

export default function EditTransactionForm({
  id: propId,
  isModal = false,
  onClose,
}: EditTransactionFormProps) {
  const [datePickerOpen, setDatePickerOpen] =
    useState<boolean>(false);
  const router = useRouter();
  const { selectedAccountID, accounts } = useAccount();
  const queryClient = useQueryClient();
  const params = useParams();
  const id = propId || (params.id as string);

  const filteredAccounts =
    accounts?.filter(
      (account: Account) => account.id !== selectedAccountID
    ) || [];

  const form = useForm<
    z.infer<typeof editTransactionSchema>
  >({
    resolver: zodResolver(editTransactionSchema),
    defaultValues: {
      note: '',
      amount: '0.00',
      type: '',
      time: new Date().toTimeString().substring(0, 5),
      date: new Date().toISOString().split('T')[0],
      refCategoriesID: '',
      refTransferToAccountsID: '',
    },
  });
  const transactionType = useWatch({
    control: form.control,
    name: 'type',
  });

  const {
    mutate: editTransactionMutation,
    isPending: IsEditTransactionPending,
  } = useMutation({
    mutationFn: (transactionData: EditTransactionPayload) =>
      editTransaction(id, transactionData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: transactionByIDQueryOptions(id).queryKey,
      });
      toast.success(data.responseMessage);
      form.reset();
      if (isModal && onClose) {
        onClose();
      } else {
        router.push('/pages/transactions');
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const {
    mutate: deleteTransactionMutation,
    isPending: isDeleteTransactionPending,
  } = useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: transactionByIDQueryOptions(id).queryKey,
      });
      toast.success(data.responseMessage);
      form.reset();
      if (isModal && onClose) {
        onClose();
      } else {
        router.push('/pages/transactions');
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  async function onSubmit(
    values: z.infer<typeof editTransactionSchema>
  ) {
    const transactionData = {
      ...values,
      amount: parseFloat(values.amount),
    };
    editTransactionMutation(transactionData);
  }

  // Fetch transaction data
  const {
    data: transactionData,
    isPending: isTransactionPending,
  } = useQuery(transactionByIDQueryOptions(id));

  const transaction = useMemo(() => {
    return transactionData?.[0];
  }, [transactionData]);

  // Fetch categories
  const {
    data: categoriesData,
    isPending: isCategoriesPending,
  } = useQuery(
    categoryQueryOptions(
      transactionType!,
      selectedAccountID!,
      null,
      null,
      'list'
    )
  );
  const categories = useMemo(() => {
    return categoriesData;
  }, [categoriesData]);

  // Set form values
  useEffect(() => {
    if (!transaction || !selectedAccountID) return;
    if (
      transaction.isTransfer &&
      !accounts &&
      !transaction.isTransfer &&
      !categories
    )
      return;
    form.reset({
      type: transaction.isTransfer
        ? 'transfer'
        : transaction.type,
      note: transaction.note,
      amount: transaction.amount,
      transferFee: transaction.transferFee,
      time: transaction.time,
      date: transaction.date,
      refCategoriesID: transaction.refCategoriesID,
      refAccountsID: selectedAccountID,
      refTransferToAccountsID:
        transaction.refTransferToAccountsID || '',
    });
  }, [
    form,
    transaction,
    categories,
    accounts,
    selectedAccountID,
  ]);

  const isLoading = useMemo(() => {
    return transactionType !== 'transfer'
      ? isCategoriesPending ||
          isTransactionPending ||
          IsEditTransactionPending ||
          isDeleteTransactionPending
      : isTransactionPending ||
          IsEditTransactionPending ||
          isDeleteTransactionPending;
  }, [
    transactionType,
    isCategoriesPending,
    isTransactionPending,
    IsEditTransactionPending,
    isDeleteTransactionPending,
  ]);

  return (
    <main
      className={cn(
        'flex flex-col space-y-4',
        !isModal && 'p-3'
      )}
    >
      {!isModal && (
        <div className="flex justify-between items-center">
          <TypographyH3>Edit Transaction</TypographyH3>
          <CustomAlertDialog
            isDisabled={isLoading}
            trigger={
              <Trash2 size={24} className="text-red-500" />
            }
            title="Are you sure?"
            description="This action cannot be undone. It will be permanently deleted."
            confirmMessage="Yes, I'm sure"
            onConfirm={() => deleteTransactionMutation(id)}
          />
        </div>
      )}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col space-y-4"
        >
          <FormField
            control={form.control}
            name="type"
            disabled={isLoading}
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
                        (category, index) => (
                          <TabsTrigger
                            value={category.toLowerCase()}
                            key={index}
                            disabled={true}
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
                            {category}
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
                    className="h-9
                    rounded-lg border-2
                    border-black bg-white"
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
              disabled={isLoading}
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
                              (category: Category) => (
                                <SelectItem
                                  key={category.id}
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
          <div className="grid grid-cols-2 gap-x-2">
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
                          {field.value
                            ? new Date(
                                field.value
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
                            field.value
                              ? new Date(field.value)
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
                isModal && onClose
                  ? onClose()
                  : router.back();
              }}
              className="bg-red-500 border-2 hover:none"
              disabled={isLoading}
              type="button"
            >
              Cancel
            </Button>
            <Button
              className="border-2"
              type="submit"
              disabled={isLoading}
            >
              Submit
            </Button>
          </div>
        </form>
      </Form>
    </main>
  );
}
