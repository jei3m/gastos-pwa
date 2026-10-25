import {
  breakdownColorPalette,
  accountTypes,
} from '@/lib/data';
import type {
  Account,
  AccountGroup,
  AccountShare,
  AccountTypeSummary,
} from './accounts.interface';

export const ACCOUNT_TYPE_ORDER = accountTypes.filter(
  (type) => type !== 'All'
);

export function getAccountBalance(account: Account) {
  const balance = Number.parseFloat(account.totalBalance);
  return Number.isFinite(balance) ? balance : 0;
}

export function getTypeRank(type: string) {
  const index = ACCOUNT_TYPE_ORDER.indexOf(type);
  return index === -1 ? ACCOUNT_TYPE_ORDER.length : index;
}

export function getAccountShares(
  accounts: Account[]
): AccountShare[] {
  const positiveAccounts = accounts
    .map((account) => ({
      account,
      value: getAccountBalance(account),
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const total = positiveAccounts.reduce(
    (sum, item) => sum + item.value,
    0
  );

  if (total <= 0) return [];

  const rawPercents = positiveAccounts.map(
    (item) => (item.value / total) * 100
  );
  const percents = rawPercents.map((percent) =>
    Math.floor(percent)
  );
  const remaining =
    100 -
    percents.reduce((sum, percent) => sum + percent, 0);
  const byFraction = rawPercents
    .map((percent, index) => ({
      index,
      fraction: percent - Math.floor(percent),
    }))
    .sort((a, b) => b.fraction - a.fraction);

  for (let i = 0; i < remaining; i += 1) {
    const target = byFraction[i % byFraction.length];
    if (target) {
      percents[target.index] =
        (percents[target.index] ?? 0) + 1;
    }
  }

  return positiveAccounts.map((item, index) => ({
    ...item,
    percent: percents[index] ?? 0,
    color:
      breakdownColorPalette[
        index % breakdownColorPalette.length
      ] ??
      breakdownColorPalette[0] ??
      '#2563eb',
  }));
}

export function getAccountTypeSummaries(
  accounts: Account[]
): AccountTypeSummary[] {
  const summaries = new Map<string, AccountTypeSummary>();

  accounts.forEach((account) => {
    const summary = summaries.get(account.type) ?? {
      type: account.type,
      count: 0,
      total: 0,
    };

    summary.count += 1;
    summary.total += getAccountBalance(account);
    summaries.set(account.type, summary);
  });

  return [...summaries.values()].sort(
    (a, b) =>
      getTypeRank(a.type) - getTypeRank(b.type) ||
      a.type.localeCompare(b.type)
  );
}

export function groupAccountsByType(
  accounts: Account[]
): AccountGroup[] {
  const groups = new Map<string, Account[]>();

  accounts.forEach((account) => {
    const group = groups.get(account.type) ?? [];
    group.push(account);
    groups.set(account.type, group);
  });

  return [...groups.entries()]
    .map(([type, typeAccounts]) => ({
      type,
      count: typeAccounts.length,
      total: typeAccounts.reduce(
        (sum, account) => sum + getAccountBalance(account),
        0
      ),
      accounts: typeAccounts,
    }))
    .sort(
      (a, b) =>
        getTypeRank(a.type) - getTypeRank(b.type) ||
        a.type.localeCompare(b.type)
    );
}
