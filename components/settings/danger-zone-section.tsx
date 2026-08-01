'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import CustomAlertDialog from '@/components/custom/custom-alert-dialog';
import { authClient } from '@/lib/auth/auth-client';
import { cn } from '@/lib/utils';
import { TypographyH4 } from '../custom/typography';
import { Button } from '../ui/button';

export default function DangerZoneSection() {
  const router = useRouter();
  const [isDeleting, setIsDeleting] =
    useState<boolean>(false);

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await authClient.deleteUser({
        callbackURL: '/auth/login',
        fetchOptions: {
          onSuccess: () => {
            toast.success('Account deleted successfully');
            router.push('/auth/login');
            router.refresh();
          },
          onError: (ctx) => {
            const { error } = ctx;
            toast.error(
              error.message || 'Failed to delete account'
            );
            setIsDeleting(false);
          },
        },
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to delete account'
      );
      setIsDeleting(false);
    }
  };

  return (
    <section className="pt-2 space-y-4 mb-2">
      <TypographyH4 className="font-semibold">
        Danger Zone
      </TypographyH4>
      <Card className={cn('border-2')}>
        <div className="flex items-center justify-between px-4">
          <div className="flex-1">
            <CardHeader className="p-0 -mb-1">
              <CardTitle className="text-md font-medium text-foreground">
                Delete Account
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-sm text-muted-foreground">
                Permanently delete your account and all of
                your data.
              </div>
            </CardContent>
          </div>

          <div className="ml-4 flex-shrink-0">
            <CustomAlertDialog
              isDisabled={isDeleting}
              trigger={
                <div className="w-fit">
                  <Button variant={'destructive'}>
                    Delete
                  </Button>
                </div>
              }
              title="Are you absolutely sure?"
              description={
                <>
                  This will permanently delete your account,
                  and all of the data associated with it,
                  including accounts, categories, and
                  transactions.
                  <br />
                  <br />
                  <span className="font-semibold text-md">
                    This action cannot be undone.
                  </span>
                </>
              }
              confirmMessage="Yes, delete my account"
              onConfirm={handleDeleteAccount}
            />
          </div>
        </div>
      </Card>
    </section>
  );
}
