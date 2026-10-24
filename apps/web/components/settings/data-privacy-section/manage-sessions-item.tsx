import CustomAlertDialog from '@/components/custom/custom-alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { sessionsQueryOptions } from '@/features/user/user.tq.options';
import { authClient } from '@/lib/auth/auth-client';
import { toast } from '@/lib/toast';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { formatDate } from 'date-fns';
import {
  Laptop,
  Loader,
  LogOut,
  MonitorSmartphone,
  ShieldCheck,
  Smartphone,
  Tablet,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { UAParser } from 'ua-parser-js';

interface IManageSessionsItem {
  isSessionPending: boolean;
}

type SessionData = NonNullable<
  Awaited<
    ReturnType<typeof authClient.listSessions>
  >['data']
>[number];

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

export default function ManageSessionsItem({
  isSessionPending,
}: IManageSessionsItem) {
  const [isSessionsDialogOpen, setIsSessionsDialogOpen] =
    useState<boolean>(false);
  const navigate = useNavigate();
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
      void queryClient.invalidateQueries({
        queryKey: ['sessions'],
      });
      setIsSessionsDialogOpen(false);
      toast.success('Session signed out');
      if (token === currentToken) {
        void navigate('/auth/login');
      }
    },
    onError: (error) => {
      setIsSessionsDialogOpen(false);
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
      void queryClient.invalidateQueries({
        queryKey: ['sessions'],
      });
      setIsSessionsDialogOpen(false);
      toast.success('Signed out all other sessions');
    },
    onError: (error) => {
      setIsSessionsDialogOpen(false);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to sign out other sessions'
      );
    },
  });

  const isLoading = isPending || isSessionPending;

  return (
    <>
      <div className="flex flex-row items-center justify-between">
        <div className="flex-1">
          <div className="text-md font-medium text-foreground">
            Manage Sessions
          </div>
          <div className="text-sm text-muted-foreground">
            Review the devices currently signed into your
            account and revoke any you do not recognize.
          </div>
        </div>
        <div className="ml-4 flex-shrink-0">
          {isSessionPending ? (
            <Skeleton className="h-9 w-32 bg-gray-300" />
          ) : (
            <Button
              variant="ghost"
              className="text-green-500 px-1 sm:px-4"
              onClick={() => {
                setIsSessionsDialogOpen(
                  isSessionsDialogOpen ? false : true
                );
              }}
            >
              <MonitorSmartphone className="size-5" />
            </Button>
          )}
        </div>
      </div>
      <Dialog
        open={isSessionsDialogOpen}
        onOpenChange={setIsSessionsDialogOpen}
      >
        <DialogContent className="border-2 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Sessions</DialogTitle>
            <DialogDescription>
              Review the devices currently signed into your
              account.
            </DialogDescription>
          </DialogHeader>

          <Separator />

          <div className="-mx-4 no-scrollbar max-h-[50vh] space-y-4 overflow-y-auto px-4">
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
                        isDisabled={
                          revokeMutation.isPending
                        }
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
                          revokeMutation.mutate(
                            session.token
                          )
                        }
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {!isLoading && sessionRows.length > 1 && (
            <CustomAlertDialog
              isDisabled={revokeOthersMutation.isPending}
              trigger={
                <Button
                  variant="ghost"
                  className="w-full text-red-500"
                >
                  {revokeOthersMutation.isPending ? (
                    <Loader className="h-4 w-4 animate-spin" />
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
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
