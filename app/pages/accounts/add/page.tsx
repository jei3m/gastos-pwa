'use client';
import { useRouter } from 'next/navigation';
import { createAccount } from '@/lib/tq-functions/accounts.tq.functions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { useForm } from 'react-hook-form';
import { createAccountSchema } from '@/lib/schema/acccounts.schema';
import { toast } from 'sonner';
import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { accountsQueryOptions } from '@/lib/tq-options/accounts.tq.options';

export default function CreateAccount() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof createAccountSchema>>(
    {
      resolver: zodResolver(createAccountSchema),
      defaultValues: {
        name: '',
        type: '',
        description: '',
      },
    }
  );

  const { mutate: createAccountMutation, isPending } =
    useMutation({
      mutationFn: (
        values: z.infer<typeof createAccountSchema>
      ) => createAccount(values),
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: accountsQueryOptions().queryKey,
        });
        form.reset();
        toast.success(data.responseMessage);
        router.push('/pages/settings');
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  async function onSubmit(
    values: z.infer<typeof createAccountSchema>
  ) {
    createAccountMutation(values);
  }

  return (
    <main className="flex flex-col space-y-4 p-3">
      <TypographyH3>
        Create New Account
      </TypographyH3>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col space-y-4"
        >
          <FormField
            control={form.control}
            name="name"
            disabled={isPending}
            render={({ field }) => (
              <FormItem className="-space-y-1">
                <FormLabel>
                  Account Name
                </FormLabel>
                <FormControl>
                  <Input
                    required
                    placeholder="Account Name..."
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
            name="type"
            render={({ field }) => (
              <FormItem className="-space-y-1">
                <FormLabel>
                  Account Type
                </FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  >
                    <SelectTrigger className="w-[180px] bg-white border-2 border-black w-full h-9">
                      <SelectValue placeholder="Select Account Type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">
                        Cash
                      </SelectItem>
                      <SelectItem value="digital">
                        Digital
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            disabled={isPending}
            render={({ field }) => (
              <FormItem className="-space-y-1">
                <FormLabel>
                  Description
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Description..."
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
          <div className="flex flex-row justify-between">
            <Button
              onClick={() => {
                form.reset();
                router.back();
              }}
              className="bg-red-500 border-2 hover:none"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              className="border-2"
              type="submit"
              disabled={isPending}
            >
              {isPending ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </Form>
    </main>
  );
}
