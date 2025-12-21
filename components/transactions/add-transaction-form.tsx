"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { fetchCategories } from "@/lib/tq-functions/categories.tq.functions";
import { useAccount } from "@/context/account-context";
import { Category } from "@/types/categories.types";
import { toast } from "sonner";
import { createTransaction } from "@/lib/tq-functions/transactions.tq.functions";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { transactionTypes } from "@/lib/data";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  dateToTimeString, 
  TimePicker, 
  timeStringToDate 
} from "@/components/custom/timepicker";

export default function AddTransactionForm() {
  const [datePickerOpen, setDatePickerOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const transactionTypeParam = searchParams.get('type');
  const { selectedAccountID  } = useAccount();

  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      note: "",
      amount: "",
      type: "",
      time: new Date().toTimeString().substring(0, 5),
      date: new Date().toLocaleDateString('en-CA'), // Use 'en-CA' locale which formats as YYYY-MM-DD
      refCategoriesID: ""
    }
  });
  const transactionDate = form.getValues('date');

  async function onSubmit(values: z.infer<typeof transactionSchema>) {
    setIsLoading(true);
    const transactionData = {
      ...values,
      amount: parseFloat(values.amount) // Convert string to number
    };
    createTransaction(transactionData)
      .then((transaction) => {
        router.push('/pages/transactions');
        form.reset();
        toast.success(transaction.responseMessage);
      })
      .catch((error) => {
        if(error instanceof Error) {
          toast.error(error.message);
          return;
        };
        toast.error('Failed to Create Transaction');
      })
      .finally(() => {
        setIsLoading(false);
      })
  };

  // Set initial tab value and form value from url param
  useEffect(() => {
    if (
      transactionTypeParam
      && (transactionTypeParam === 'income'
      ||  transactionTypeParam === 'expense')
    ) {
      setActiveTab(transactionTypeParam);
      form.setValue('type', transactionTypeParam)
    };
  }, [form, transactionTypeParam]);

  // Set form value from Tab Selector
  useEffect(() => {
    if (
      activeTab
      && (activeTab === 'income'
      || activeTab === 'expense')
    ) {
      form.setValue('type', activeTab)
    }
  }, [activeTab, form]);

  useEffect(() => {
    if (!selectedAccountID) return;
    setIsLoading(true);
    form.setValue('refAccountsID', selectedAccountID);
    if (activeTab) {
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
    }
  },[form, activeTab, selectedAccountID]);

  return (
    <main className='flex flex-col space-y-4 p-3'>
      <TypographyH3>
        New Transaction
      </TypographyH3>
      <Tabs defaultValue='daily' value={activeTab} onValueChange={setActiveTab} className="-mt-1">
        <TabsList className='bg-white border-2 w-full h-10'>
          {transactionTypes.map((category, index) => (
            <TabsTrigger
              value={category.toLowerCase()}
              key={index}
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
          <FormField
            control={form.control}
            name="refCategoriesID"
            render={({ field }) => (
              <FormItem className="-space-y-1">
                <FormLabel className="text-md font-medium">
                  Category
                </FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='flex flex-row justify-between'>
            <Button
              onClick={() => {
                form.reset();
                router.back();
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
              {isLoading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </Form>
    </main>
  );
};
