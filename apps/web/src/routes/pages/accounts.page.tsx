import { useEffect, useRef, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import PulseLoader from '@/components/custom/pulse-loader';
import { TypographyH4 } from '@/components/custom/typography';
import { accountsQueryOptions } from '@/features/accounts/accounts.tq.options';
import { useQuery } from '@tanstack/react-query';
import type { Account } from '@/features/accounts/accounts.interface';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Search, SearchX, Wallet, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccount } from '@/context/account-context';
import { toast } from '@/lib/toast';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { formatAmount } from '@/lib/format-amount';
import { NetWorthSection } from '@/components/accounts/net-worth-section';
import { AccountCard } from '@/components/accounts/account-card';
import {
  ACCOUNT_TYPE_ORDER,
  groupAccountsByType,
} from '@/features/accounts/accounts.helpers';

function matchesSearch(account: Account, query: string) {
  if (!query) return true;

  return [account.name].some((value) =>
    value?.toLowerCase().includes(query)
  );
}

export default function AccountsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openGroups, setOpenGroups] = useState<string[]>(
    () => [...ACCOUNT_TYPE_ORDER]
  );
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const { setSelectedAccountID, selectedAccountID } =
    useAccount();

  const [hideNetWorthTotal, setHideNetWorthTotal] =
    useLocalStorage('hideNetWorthTotal', false);

  const { data: accounts, isPending: isAccountsLoading } =
    useQuery(accountsQueryOptions());

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredAccounts = (accounts ?? []).filter(
    (account) => matchesSearch(account, normalizedQuery)
  );
  const groups = groupAccountsByType(filteredAccounts);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable;

      if (event.key === '/' && !isTyping) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () =>
      window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const clearSearch = () => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    const query = value.trim().toLowerCase();
    if (!query) return;

    const matchingTypes = (accounts ?? [])
      .filter((account) => matchesSearch(account, query))
      .map((account) => account.type);

    setOpenGroups((current) => {
      const next = [
        ...new Set([...current, ...matchingTypes]),
      ];
      return next.length === current.length
        ? current
        : next;
    });
  };

  const handleSelectAccount = (account: Account) => {
    if (selectedAccountID === account.id) return;
    setSelectedAccountID(account.id);
    toast.success(
      `Selected ${account.name} as Active Account`
    );
  };

  return (
    <main
      className={cn(
        'flex flex-col space-y-4 md:space-y-6 overflow-y-auto',
        isMobile ? 'h-screen pb-29' : 'pb-4'
      )}
    >
      <NetWorthSection
        accounts={accounts ?? []}
        isLoading={isAccountsLoading}
        hidden={Boolean(hideNetWorthTotal)}
        onToggleHidden={() =>
          setHideNetWorthTotal(!hideNetWorthTotal)
        }
        selectedAccountID={selectedAccountID}
      />

      <section className="flex flex-col space-y-4 md:space-y-6 px-3 mb-2">
        <div className="bg-white border-2 p-3 rounded-xl flex items-center justify-between">
          <TypographyH4>Accounts</TypographyH4>
          <div className="relative w-54 md:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(event) =>
                handleSearchChange(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  setSearchQuery('');
                  event.currentTarget.blur();
                }
              }}
              placeholder="Search by name..."
              aria-label="Search accounts"
              className="px-8 border-0 bg-gray-200"
            />
            {searchQuery ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-gray-600"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">
                  Clear search
                </span>
              </Button>
            ) : null}
          </div>
        </div>

        {isAccountsLoading || !accounts ? (
          <PulseLoader />
        ) : accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="rounded-full bg-muted p-4 text-muted-foreground">
              <Wallet size={40} strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">
                No accounts yet
              </p>
              <p className="text-sm text-muted-foreground">
                Create an account to start tracking your
                finances.
              </p>
            </div>
          </div>
        ) : (
          <>
            {filteredAccounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-10 text-center text-muted-foreground">
                <div className="rounded-full bg-muted p-4">
                  <SearchX size={40} strokeWidth={1.5} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    No accounts found
                  </p>
                  <p className="text-sm">
                    Nothing matches “{searchQuery.trim()}”.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearSearch}
                >
                  Clear search
                </Button>
              </div>
            ) : (
              <Accordion
                multiple
                value={openGroups}
                onValueChange={(value) =>
                  setOpenGroups(value as string[])
                }
                className="grid gap-4 md:gap-6"
              >
                {groups.map((group) => (
                  <AccordionItem
                    key={group.type}
                    value={group.type}
                    className="border-0 border-b-0"
                  >
                    <AccordionTrigger className="py-0 hover:no-underline">
                      <div className="flex w-full items-center justify-between gap-3 pr-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-md font-semibold">
                            {group.type}
                          </span>
                          <span className="text-md font-semibold text-muted-foreground">
                            · {group.count}
                          </span>
                        </div>
                        <span className="text-md font-semibold tabular-nums text-muted-foreground">
                          {hideNetWorthTotal
                            ? 'PHP ********'
                            : `PHP ${formatAmount(
                                group.total,
                                false
                              )}`}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-0">
                      <div className="grid grid-cols-2 gap-2 md:gap-4">
                        {group.accounts.map((account) => (
                          <AccountCard
                            key={account.id}
                            account={account}
                            isSelected={
                              selectedAccountID ===
                              account.id
                            }
                            hidden={Boolean(
                              hideNetWorthTotal
                            )}
                            query={normalizedQuery}
                            onSelect={() =>
                              handleSelectAccount(account)
                            }
                          />
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </>
        )}
      </section>
    </main>
  );
}
