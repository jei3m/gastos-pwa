import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  CalendarDays,
  User,
  LogOut,
  CircleAlert,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router';
import { authClient } from '@/lib/auth/auth-client';
import DangerZoneSection from '@/components/settings/danger-zone-section';
import DataPrivacySection from '@/components/settings/data-privacy-section/data-privacy-section';
import SetupPreferencesSection from '@/components/settings/setup-preferences-section';

export default function SettingsPage() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { data: session, isPending } =
    authClient.useSession();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          void navigate('/auth/login');
        },
      },
    });
  };

  const formatDate = (dateString: string | Date) => {
    try {
      const date =
        typeof dateString === 'string'
          ? new Date(dateString)
          : dateString;
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <main
      className={cn(
        'flex flex-col space-y-4 md:space-y-6 px-3 mx-auto overflow-y-auto',
        isMobile ? 'h-screen pb-29' : 'pb-4'
      )}
    >
      <section className={cn('space-y-2 md:space-y-4')}>
        <Card className={cn('border-2 mt-2 md:mt-4')}>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex justify-between">
              <div className="flex gap-2 items-center">
                <User className="h-5 w-5" />
                User Information
              </div>
              {!isMobile && (
                <Button
                  variant="ghost"
                  className="text-red-500"
                  onClick={() => handleLogout()}
                >
                  <LogOut />
                  Log out
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <Separator className="-mt-5 mb-2" />
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex flex-col items-center justify-center">
                <img
                  alt="Profile Picture"
                  src={
                    session?.user?.image ||
                    '/images/profile-picture.png'
                  }
                  width={80}
                  height={80}
                  className="rounded-full border-2 md:-mr-2"
                />
                {isMobile && (
                  <Button
                    variant="ghost"
                    className="text-red-500"
                    onClick={() => handleLogout()}
                  >
                    <LogOut />
                    Log out
                  </Button>
                )}
              </div>
              <div className="space-y-1 text-left">
                <div className="text-sm font-medium text-muted-foreground">
                  Name
                </div>
                <div className="text-foreground font-medium">
                  {isPending ? (
                    <Skeleton className="h-6 w-32 bg-gray-300" />
                  ) : (
                    session?.user?.name || 'N/A'
                  )}
                </div>
              </div>
              <div className="space-y-1 text-left">
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Email
                  </div>
                </div>
                <div className="text-foreground font-medium">
                  {isPending ? (
                    <Skeleton className="h-6 w-40 bg-gray-300" />
                  ) : (
                    session?.user?.email || 'N/A'
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <Separator className="mt-1 mb-2" />
          <CardFooter className="flex flex-col md:flex-row items-start gap-4 md:gap-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                <span>Account Created</span>
              </div>
              <div className="text-foreground font-medium">
                {isPending ? (
                  <Skeleton className="h-6 w-28 bg-gray-300" />
                ) : session?.user?.createdAt ? (
                  formatDate(session.user.createdAt)
                ) : (
                  'N/A'
                )}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <CircleAlert className="h-4 w-4" />
                <span>Session Expiry</span>
              </div>
              <div className="text-foreground font-medium">
                {isPending ? (
                  <Skeleton className="h-6 w-28 bg-gray-300" />
                ) : session?.session?.expiresAt ? (
                  formatDate(session.session.expiresAt)
                ) : (
                  'N/A'
                )}
              </div>
            </div>
          </CardFooter>
        </Card>
      </section>

      <SetupPreferencesSection />

      <DataPrivacySection isSessionPending={isPending} />

      <DangerZoneSection />
    </main>
  );
}
