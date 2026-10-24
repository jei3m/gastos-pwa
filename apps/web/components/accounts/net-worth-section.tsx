import { Eye, EyeOff, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { formatAmount } from '@/lib/format-amount';
import { cn } from '@/lib/utils';
import type { Account } from '@/features/accounts/accounts.interface';
import {
  getAccountBalance,
  getAccountShares,
} from '@/features/accounts/accounts.helpers';

interface NetWorthSectionProps {
  accounts: Account[];
  isLoading: boolean;
  hidden: boolean;
  onToggleHidden: () => void;
  selectedAccountID: string | null;
}

export function NetWorthSection({
  accounts,
  isLoading,
  hidden,
  onToggleHidden,
  selectedAccountID,
}: NetWorthSectionProps) {
  const netWorth = accounts.reduce(
    (total, account) => total + getAccountBalance(account),
    0
  );
  const shares = getAccountShares(accounts);
  const excludedCount = accounts.filter(
    (account) => getAccountBalance(account) <= 0
  ).length;

  return (
    <section className="pt-2 md:pt-4 px-3">
      <Card className="w-full">
        <CardContent>
          <div className="flex flex-row items-center -mb-0.5">
            <div className="text-gray-600 font-normal text-lg">
              Net Worth
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleHidden}
              className="h-8 w-8 text-gray-600"
            >
              {hidden ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-[50%] bg-gray-300" />
          ) : (
            <h1 className="text-2xl md:text-3xl font-extrabold">
              PHP{' '}
              {hidden
                ? '********'
                : formatAmount(netWorth, false)}
            </h1>
          )}

          {!isLoading && accounts.length === 0 ? (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-dashed px-3 py-4 text-sm text-muted-foreground">
              <Wallet className="h-4 w-4 shrink-0" />
              Add an account to see your net worth
              breakdown.
            </div>
          ) : null}

          {!isLoading && accounts.length > 0 ? (
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                {shares.length > 0 ? (
                  <Accordion className="w-full">
                    <AccordionItem
                      value="breakdown"
                      className="border-0 border-b-0"
                    >
                      <AccordionTrigger className="py-0 hover:no-underline">
                        <div className="flex w-full items-center justify-between gap-2">
                          <span className="text-sm md:text-md font-medium text-gray-600">
                            Account distribution
                          </span>
                          <span className="text-xs md:text-sm text-muted-foreground -mr-2">
                            {shares.length}{' '}
                            {shares.length === 1
                              ? 'account'
                              : 'accounts'}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <div
                        role="img"
                        aria-label={`Balance distribution across ${shares.length} accounts`}
                        className="mt-2 flex h-3 overflow-hidden rounded-full border-2 border-black md:h-4"
                      >
                        {shares.map((share) => (
                          <div
                            key={share.account.id}
                            className="h-full transition-[width] duration-300 hover:opacity-80"
                            style={{
                              width: `${share.percent}%`,
                              backgroundColor: share.color,
                            }}
                            title={`${share.account.name}: ${share.percent}%${
                              hidden
                                ? ''
                                : ` (PHP ${formatAmount(share.value, false)})`
                            }`}
                          />
                        ))}
                      </div>
                      <AccordionContent className="pt-2 pb-0">
                        <ul className="grid grid-cols-1 gap-1 md:grid-cols-2 md:gap-x-4">
                          {shares.map((share) => {
                            const isSelected =
                              selectedAccountID ===
                              share.account.id;

                            return (
                              <li key={share.account.id}>
                                <div
                                  className={cn(
                                    'flex w-full items-center justify-between gap-2 rounded-md px-1 py-1 text-left transition-colors',
                                    isSelected &&
                                      'bg-green-100'
                                  )}
                                >
                                  <span className="flex min-w-0 items-center gap-2">
                                    <span
                                      className="h-3 w-3 shrink-0 rounded-full"
                                      style={{
                                        backgroundColor:
                                          share.color,
                                      }}
                                    />
                                    <span className="truncate text-sm font-medium">
                                      {share.account.name}
                                    </span>
                                  </span>
                                  <span className="flex shrink-0 items-center gap-2 tabular-nums text-sm text-muted-foreground">
                                    <span>
                                      {hidden
                                        ? '********'
                                        : `PHP ${formatAmount(share.value)}`}
                                    </span>
                                    <span className="w-10 text-right font-semibold text-foreground">
                                      {share.percent}%
                                    </span>
                                  </span>
                                </div>
                              </li>
                            );
                          })}
                        </ul>

                        {excludedCount > 0 ? (
                          <p className="mt-2 text-xs text-muted-foreground">
                            {excludedCount}{' '}
                            {excludedCount === 1
                              ? 'account with a zero or negative balance is'
                              : 'accounts with zero or negative balances are'}{' '}
                            not included in the
                            distribution.
                          </p>
                        ) : null}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-gray-600">
                        Account distribution
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {shares.length}{' '}
                        {shares.length === 1
                          ? 'account'
                          : 'accounts'}
                      </span>
                    </div>
                    <div className="rounded-lg border border-dashed py-4 text-center text-sm text-muted-foreground">
                      Add a positive balance to see the
                      distribution.
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
