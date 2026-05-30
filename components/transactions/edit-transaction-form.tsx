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
import {
  ChevronDownIcon,
  ChevronLeft,
  Loader2,
  Trash2,
} from 'lucide-react';
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
import { authClient } from '@/lib/auth/auth-client';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Separator } from '../ui/separator';

interface EditTransactionFormProps {
  isModal?: boolean;
  onClose?: () => void;
}

export default function EditTransactionForm({
  isModal = false,
  onClose,
}: EditTransactionFormProps) {
  const [datePickerOpen, setDatePickerOpen] =
    useState<boolean>(false);
  const router = useRouter();
  const { selectedAccountID, accounts } = useAccount();
  const queryClient = useQueryClient();
  const params = useParams();
  const id =
    (params['transaction-id'] as string) ||
    (params.id as string);

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
      !!transactionType && !!selectedAccountID,
      null,
      null,
      'options'
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

  const { data: session } = authClient.useSession();

  const isCreator = useMemo(() => {
    return transaction?.refUserID === session?.user.id;
  }, [transaction, session]);

  const isReadonly = useMemo(() => {
    return !isLoading && !isCreator;
  }, [isLoading, isCreator]);

  const isDisabled = useMemo(() => {
    return isLoading || isReadonly;
  }, [isLoading, isReadonly]);

  return (
    <main
      className={cn(
        'flex flex-col space-y-4',
        !isModal && 'p-3'
      )}
    >
      {!isModal && (
        <>
          {isReadonly ? (
            <div
              onClick={() => router.back()}
              className="flex items-center cursor-pointer"
            >
              <ChevronLeft className="mr-2" size={22} />
              <TypographyH3>
                Transaction Details
              </TypographyH3>
            </div>
          ) : (
            isCreator && (
              <div className="flex justify-between items-center">
                <TypographyH3>
                  Edit Transaction
                </TypographyH3>
                <CustomAlertDialog
                  isDisabled={isDisabled}
                  trigger={
                    <Trash2
                      size={24}
                      className="text-red-500"
                    />
                  }
                  title="Are you sure?"
                  description="This action cannot be undone. It will be permanently deleted."
                  confirmMessage="Yes, I'm sure"
                  onConfirm={() =>
                    deleteTransactionMutation(id)
                  }
                />
              </div>
            )
          )}
        </>
      )}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col space-y-4"
        >
          <FormField
            control={form.control}
            name="type"
            disabled={isDisabled}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Tabs
                    value={field.value.toLowerCase()}
                    onValueChange={field.onChange}
                    className="-mt-1"
                  >
                    <TabsList
                      className={cn(
                        'bg-white border-2 w-full h-10',
                        isReadonly &&
                          'bg-gray-50 border-dashed border-gray-300'
                      )}
                    >
                      {transactionTypes.map(
                        (type, index) => (
                          <TabsTrigger
                            value={type.toLowerCase()}
                            key={index}
                            disabled={isDisabled}
                            className={cn(
                              'text-md',
                              field.value.toLowerCase() ===
                                'expense' ||
                                field.value.toLowerCase() ===
                                  'transfer'
                                ? 'data-[state=active]:bg-red-400'
                                : 'data-[state=active]:bg-green-300'
                            )}
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
            disabled={isDisabled}
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
                    readOnly={isReadonly}
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
              disabled={isDisabled}
              render={({ field }) => (
                <FormItem className="-space-y-1">
                  <FormLabel className="text-md font-medium">
                    Category
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isDisabled}
                    >
                      <SelectTrigger
                        className={cn(
                          'w-[180px] bg-white border-2 border-black w-full h-9',
                          isReadonly &&
                            'bg-gray-50 border-dashed border-gray-300 disabled:opacity-100 disabled:cursor-default'
                        )}
                      >
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
                      {isReadonly &&
                      !filteredAccounts.find(
                        (a) => a.id === field.value
                      ) ? (
                        <p className="flex items-center h-9 px-3 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-base">
                          {transaction?.transferToAccountName ||
                            'N/A'}
                        </p>
                      ) : (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isDisabled}
                        >
                          <SelectTrigger
                            className={cn(
                              'w-[180px] bg-white border-2 border-black w-full h-9 rounded-lg',
                              isReadonly &&
                                'bg-gray-50 border-dashed border-gray-300 disabled:opacity-100 disabled:cursor-default'
                            )}
                          >
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
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="transferFee"
                disabled={isDisabled}
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
                        readOnly={isReadonly}
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
            disabled={isDisabled}
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
                    readOnly={isReadonly}
                    className="h-9 rounded-lg border-2 border-black bg-white"
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
                          disabled={isDisabled}
                          variant="outline"
                          id="date"
                          className={cn(
                            'justify-between font-normal border-2 bg-white text-[16px] h-9 md:h-10',
                            isReadonly &&
                              'bg-gray-50 border-dashed border-gray-300 disabled:opacity-100'
                          )}
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
                      disabled={isDisabled}
                      readOnly={isReadonly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {isCreator && (
            <div className="flex flex-row justify-between">
              <Button
                onClick={() => {
                  isModal && onClose
                    ? onClose()
                    : router.back();
                }}
                className="bg-red-500 border-2 hover:none"
                disabled={isDisabled}
                type="button"
              >
                Cancel
              </Button>
              <Button
                className="border-2 space-x-2"
                type="submit"
                disabled={isDisabled}
              >
                {isLoading && (
                  <Loader2 className="animate-spin" />
                )}
                Submit
              </Button>
            </div>
          )}
          {isReadonly && (
            <>
              <Separator />
              <div className="flex justify-center items-center gap-2 px-1 mb-6">
                <Avatar className="size-7">
                  <AvatarImage
                    src={transaction?.userImage ?? ''}
                    alt={transaction?.userName ?? ''}
                  />
                  <AvatarFallback className="text-xs">
                    {transaction?.userName
                      ?.charAt(0)
                      ?.toUpperCase() ?? '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm md:text-md text-muted-foreground">
                  Created by{' '}
                  {transaction?.userName ?? 'Unknown'}
                </span>
              </div>
              <p className="text-sm md:text-md text-muted-foreground text-center">
                This transaction is view-only. Only the
                creator can make changes.
              </p>
            </>
          )}
        </form>
      </Form>
    </main>
  );
}
