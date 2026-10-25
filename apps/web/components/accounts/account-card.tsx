import type { KeyboardEvent } from 'react';
import { CircleCheck } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatAmount } from '@/lib/format-amount';
import type { Account } from '@/features/accounts/accounts.interface';

interface AccountCardProps {
  account: Account;
  isSelected: boolean;
  hidden: boolean;
  query: string;
  onSelect: () => void;
}

function HighlightMatch({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  const match = query.trim();

  if (!match) return <>{text}</>;

  const index = text
    .toLowerCase()
    .indexOf(match.toLowerCase());

  if (index === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-sm bg-primary px-0.5 text-inherit">
        {text.slice(index, index + match.length)}
      </mark>
      {text.slice(index + match.length)}
    </>
  );
}

export function AccountCard({
  account,
  isSelected,
  hidden,
  query,
  onSelect,
}: AccountCardProps) {
  const handleKeyDown = (
    event: KeyboardEvent<HTMLDivElement>
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect();
    }
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      className="h-full cursor-pointer border-2 transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
    >
      <CardHeader>
        <div className="block md:hidden">
          <div className="flex flex-row items-start justify-between -mb-2">
            <div className="w-full">
              <div className="-mb-1 text-md md:text-xl font-bold">
                <HighlightMatch
                  text={account.name}
                  query={query}
                />
              </div>
              <div className="text-sm md:text-md text-gray-600">
                {account.type}
              </div>
            </div>
            {isSelected ? (
              <span className="inline-flex items-center flex-shrink-0 mt-1">
                <span className="h-3 w-3 rounded-full bg-green-500 ring-4 ring-green-200 animate-pulse" />
              </span>
            ) : null}
          </div>
        </div>

        <div className="hidden md:block">
          <div className="flex flex-row items-center justify-between">
            <div className="text-lg md:text-xl font-bold">
              <HighlightMatch
                text={account.name}
                query={query}
              />
              {isSelected ? (
                <Badge
                  variant="outline"
                  className="ml-2 text-green-600 border-green-200 bg-green-50"
                >
                  <CircleCheck className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              ) : null}
            </div>
            <div className="text-md text-gray-600 font-normal">
              {account.type}
            </div>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="-mb-2 md:mb-0 space-y-2">
        <div className="flex flex-col">
          <h3 className="text-gray-600 font-normal text-sm md:text-lg hidden md:block">
            Balance
          </h3>
          <h1 className="text-lg md:text-2xl font-extrabold mt-0">
            PHP{' '}
            {hidden
              ? '********'
              : formatAmount(account.totalBalance)}
          </h1>
        </div>
      </CardContent>
    </Card>
  );
}
