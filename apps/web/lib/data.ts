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
  '#10b981', // emerald   160°
  '#f59e0b', // amber      45°
  '#2563eb', // blue      258°
  '#ec4899', // pink      330°
  '#6366f1', // indigo    245°
  '#84cc16', // lime       85°
  '#06b6d4', // cyan      190°
  '#f97316', // orange     25°
  '#14b8a6', // teal      175°
  '#8b5cf6', // violet    262°
];
