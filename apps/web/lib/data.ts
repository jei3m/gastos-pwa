import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeftRight,
  Landmark,
  PieChart,
  Settings,
} from 'lucide-react';

export interface DockItem {
  label: string;
  icon: LucideIcon;
  route: string;
}

export const tabItems = [
  { value: 'weekly' },
  { value: 'monthly' },
  { value: 'yearly' },
];

export const categoryTypes = ['Expense', 'Income'];

export const transactionTypes = [
  'Expense',
  'Income',
  'Transfer',
];

export const accountTypes = ['All', 'Digital', 'Cash'];

export const menuItems: DockItem[] = [
  {
    label: 'transactions',
    icon: ArrowLeftRight,
    route: '/transactions',
  },
  {
    label: 'accounts',
    icon: Landmark,
    route: '/accounts',
  },
  {
    label: 'insights',
    icon: PieChart,
    route: '/insights',
  },
  {
    label: 'settings',
    icon: Settings,
    route: '/settings',
  },
];

export const breakdownColorPalette = [
  '#2563eb',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#f97316',
  '#84cc16',
  '#6366f1',
  '#14b8a6',
];
