"use client";
import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchSession } from "@/utils/session";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TypographyH3 } from "@/components/custom/typography";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { transactionSchema } from "@/lib/schema/transactions.schema";
import { useAccount } from "@/context/account-context";
import { Category } from "@/types/categories.types";
import { toast } from "sonner";
import { deleteTransaction, editTransaction } from "@/lib/tq-functions/transactions.tq.functions";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDownIcon, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { transactionTypes } from "@/lib/data";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EditTransactionPayload } from "@/types/transactions.types";
import { 
  dateToTimeString, 
  TimePicker, 
  timeStringToDate 
} from "@/components/custom/timepicker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoryQueryOptions } from "@/lib/tq-options/categories.tq.options";
import { transactionByIDQueryOptions } from "@/lib/tq-options/transactions.tq.options";

export default function EditTransactionForm() {
  const [datePickerOpen, setDatePickerOpen] = useState<boolean>(false);
  const [transactionDate, setTransactionDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("");
  const router = useRouter();
  const { selectedAccountID  } = useAccount();
  const queryClient = useQueryClient();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    fetchSession()
      .then(({session}) => {
        if (!session) {
          router.push('/auth/login')
        }
      })
  },[router])

  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      note: "",
      amount: "0.00",
      type: "",
      time: new Date().toTimeString().substring(0, 5),
      date: new Date().toISOString().split('T')[0],
      refCategoriesID: "",
    }
  });

  const { mutate: editTransactionMutation } = useMutation({
    mutationFn: (transactionData: EditTransactionPayload) => editTransaction(id, transactionData),
    onMutate: () => {
      setIsLoading(true);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: transactionByIDQueryOptions(id).queryKey
      });
      toast.success(data.responseMessage);
      form.reset();
      router.push('/pages/transactions');
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });

  const { mutate: deleteTransactionMutation } = useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onMutate: () => {
      setIsLoading(true);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: transactionByIDQueryOptions(id).queryKey
      });
      toast.success(data.responseMessage);
      form.reset();
      router.push('/pages/transactions');
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });

  async function onSubmit(values: z.infer<typeof transactionSchema>) {
    const transactionData = {
      ...values,
      amount: parseFloat(values.amount)
    };
    editTransactionMutation(transactionData);
  };

  // Set form value from Tab Selector
  useEffect(() => {
    if (
      activeTab
      && (activeTab === 'income'
      || activeTab === 'expense')
    ) {
      form.setValue('type', activeTab);
    }
  }, [activeTab, form]);

  // Fetch transaction data
  const { data: transactionData } = useQuery(
    transactionByIDQueryOptions(id)
  );

  const transaction = useMemo(() => {
    return transactionData?.[0];
  }, [transactionData])

  useEffect(() => {
    if (!transaction) {
      return;
    } else {
      setActiveTab(transaction.type);
    };
  }, [transaction, setActiveTab]);

  // Fetch categories
  const { data: categoriesData } = useQuery(
    categoryQueryOptions(
      activeTab!,
      selectedAccountID!
    )
  );
  const categories = useMemo(() => {
    return categoriesData?.[0]?.details;
  }, [categoriesData]);

  // Set form values
  useEffect(() => {
    if (!transaction || !categories || !selectedAccountID) return;
    form.setValue('note', transaction.note);
    form.setValue('amount', transaction.amount);
    if (!form.getValues('type')) {
      form.setValue('type', transaction.type);
    };
    form.setValue('time', transaction.time);
    setTransactionDate(transaction.date)
    form.setValue('refCategoriesID', transaction.refCategoriesID);
    form.setValue('refAccountsID', selectedAccountID);
  }, [form, transaction, categories, selectedAccountID]);

  return (
    <main className='flex flex-col space-y-4 p-3'>
      <div className="flex justify-between items-center">
        <TypographyH3>
          Edit Transaction
        </TypographyH3>
        <Dialog>
          <DialogTrigger className="text-red-500" disabled={isLoading}>
            <Trash2 size={24}/>
          </DialogTrigger>
          <DialogContent
            className="border-2 bg-primary [&>button]:hidden"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <DialogHeader className="text-left">
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription className="text-gray-800">
                This action cannot be undone. It will be permanently deleted.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-row justify-between">
              <DialogClose asChild>
                <Button variant="outline" className="border-2">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                variant="destructive"
                className="border-2"
                onClick={() => deleteTransactionMutation(id)}
              >
                Yes, I&apos;m sure
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="-mt-1">
        <TabsList className='bg-white border-2 w-full h-10'>
          {transactionTypes.map((category, index) => (
            <TabsTrigger
              value={category.toLowerCase()}
              key={index}
              disabled={true}
              className={`text-md
                ${
                  activeTab === 'expense'
                    ? 'data-[state=active]:bg-red-400'
                    : 'data-[state=active]:bg-green-300'
                }`
              }
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-4">
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
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                    <SelectTrigger className="w-[180px] bg-white border-2 border-black w-full h-9">
                      <SelectValue placeholder="Select Category..." />
                    </SelectTrigger>
                    <SelectContent className="border-2">
                      {categories && (
                        <>
                          {categories.map((category: Category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
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
                    <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          disabled={isLoading}
                          variant="outline"
                          id="date"
                          className="justify-between font-normal border-2 bg-white text-[16px]"
                        >
                          {transactionDate ? new Date(transactionDate).toLocaleDateString() : "Select date"}
                          <ChevronDownIcon />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={transactionDate ? new Date(transactionDate) : undefined}
                          captionLayout="dropdown"
                          disabled={(date) => date > new Date()}
                          onSelect={(date) => {
                            if (date) {
                              const year = date.getFullYear();
                              const month = String(date.getMonth() + 1).padStart(2, '0');
                              const day = String(date.getDate()).padStart(2, '0');
                              const formattedDate = `${year}-${month}-${day}`;
                              field.onChange(formattedDate);
                            }
                            setDatePickerOpen(false)
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
                          const timeString = dateToTimeString(date);
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
          <div className='flex flex-row justify-between'>
            <Button
              onClick={() => router.back()}
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
};
