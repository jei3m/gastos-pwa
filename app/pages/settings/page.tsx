'use client';
import { Separator } from '@/components/ui/separator';
import { createAuthClient } from 'better-auth/react';
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
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAccount } from '@/context/account-context';
import { categoryQueryOptions } from '@/lib/tq-options/categories.tq.options';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import AccountsSection from '@/components/settings/accounts-section';
import CategoriesSection from '@/components/settings/categories-section';

const authClient = createAuthClient();

export default function Settings() {
  const [activeTab, setActiveTab] =
    useState<string>('expense');
  const { data: session } = authClient.useSession();
  const isMobile = useIsMobile();
  const router = useRouter();
  const { accounts, isAccountsLoading, selectedAccountID } =
    useAccount();

  const handleLogout = async () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/auth/login');
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

  // Fetch categories
  const {
    data: categoriesData,
    isPending: isCategoriesLoading,
  } = useQuery(
    categoryQueryOptions(
      activeTab!,
      selectedAccountID!,
      null,
      null,
      'list'
    )
  );
  const categories = useMemo(() => {
    return categoriesData;
  }, [categoriesData]);

  return (
    <main
      className={cn(
        'space-y-6 px-3 mx-auto',
        isMobile ? 'pb-20' : 'pb-4'
      )}
    >
      {/* User Section */}
      <section className={cn('space-y-4')}>
        {/* Profile Card */}
        <Card className={cn('border-2 mt-4')}>
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
            {/* Avatar and Basic Info */}
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex flex-col items-center justify-center">
                <Image
                  alt="Profile Picture"
                  src={
                    session?.user?.image ||
                    '/icons/icons-96x96.png'
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
                  {session?.user?.name || 'N/A'}
                </div>
              </div>
              <div className="space-y-1 text-left">
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Email
                  </div>
                  {session?.user?.emailVerified ? (
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-200 bg-green-50"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-amber-600 border-amber-200 bg-amber-50"
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Not Verified
                    </Badge>
                  )}
                </div>
                <div className="text-foreground font-medium">
                  {session?.user?.email || 'N/A'}
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
                {session?.user?.createdAt
                  ? formatDate(session.user.createdAt)
                  : 'N/A'}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <CircleAlert className="h-4 w-4" />
                <span>Session Expiry</span>
              </div>
              <div className="text-foreground font-medium">
                {session?.session?.expiresAt
                  ? formatDate(session.session.expiresAt)
                  : 'N/A'}
              </div>
            </div>
          </CardFooter>
        </Card>
      </section>

      {/* Accounts Section */}
      <AccountsSection
        accounts={accounts}
        isAccountsLoading={isAccountsLoading}
        isMobile={isMobile}
      />

      {/* Categories Section */}
      <CategoriesSection
        categories={categories}
        isCategoriesLoading={isCategoriesLoading}
        isMobile={isMobile}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </main>
  );
}
