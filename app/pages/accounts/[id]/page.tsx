'use client';
import { useEffect, useMemo, useState } from 'react';
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
import { ChevronLeft, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { accountByIDQueryOptions } from '@/lib/tq-options/accounts.tq.options';
import CustomAlertDialog from '@/components/custom/custom-alert-dialog';
import { useAccount } from '@/context/account-context';
import { Checkbox } from '@/components/ui/checkbox';
import AccountSharingSection from '@/components/accounts/account-sharing-section';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

export default function EditAccount() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { selectedAccountID, setSelectedAccountID } =
    useAccount();

  const { data: account, isPending: isAccountPending } =
    useQuery(accountByIDQueryOptions(id));

  const isOwner = account?.isOwner ?? false;

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

  const [queuedEmails, setQueuedEmails] = useState<
    string[]
  >([]);
  const [
    queuedCancelledInvites,
    setQueuedCancelledInvites,
  ] = useState<string[]>([]);
  const [queuedRemovedMembers, setQueuedRemovedMembers] =
    useState<string[]>([]);

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

  const handleQueueCancelInvitation = (
    invitationId: string
  ) => {
    if (!queuedCancelledInvites.includes(invitationId)) {
      setQueuedCancelledInvites([
        ...queuedCancelledInvites,
        invitationId,
      ]);
    }
  };

  const handleUnqueueCancelInvitation = (
    invitationId: string
  ) => {
    setQueuedCancelledInvites(
      queuedCancelledInvites.filter(
        (id) => id !== invitationId
      )
    );
  };

  const handleQueueRemoveMember = (userId: string) => {
    if (!queuedRemovedMembers.includes(userId)) {
      setQueuedRemovedMembers([
        ...queuedRemovedMembers,
        userId,
      ]);
    }
  };

  const handleUnqueueRemoveMember = (userId: string) => {
    setQueuedRemovedMembers(
      queuedRemovedMembers.filter((id) => id !== userId)
    );
  };

  const {
    mutate: editAccountMutation,
    isPending: isEditPending,
  } = useMutation({
    mutationFn: (
      values: z.infer<typeof updateAccountSchema>
    ) =>
      editAccount(id, {
        ...values,
        emails: queuedEmails,
        cancelInvitationIds: queuedCancelledInvites,
        removeMemberIds: queuedRemovedMembers,
      }),
    onMutate: (values) => {
      if (!values.isDropdown && id === selectedAccountID) {
        setSelectedAccountID('');
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: accountByIDQueryOptions(id!).queryKey,
      });
      toast.success(data.responseMessage);
      form.reset();
      router.push('/pages/settings');
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
      queryClient.removeQueries({
        queryKey: accountByIDQueryOptions(id!).queryKey,
      });
      if (id === selectedAccountID) {
        setSelectedAccountID('');
      }
      toast.success(data.responseMessage);
      router.push('/pages/settings');
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
    setTimeout(() => {
      form.reset({
        name: account.name || '',
        type: account.type.toLowerCase() || '',
        description: account.description || '',
        isDropdown: account.isDropdown || 0,
      });
    }, 50);

    return () => {
      setQueuedEmails([]);
      setQueuedCancelledInvites([]);
      setQueuedRemovedMembers([]);
    };
  }, [account, isAccountPending, form]);

  const isLoading = useMemo(() => {
    return (
      isEditPending || isDeletePending || isAccountPending
    );
  }, [isEditPending, isDeletePending, isAccountPending]);

  return (
    <main
      className={cn(
        'flex flex-col space-y-2 md:space-y-4 overflow-y-auto',
        isMobile ? 'h-screen pb-31' : 'pb-4'
      )}
    >
      <section className="p-3 space-y-4">
        <div className="flex flex-row space-x-2 items-center">
          {isOwner ? (
            <>
              <TypographyH3>Edit Account</TypographyH3>
              <CustomAlertDialog
                isDisabled={isLoading}
                trigger={
                  <Trash2
                    size={24}
                    className="text-red-500"
                  />
                }
                title="Are you sure?"
                description={
                  <>
                    This will permanently delete this
                    account, and all transactions linked to
                    this account.
                    <br /> <br />
                    <span className="font-semibold text-md">
                      This action cannot be undone.
                    </span>
                  </>
                }
                confirmMessage="Yes, I'm sure"
                onConfirm={() => deleteAccountMutation(id)}
              />
            </>
          ) : (
            <div
              onClick={() => router.back()}
              className="flex items-center cursor-pointer"
            >
              <ChevronLeft className="mr-2" size={22} />
              <TypographyH3>Edit Account</TypographyH3>
            </div>
          )}
        </div>
        <Form {...form}>
          <form
            className="flex flex-col space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="name"
              disabled={isLoading || !isOwner}
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
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoading || !isOwner}
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
              disabled={isLoading || !isOwner}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Description..."
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isDropdown"
              disabled={isLoading || !isOwner}
              render={({ field }) => (
                <FormItem className="flex items-center">
                  <FormControl>
                    <Checkbox
                      checked={field.value === 1}
                      onCheckedChange={(checked) => {
                        field.onChange(checked ? 1 : 0);
                      }}
                      disabled={isLoading || !isOwner}
                    />
                  </FormControl>
                  <FormLabel>Add to Dropdown</FormLabel>
                </FormItem>
              )}
            />
            {/* Sharing Section */}
            {!isAccountPending && account && (
              <AccountSharingSection
                accountID={id}
                queuedEmails={queuedEmails}
                onAddEmail={handleAddEmail}
                onRemoveEmail={handleRemoveEmail}
                queuedCancelledInvites={
                  queuedCancelledInvites
                }
                onQueueCancelInvitation={
                  handleQueueCancelInvitation
                }
                onUnqueueCancelInvitation={
                  handleUnqueueCancelInvitation
                }
                queuedRemovedMembers={queuedRemovedMembers}
                onQueueRemoveMember={
                  handleQueueRemoveMember
                }
                onUnqueueRemoveMember={
                  handleUnqueueRemoveMember
                }
              />
            )}
            {isOwner && (
              <div className="flex flex-row justify-between">
                <Button
                  onClick={() => router.back()}
                  className="bg-red-500"
                  disabled={isLoading}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  className="space-x-2"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="animate-spin" />
                  )}
                  Submit
                </Button>
              </div>
            )}
          </form>
        </Form>
      </section>
    </main>
  );
}
