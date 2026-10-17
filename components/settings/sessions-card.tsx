'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Smartphone,
  Tablet,
  Laptop,
  ShieldCheck,
  Loader2,
  LogOut,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UAParser } from 'ua-parser-js';
import { authClient } from '@/lib/auth/auth-client';
import { sessionsQueryOptions } from '@/lib/tq-options/sessions.tq.options';
import { cn } from '@/lib/utils';
import CustomAlertDialog from '@/components/custom/custom-alert-dialog';
import { formatDate } from 'date-fns';

type SessionData = NonNullable<
  Awaited<
    ReturnType<typeof authClient.listSessions>
  >['data']
>[number];

interface SessionsCardProps {
  isSessionPending: boolean;
}

interface DeviceInfo {
  label: string;
  type: 'mobile' | 'tablet' | 'desktop';
}

const getDeviceInfo = (
  userAgent?: string | null
): DeviceInfo => {
  if (!userAgent) {
    return { label: 'Unknown device', type: 'desktop' };
  }
  const parser = new UAParser(userAgent);
  const { browser, os, device } = parser.getResult();

  const deviceName =
    device.model && device.vendor
      ? `${device.vendor} ${device.model}`
      : device.model;

  const parts = [
    deviceName,
    browser.name,
    device.type === 'mobile' ? '' : os.name,
  ].filter((part): part is string => !!part);
  const label = parts.join(' · ') || 'Unknown device';

  const type =
    device.type === 'mobile'
      ? 'mobile'
      : device.type === 'tablet'
        ? 'tablet'
        : 'desktop';
  return { label, type };
};

const getDeviceIcon = (type: DeviceInfo['type']) => {
  if (type === 'mobile') return Smartphone;
  if (type === 'tablet') return Tablet;
  return Laptop;
};

export default function SessionsCard({
  isSessionPending,
}: SessionsCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: currentSession } = authClient.useSession();
  const { data: sessions, isPending } = useQuery(
    sessionsQueryOptions()
  );

  const currentToken = currentSession?.session?.token;

  const sessionRows = useMemo(() => {
    if (!sessions) return [];
    return sessions
      .slice()
      .map((session: SessionData) => {
        const isCurrent = session.token === currentToken;
        return {
          ...session,
          isCurrent,
          device: getDeviceInfo(session.userAgent),
        };
      })
      .sort((a, b) => {
        if (a.isCurrent !== b.isCurrent)
          return a.isCurrent ? -1 : 1;
        return (
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
        );
      });
  }, [sessions, currentToken]);

  const revokeMutation = useMutation({
    mutationFn: async (token: string) => {
      const { error } = await authClient.revokeSession({
        token,
      });
      if (error) {
        throw Error(
          error.message ?? 'Failed to sign out session'
        );
      }
    },
    onSuccess: (_data, token) => {
      queryClient.invalidateQueries({
        queryKey: ['sessions'],
      });
      toast.success('Session signed out');
      if (token === currentToken) {
        router.push('/auth/login');
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to sign out session'
      );
    },
  });

  const revokeOthersMutation = useMutation({
    mutationFn: async () => {
      const { error } =
        await authClient.revokeOtherSessions();
      if (error) {
        throw Error(
          error.message ??
            'Failed to sign out other sessions'
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['sessions'],
      });
      toast.success('Signed out all other sessions');
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to sign out other sessions'
      );
    },
  });

  const isLoading = isPending || isSessionPending;

  return (
    <Card className={cn('border-2')}>
      <div className="items-center justify-between px-4">
        <CardHeader className="p-0 -mb-1">
          <CardTitle className="text-md font-medium text-foreground">
            Manage Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-sm text-muted-foreground">
            Review the devices currently signed into your
            account and revoke any you do not recognize.
          </div>
        </CardContent>
        <Separator className="my-2" />
        <CardContent className="space-y-3 px-0 w-full">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full bg-gray-300" />
              <Skeleton className="h-16 w-full bg-gray-300" />
            </div>
          ) : sessionRows.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4 text-center">
              No active sessions
            </div>
          ) : (
            sessionRows.map((session, index) => {
              const DeviceIcon = getDeviceIcon(
                session.device.type
              );
              return (
                <div
                  key={index}
                  className="flex items-start justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <DeviceIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground flex items-center gap-2 flex-wrap">
                        <span className="truncate">
                          {session.device.label}
                        </span>
                        {session.isCurrent && (
                          <>
                            <Badge
                              variant="outline"
                              className="hidden md:block text-xs text-green-600 border-green-200 bg-green-50"
                            >
                              Current Device
                            </Badge>
                            <span className="block md:hidden inline-flex items-center flex-shrink-0">
                              <span className="h-2 w-2 rounded-full bg-green-500 ring-4 ring-green-200 animate-pulse" />
                            </span>
                          </>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Signed in{' '}
                        {formatDate(
                          session.createdAt,
                          'MMM d, yyyy'
                        )}{' '}
                        · expires{' '}
                        {formatDate(
                          session.expiresAt,
                          'MMM d, yyyy'
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <CustomAlertDialog
                      isDisabled={revokeMutation.isPending}
                      trigger={
                        <div className="w-fit">
                          <Button
                            variant="ghost"
                            className="text-red-500 px-1 sm:px-4"
                          >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">
                              Log out
                            </span>
                          </Button>
                        </div>
                      }
                      title="Log out of this device?"
                      description={`This will end the session on your ${session.isCurrent ? 'current' : 'selected'} device and it will be logged out.`}
                      confirmMessage="Log out"
                      onConfirm={() =>
                        revokeMutation.mutate(session.token)
                      }
                    />
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
        {!isLoading && sessionRows.length > 1 && (
          <CardContent className="mt-4">
            <CustomAlertDialog
              isDisabled={revokeOthersMutation.isPending}
              trigger={
                <Button
                  variant="ghost"
                  className="w-full text-red-500"
                >
                  {revokeOthersMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                  Log out all other sessions
                </Button>
              }
              title="Log out of all other devices?"
              description="This will end the session on every other device and sign them out, except for this current device."
              confirmMessage="Log out"
              onConfirm={() =>
                revokeOthersMutation.mutate()
              }
            />
          </CardContent>
        )}
      </div>
    </Card>
  );
}
