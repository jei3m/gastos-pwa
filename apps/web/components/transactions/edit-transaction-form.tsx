import { useState, useEffect, useMemo } from 'react';
import type { Key } from 'react';
import { useNavigate, useParams } from 'react-router';
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
import { editTransactionSchema } from '@/lib/schema/transactions.schema';
import { useAccount } from '@/context/account-context';
import type { Category } from '@/features/categories/categories.interface';
import { toast } from '@/lib/toast';
import {
  deleteTransaction,
  editTransaction,
} from '@/features/transactions/transactions.tq.functions';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  ChevronDown,
  ChevronLeft,
  Loader,
  Trash2,
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { transactionTypes } from '@/lib/data';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import type {
  EditTransactionPayload,
  TransactionDetails,
} from '@/features/transactions/transactions.interface';
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
import { categoryQueryOptions } from '@/features/categories/categories.tq.options';
import { transactionByIDQueryOptions } from '@/features/transactions/transactions.tq.options';
import CustomAlertDialog from '@/components/custom/custom-alert-dialog';
import type { Account } from '@/features/accounts/accounts.interface';
import { cn } from '@/lib/utils';
import { authClient } from '@/lib/auth/auth-client';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface EditTransactionFormProps {
  isModal?: boolean;
  onClose?: () => void;
}

type EditTransactionFormValues = z.infer<
  typeof editTransactionSchema
>;

type EditableTransaction = TransactionDetails & {
  date: string;
  refCategoriesID?: string;
  refTransferToAccountsID?: string;
};

export default function EditTransactionForm({
  isModal = false,
  onClose,
}: EditTransactionFormProps) {
  const [datePickerOpen, setDatePickerOpen] =
    useState<boolean>(false);
  const navigate = useNavigate();
  const {
    selectedAccountID,
    accounts,
    selectedAccountDetails,
  } = useAccount();
  const queryClient = useQueryClient();
  const params = useParams();
  const id =
    (params.transactionID as string) ||
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
      time:
        // eslint-disable-next-line react/purity
        new Date().toTimeString().substring(0, 5),
      date:
        // eslint-disable-next-line react/purity
        new Date().toISOString().split('T')[0],
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
      void queryClient.invalidateQueries({
        queryKey: transactionByIDQueryOptions(id).queryKey,
      });
      toast.success(
        (data as { responseMessage: string })
          .responseMessage
      );
      form.reset();
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

  const {
    mutate: deleteTransactionMutation,
    isPending: isDeleteTransactionPending,
  } = useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: transactionByIDQueryOptions(id).queryKey,
      });
      toast.success(
        (data as { responseMessage: string })
          .responseMessage
      );
      form.reset();
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
    values: z.infer<typeof editTransactionSchema>
  ) {
    const transactionData: EditTransactionPayload = {
      ...values,
      amount: parseFloat(values.amount),
      transferFee: values.transferFee
        ? parseFloat(values.transferFee)
        : undefined,
    };
    editTransactionMutation(transactionData);
  }

  const {
    data: transactionData,
    isPending: isTransactionPending,
  } = useQuery(transactionByIDQueryOptions(id));

  const transaction = useMemo(() => {
    return transactionData?.[0] as
      | EditableTransaction
      | undefined;
  }, [transactionData]);

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
      type: (transaction.isTransfer
        ? 'transfer'
        : transaction.type) as EditTransactionFormValues['type'],
      note: transaction.note,
      amount: transaction.amount.toFixed(2),
      transferFee: (transaction.transferFee ?? 0).toFixed(
        2
      ),
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

  const isAccountOwner = useMemo(() => {
    return selectedAccountDetails?.isOwner ? true : false;
  }, [selectedAccountDetails]);

  const isCreator = useMemo(() => {
    return transaction?.refUserID === session?.user.id;
  }, [transaction, session]);

  const isReadonly = useMemo(() => {
    return !isLoading && !isCreator && !isAccountOwner;
  }, [isLoading, isCreator, isAccountOwner]);

  const isDisabled = useMemo(() => {
    return isLoading || isReadonly;
  }, [isLoading, isReadonly]);

  const isTransactionTypeDisabled = useMemo(() => {
    return Boolean(transaction) || isDisabled;
  }, [transaction, isDisabled]);

  return (
    <main
      className={cn(
        'flex flex-col space-y-2 md:space-y-4',
        !isModal && 'p-3'
      )}
    >
      {!isModal && (
        <>
          {isReadonly ? (
            <div
              onClick={() => navigate(-1)}
              className="flex items-center cursor-pointer"
            >
              <ChevronLeft className="mr-2" size={22} />
              <TypographyH3>
                Transaction Details
              </TypographyH3>
            </div>
          ) : (
            !isReadonly && (
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
          className="flex flex-col space-y-6"
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
                            disabled={
                              isTransactionTypeDisabled
                            }
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
            disabled={isDisabled}
            render={({ field }) => (
              <FormItem className="-space-y-1">
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    required
                    placeholder="0.00"
                    {...field}
                    readOnly={isReadonly}
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
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isDisabled}
                    >
                      <SelectTrigger
                        className={cn(
                          'w-full',
                          isReadonly &&
                            'bg-gray-50 border-dashed border-gray-300 disabled:opacity-100 disabled:cursor-default'
                        )}
                      >
                        <SelectValue placeholder="Select Category..." />
                      </SelectTrigger>
                      <SelectContent>
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
            <div className="flex gap-2 items-start w-full">
              <FormField
                control={form.control}
                name="refTransferToAccountsID"
                render={({ field }) => (
                  <FormItem className="-space-y-1 flex-2">
                    <FormLabel className="text-md font-medium">
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
                              'w-full h-9',
                              isReadonly &&
                                'bg-gray-50 border-dashed border-gray-300 disabled:opacity-100 disabled:cursor-default'
                            )}
                          >
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
                  <FormItem className="-space-y-1 flex-2">
                    <FormLabel className="text-md font-medium">
                      Transfer Fee
                    </FormLabel>
                    <FormControl>
                      <Input
                        required
                        placeholder="0.00"
                        {...field}
                        readOnly={isReadonly}
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
                <FormLabel>Note</FormLabel>
                <FormControl>
                  <Input
                    required
                    placeholder="Transaction note..."
                    {...field}
                    readOnly={isReadonly}
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
                            disabled={isDisabled}
                            variant="outline"
                            id="date"
                            className={cn(
                              'justify-between font-normal text-[16px] h-9 md:h-10',
                              isReadonly &&
                                'bg-gray-50 border-dashed border-gray-300 disabled:opacity-100'
                            )}
                          >
                            {field.value
                              ? new Date(
                                  field.value
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
                      disabled={isDisabled}
                      readOnly={isReadonly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {!isReadonly && (
            <div className="flex flex-row justify-between">
              <Button
                onClick={() => {
                  if (isModal && onClose) {
                    onClose();
                  } else {
                    void navigate(-1);
                  }
                }}
                className="bg-red-500"
                disabled={isDisabled}
                type="button"
              >
                Cancel
              </Button>
              <Button
                className="space-x-2"
                type="submit"
                disabled={isDisabled}
              >
                {isLoading && (
                  <Loader className="animate-spin" />
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
                creator or account owner can make changes.
              </p>
            </>
          )}
        </form>
      </Form>
    </main>
  );
}
