import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  CircleCheck,
  CircleX,
  Loader,
  Mail,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  fetchInvitationByToken,
  respondToInvitation,
} from '@/features/members/members.tq.functions';
import { accountsQueryOptions } from '@/features/accounts/accounts.tq.options';
import { toast } from '@/lib/toast';

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = searchParams.get('token');
  const [actionDone, setActionDone] = useState(false);

  const {
    data: invitation,
    isPending,
    error,
  } = useQuery({
    queryKey: ['invitation', token],
    queryFn: () => fetchInvitationByToken(token!),
    enabled: !!token,
    retry: false,
  });

  const { mutate, isPending: isResponding } = useMutation({
    mutationFn: (action: 'accept' | 'decline') =>
      respondToInvitation(token!, action),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: accountsQueryOptions().queryKey,
      });
      setActionDone(true);
      if (data.accountID) {
        toast.success(
          'You are now a member of this account!'
        );
        setTimeout(() => {
          void navigate('/pages/transactions');
        }, 1500);
      } else {
        toast.success('Invitation declined');
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return (
    <main className="-mt-12 flex min-h-screen items-center justify-center p-4 md:-mt-14">
      {!token ? (
        <Card className="w-full max-w-md border-2">
          <CardContent className="pt-2 text-center">
            <CircleX className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <p className="text-lg font-medium">
              Invalid invitation link
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              No invitation token was provided.
            </p>
          </CardContent>
        </Card>
      ) : isPending ? (
        <Card className="w-full max-w-md border-2">
          <CardContent className="space-y-4 pt-2">
            <Skeleton className="mx-auto h-8 w-3/4 bg-gray-300" />
            <Skeleton className="mx-auto h-4 w-1/2 bg-gray-300" />
            <Skeleton className="h-10 w-full bg-gray-300" />
          </CardContent>
        </Card>
      ) : error || !invitation ? (
        <Card className="w-full max-w-md border-2">
          <CardContent className="pt-2 text-center">
            <CircleX className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <p className="text-lg font-medium">
              Invitation Error
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : 'This invitation could not be found'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-md border-2">
          <CardHeader className="text-center">
            <Mail className="mx-auto mb-2 h-12 w-12 text-primary" />
            <CardTitle className="text-xl">
              Account Invitation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {actionDone ? (
              <div className="space-y-4 text-center">
                <CircleCheck className="mx-auto h-12 w-12 text-green-500" />
                <p className="text-lg font-medium">
                  {invitation.accountID
                    ? 'Welcome to the account!'
                    : 'Invitation declined'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Redirecting you to the app...
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {invitation.inviterName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {invitation.inviterEmail}
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      has invited you to join
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                      {invitation.accountName}
                    </p>
                  </div>
                  <div className="text-center text-xs text-muted-foreground">
                    Invited: {invitation.invitedEmail}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    className="flex-1 border-2 bg-red-500"
                    onClick={() => mutate('decline')}
                    disabled={isResponding}
                  >
                    Decline
                  </Button>
                  <Button
                    className="flex-1 space-x-2"
                    onClick={() => mutate('accept')}
                    disabled={isResponding}
                  >
                    {isResponding && (
                      <Loader className="animate-spin" />
                    )}
                    <span>Accept</span>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </main>
  );
}
