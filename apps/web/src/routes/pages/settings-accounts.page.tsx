import { useQuery } from '@tanstack/react-query';
import { accountsQueryOptions } from '@/features/accounts/accounts.tq.options';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { TypographyH4 } from '@/components/custom/typography';
import PulseLoader from '@/components/custom/pulse-loader';
import PageHeader from '@/components/custom/page-header';
import type { Account } from '@/features/accounts/accounts.interface';
import { Link } from 'react-router';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Plus, Wallet } from 'lucide-react';

export default function SettingsAccountsPage() {
  const isMobile = useIsMobile();
  const { data: accounts, isPending: isAccountsLoading } =
    useQuery(accountsQueryOptions());

  return (
    <main
      className={cn(
        'flex flex-col space-y-4 md:space-y-6 overflow-y-auto p-3',
        isMobile ? 'h-screen pb-32' : 'pb-4'
      )}
    >
      <PageHeader
        title="Accounts"
        description="View and manage all your accounts. Select an account to edit its name, description, type, and members."
      />
      <section className="space-y-3 md:space-y-4">
        {isAccountsLoading ? (
          <PulseLoader />
        ) : accounts && accounts.length > 0 ? (
          <div className="grid gap-2 md:grid-cols-2 md:gap-4">
            <Link
              to="/accounts/add"
              className="block min-w-0 h-full"
            >
              <Card className="h-full border-dashed hover:bg-gray-100 transition-colors">
                <CardHeader>
                  <div className="flex flex-row items-center gap-2">
                    <div className="p-2 rounded-lg shrink-0 bg-primary/15">
                      <Plus
                        size={26}
                        className="text-primary"
                      />
                    </div>
                    <div className="truncate text-lg font-bold md:text-xl">
                      New Account
                    </div>
                  </div>
                </CardHeader>
                <Separator className="-mt-2" />
                <CardContent className="-mb-2 text-md md:text-lg space-y-2 break-words text-muted-foreground">
                  Add New Account
                </CardContent>
              </Card>
            </Link>
            {accounts.map((account: Account) => (
              <Link
                to={`/accounts/${account.id}`}
                key={account.id}
              >
                <Card className="h-full border-2 transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex flex-row items-center justify-between gap-2">
                      <div className="truncate text-lg font-bold md:text-xl">
                        {account.name}
                      </div>
                      <div className="shrink-0 text-md text-gray-600 font-normal">
                        {account.type}
                      </div>
                    </div>
                  </CardHeader>
                  <Separator className="-mt-2" />
                  <CardContent className="text-md md:text-lg space-y-2 break-words text-muted-foreground">
                    {account.description}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="rounded-full bg-muted p-4 text-muted-foreground">
              <Wallet size={40} strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <TypographyH4 className="font-semibold">
                No accounts yet
              </TypographyH4>
              <p className="text-sm text-muted-foreground">
                Create an account to start tracking your
                finances.
              </p>
            </div>
            <Link to="/accounts/add">
              <Button>
                <Plus /> New Account
              </Button>
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
