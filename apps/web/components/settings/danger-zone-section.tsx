import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from '@/lib/toast';
import { Card, CardContent } from '@/components/ui/card';
import CustomAlertDialog from '@/components/custom/custom-alert-dialog';
import { authClient } from '@/lib/auth/auth-client';
import { TypographyH4 } from '@/components/custom/typography';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

export default function DangerZoneSection() {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] =
    useState<boolean>(false);

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await authClient.deleteUser({
        callbackURL: `${window.location.origin}/auth/login`,
        fetchOptions: {
          onSuccess: () => {
            toast.success('Account deleted successfully');
            void navigate('/auth/login');
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
    <section className="space-y-2 md:space-y-4 mb-4">
      <TypographyH4 className="font-semibold">
        Danger Zone
      </TypographyH4>
      <Card>
        <CardContent>
          <div className="flex flex-row items-center justify-between">
            <div className="flex-1">
              <div className="text-md font-medium text-foreground">
                Export Data
              </div>
              <div className="text-sm text-muted-foreground">
                Download all of your accounts, categories,
                and transactions as a JSON file.
              </div>
            </div>
            <div className="ml-4 flex-shrink-0">
              <CustomAlertDialog
                isDisabled={isDeleting}
                trigger={
                  <div className="w-fit">
                    <Button
                      variant="ghost"
                      className="text-red-500 px-1 sm:px-4"
                    >
                      <Trash className="size-5" />
                    </Button>
                  </div>
                }
                title="Are you absolutely sure?"
                description={
                  <>
                    This will permanently delete your
                    account, and all of the data associated
                    with it, including accounts, categories,
                    and transactions.
                    <br />
                    <br />
                    <span className="font-semibold text-md text-black">
                      This action cannot be undone.
                    </span>
                  </>
                }
                confirmMessage="Yes, delete my account"
                onConfirm={handleDeleteAccount}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
