"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { createTransactionSchema } from "@/schema/transactions.schema";
import { fetchCategories } from "@/store/categories.store";
import { useAccount } from "@/context/account-context";
import { Category } from "@/types/categories.types";
import { toast } from "sonner";
import { createTransaction } from "@/store/transactions.store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

export default function AddTransaction() {
  const [datePickerOpen, setDatePickerOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const transactionTypeParam = searchParams.get('type');
  const { selectedAccountID  } = useAccount();

  useEffect(() => {
    fetchSession()
      .then(({session}) => {
        if (!session) {
          router.push('/auth/login')
        }
      })
  },[router])

  const form = useForm<z.infer<typeof createTransactionSchema>>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      note: "",
      amount: "0.00",
      type: "",
      time: new Date().toTimeString().substring(0, 5),
      date: new Date().toISOString().split('T')[0],
      categoryID: ""
    }
  });

  const transactionDate = form.getValues('date');

  async function onSubmit(values: z.infer<typeof createTransactionSchema>) {
    setIsLoading(true);
    const transactionData = {
      ...values,
      amount: parseFloat(values.amount) // Convert string to number
    };
    createTransaction(transactionData)
      .then((transaction) => {
        router.push('/pages/transactions')
        toast.success(transaction.responseMessage);
      })
      .catch((error) => {
        if(error instanceof Error) {
          toast.error(error.message);
          return;
        };
        console.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      })
  };

  useEffect(() => {
    if (
      transactionTypeParam
      && (transactionTypeParam === 'income'
      ||  transactionTypeParam === 'expense')
    ) {
      form.setValue('type', transactionTypeParam)
    };
  }, [form, transactionTypeParam]);

  useEffect(() => {
    if (!selectedAccountID) return;
    fetchCategories(form.getValues('type'), selectedAccountID)
      .then((categories) => {
        setIsLoading(true);
        setCategories(categories);
      })
      .catch((error) => {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      })
      .finally(() => {
        setIsLoading(false);
      })
  },[form, selectedAccountID])

  return (
    <main className='flex flex-col space-y-4 p-3'>
      <TypographyH3 className="text-center">
        Create New {
        transactionTypeParam 
        && transactionTypeParam.charAt(0).toUpperCase() 
          + transactionTypeParam.slice(1)
        }
      </TypographyH3>
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
            name="categoryID"
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
                      {categories.map((category, index) => (
                        <SelectItem key={index} value={category.uuid}>
                          {category.name}
                        </SelectItem>
                      ))}
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
              {isLoading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </Form>
    </main>
  );
};
