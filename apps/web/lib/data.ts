import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeftRight,
  Landmark,
  Settings,
  Tags,
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
    label: 'categories',
    icon: Tags,
    route: '/categories',
  },
  {
    label: 'settings',
    icon: Settings,
    route: '/settings',
  },
];
