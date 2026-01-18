'use client';
import { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import {
  createAccountSchema,
  updateAccountSchema,
} from '@/lib/schema/acccounts.schema';
import {
  deleteAccount,
  editAccount,
} from '@/lib/tq-functions/accounts.tq.functions';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  accountByIDQueryOptions,
  accountsQueryOptions,
} from '@/lib/tq-options/accounts.tq.options';
import CustomAlertDialog from '@/components/custom/custom-alert-dialog';

export default function EditAccount() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();

  const { data: account, isPending: isAccountPending } =
    useQuery(accountByIDQueryOptions(id));

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

  const {
    mutate: editAccountMutation,
    isPending: isEditPending,
  } = useMutation({
    mutationFn: (
      values: z.infer<typeof updateAccountSchema>
    ) => editAccount(id, values),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: accountByIDQueryOptions(id!).queryKey,
      });
      toast.success(data.responseMessage);
      form.reset();
      router.push('/pages/accounts');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const {
    mutate: deleteAccountMutation,
    isPending: isDeletePending,
  } = useMutation({
    mutationFn: (id: string) => deleteAccount(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: accountsQueryOptions().queryKey,
      });
      toast.success(data.responseMessage);
      router.push('/pages/accounts');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  async function onSubmit(
    values: z.infer<typeof updateAccountSchema>
  ) {
    editAccountMutation(values);
  }

  useEffect(() => {
    if (!account || isAccountPending) return;
    form.reset({
      name: account.name || '',
      type: account.type.toLowerCase() || '',
      description: account.description || '',
    });
  }, [account, isAccountPending, form]);

  const isDisabled = useMemo(() => {
    return (
      isEditPending || isDeletePending || isAccountPending
    );
  }, [isEditPending, isDeletePending, isAccountPending]);

  return (
    <main className="flex flex-col m-auto space-y-4 p-3">
      <div className="flex flex-row space-x-2 items-center">
        <TypographyH3 className="font-bold text-center">
          Edit Account
        </TypographyH3>
        <CustomAlertDialog
          isDisabled={isDisabled}
          trigger={
            <Trash2 size={24} className="text-red-500" />
          }
          title="Are you sure?"
          description={
            <>
              This will permanently delete this account, and
              all transactions linked to this account.
              <br /> <br />
              <span className="font-semibold text-md">
                This action cannot be undone.
              </span>
            </>
          }
          confirmMessage="Yes, I'm sure"
          onConfirm={() => deleteAccountMutation(id)}
        />
      </div>
      <Form {...form}>
        <form
          className="flex flex-col space-y-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="name"
            disabled={isDisabled}
            render={({ field }) => (
              <FormItem className="-space-y-1">
                <FormLabel className="text-md font-medium">
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
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="-space-y-1">
                <FormLabel className="text-md font-medium">
                  Account Type
                </FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isDisabled}
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
            disabled={isDisabled}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-md font-medium">
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
              </FormItem>
            )}
          />
          <div className="flex flex-row justify-between">
            <Button
              onClick={() => router.back()}
              className="bg-red-500 border-2 hover:none"
              disabled={isDisabled}
              type="button"
            >
              Cancel
            </Button>
            <Button
              className="border-2"
              disabled={isDisabled}
            >
              {isDisabled ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </Form>
    </main>
  );
}
