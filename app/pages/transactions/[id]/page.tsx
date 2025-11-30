"use client";
import { useState, useEffect } from "react";
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
import { transactionSchema } from "@/schema/transactions.schema";
import { fetchCategories } from "@/store/categories.store";
import { useAccount } from "@/context/account-context";
import { Category } from "@/types/categories.types";
import { toast } from "sonner";
import { deleteTransaction, editTransactions, fetchTransactionByID } from "@/store/transactions.store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDownIcon, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { transactionTypes } from "@/lib/data";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EditTransaction } from "@/types/transactions.types";

export default function EditTransactionForm() {
  const [datePickerOpen, setDatePickerOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("");
  const router = useRouter();
  const { selectedAccountID  } = useAccount();
  const params = useParams();
  const id = params.id as string;
  const [categories, setCategories] = useState<Category[]>([]);
  const [transaction, setTransaction] = useState<EditTransaction>({
    id: "",
    note: "",
    time: "",
    type: "",
    amount: "0.00",
    category: "",
    date: "",
    refCategoriesID: "",
    refUserID: "",
    refAccountsID: ""
  });

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
  const transactionDate = form.getValues('date');

  async function onSubmit(values: z.infer<typeof transactionSchema>) {
    setIsLoading(true);
    const transactionData = {
      ...values,
      amount: parseFloat(values.amount) // Convert string to number
    };
    editTransactions(id, transactionData)
      .then((transaction) => {
        toast.success(transaction.responseMessage);
        router.push('/pages/transactions');
      })
      .catch((error) => {
        toast.error(error.message);
      })
      .finally(() => {
        setIsLoading(false);
      })
  };

  const handleDelete = (id: string) => {
    setIsLoading(true);
    deleteTransaction(id)
      .then((transaction) => {
        toast.success(transaction.responseMessage);
        router.push('/pages/transactions');
      })
      .catch((error) => {
        toast.error(error.message);
      })
      .finally(() => {
        setIsLoading(false);
      })
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
  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    fetchTransactionByID(id)
      .then((transaction) => {
        if (transaction) {
          setActiveTab(transaction[0].type);
          setTransaction(transaction[0]);
        }
      })
      .catch((error) => {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Failed to load transaction data");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
    
  }, [id, setActiveTab]);

  // Fetch categories
  useEffect(() => {
    if (!selectedAccountID) return;
    setIsLoading(true);
    form.setValue('refAccountsID', selectedAccountID);
    fetchCategories(activeTab, selectedAccountID)
      .then((categories) => {
        setCategories(categories[0]?.details);
      })
      .catch((error) => {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      })
      .finally(() => {
        setIsLoading(false);
      })
  },[form, activeTab, selectedAccountID]);

  // Set form values
  useEffect(() => {
    if (!transaction && !categories) return;
    form.setValue('note', transaction.note);
    form.setValue('amount', transaction.amount);
    if (!form.getValues('type')) {
      form.setValue('type', transaction.type);
    };
    form.setValue('time', transaction.time);
    form.setValue('date', transaction.date);
    form.setValue('refCategoriesID', transaction.refCategoriesID);
  }, [form, transaction, categories]);

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
                onClick={() => handleDelete(id)}
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
                    placeholder="PHP 0.00..."
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
                          {categories.map((category, index) => (
                              <SelectItem key={index} value={category.id}>
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
              disabled={isLoading}
              render={({ field }) => (
                <FormItem className="-space-y-1 w-full">
                  <FormLabel className="text-md font-medium">
                    Time
                  </FormLabel>
                  <FormControl>
                    <Input
                      required
                      placeholder="Time..."
                      type="time"
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
