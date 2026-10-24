import { useState } from 'react';
import { useNavigate } from 'react-router';
import { createAccount } from '@/features/accounts/accounts.tq.functions';
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
import { createAccountSchema } from '@/features/accounts/accounts.schema';
import { toast } from '@/lib/toast';
import { ApiError } from '@/lib/api';
import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { accountsQueryOptions } from '@/features/accounts/accounts.tq.options';
import { Loader } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import AccountSharingSection from '@/components/accounts/account-sharing-section';

export default function AddAccountPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof createAccountSchema>>(
    {
      resolver: zodResolver(createAccountSchema),
      defaultValues: {
        name: '',
        type: '',
        description: '',
        isDropdown: 0,
      },
    }
  );

  const [queuedEmails, setQueuedEmails] = useState<
    string[]
  >([]);

  const handleAddEmail = (email: string) => {
    if (email && !queuedEmails.includes(email)) {
      setQueuedEmails([...queuedEmails, email]);
    }
  };

  const handleRemoveEmail = (email: string) => {
    setQueuedEmails(
      queuedEmails.filter((e) => e !== email)
    );
  };

  const { mutate: createAccountMutation, isPending } =
    useMutation({
      mutationFn: (
        values: z.infer<typeof createAccountSchema>
      ) =>
        createAccount({
          ...values,
          emails: queuedEmails,
        }),
      onSuccess: (data) => {
        void queryClient.invalidateQueries({
          queryKey: accountsQueryOptions().queryKey,
        });
        form.reset();
        toast.success(
          (data as { responseMessage: string })
            .responseMessage
        );
        void navigate('/settings/accounts');
      },
      onError: (error) => {
        if (
          error instanceof ApiError &&
          error.status >= 400 &&
          error.status <= 499
        ) {
          toast.warning(error.message);
          return;
        }
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
      <TypographyH3>Create New Account</TypographyH3>
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
                <FormLabel>Account Name</FormLabel>
                <FormControl>
                  <Input
                    required
                    placeholder="Account Name..."
                    {...field}
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
                <FormLabel>Account Type</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(value) =>
                      field.onChange(value ?? '')
                    }
                    disabled={isPending}
                  >
                    <SelectTrigger className="w-full h-9">
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
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Description..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isDropdown"
            disabled={isPending}
            render={({ field }) => (
              <FormItem className="flex items-center">
                <FormControl>
                  <Checkbox
                    checked={field.value === 1}
                    onCheckedChange={(checked) => {
                      field.onChange(checked ? 1 : 0);
                    }}
                    disabled={isPending}
                  />
                </FormControl>
                <FormLabel>Add to Dropdown</FormLabel>
              </FormItem>
            )}
          />
          {/* Sharing Section */}
          <AccountSharingSection
            isNewAccount
            queuedEmails={queuedEmails}
            onAddEmail={handleAddEmail}
            onRemoveEmail={handleRemoveEmail}
          />
          <div className="flex flex-row justify-between">
            <Button
              onClick={() => {
                form.reset();
                void navigate(-1);
              }}
              className="bg-red-500"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              className="space-x-2"
              type="submit"
              disabled={isPending}
            >
              {isPending && (
                <Loader className="animate-spin" />
              )}
              Submit
            </Button>
          </div>
        </form>
      </Form>
    </main>
  );
}
