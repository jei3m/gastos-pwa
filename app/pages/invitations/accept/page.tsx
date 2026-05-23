'use client';
import { useState, useEffect } from 'react';
import {
  useSearchParams,
  useRouter,
} from 'next/navigation';
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
} from '@tanstack/react-query';
import {
  fetchInvitationByToken,
  respondToInvitation,
} from '@/lib/tq-functions/members.tq.functions';
import { accountsQueryOptions } from '@/lib/tq-options/accounts.tq.options';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  CheckCircle,
  XCircle,
  Loader2,
  Mail,
  User,
} from 'lucide-react';

export default function AcceptInvitation() {
  const searchParams = useSearchParams();
  const router = useRouter();
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
      queryClient.invalidateQueries({
        queryKey: accountsQueryOptions().queryKey,
      });
      setActionDone(true);
      if (data.accountID) {
        toast.success(
          'You are now a member of this account!'
        );
        setTimeout(() => {
          router.push('/pages/transactions');
        }, 1500);
      } else {
        toast.success('Invitation declined');
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (!token) {
    return (
      <main className="flex items-center justify-center min-h-screen p-4">
        <Card className="border-2 max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-medium">
              Invalid invitation link
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              No invitation token was provided.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (isPending) {
    return (
      <main className="flex items-center justify-center min-h-screen p-4">
        <Card className="border-2 max-w-md w-full">
          <CardContent className="pt-6 space-y-4">
            <Skeleton className="h-8 w-3/4 mx-auto bg-gray-300" />
            <Skeleton className="h-4 w-1/2 mx-auto bg-gray-300" />
            <Skeleton className="h-10 w-full bg-gray-300" />
          </CardContent>
        </Card>
      </main>
    );
  }

  if (error || !invitation) {
    return (
      <main className="flex items-center justify-center min-h-screen p-4">
        <Card className="border-2 max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-medium">
              Invitation Error
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {error instanceof Error
                ? error.message
                : 'This invitation could not be found'}
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex items-center justify-center min-h-screen p-4">
      <Card className="border-2 max-w-md w-full">
        <CardHeader className="text-center">
          <Mail className="h-12 w-12 text-primary mx-auto mb-2" />
          <CardTitle className="text-xl">
            Account Invitation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {actionDone ? (
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
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
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
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
                  <p className="text-lg font-semibold mt-1">
                    {invitation.accountName}
                  </p>
                </div>
                <div className="text-center text-xs text-muted-foreground">
                  Invited: {invitation.invitedEmail}
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-2"
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
                    <Loader2 className="animate-spin" />
                  )}
                  <span>Accept</span>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
