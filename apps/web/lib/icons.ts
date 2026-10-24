import type { ComponentType } from 'react';
import {
  ArrowDownUp,
  BookOpen,
  Briefcase,
  Building,
  Car,
  Coffee,
  Coins,
  Dumbbell,
  Ellipsis,
  Gift,
  Heart,
  HeartPulse,
  Home as HomeIcon,
  Landmark,
  type LucideProps,
  Phone,
  PiggyBank,
  Plane,
  Receipt,
  Shield,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Utensils,
  Wallet,
  Wrench,
} from 'lucide-react';

export interface IconData {
  id: string;
  name: string;
  icon: ComponentType<LucideProps>;
  type: string;
}

export type IconKey = (typeof icons)[number]['id'];

export const icons: IconData[] = [
  {
    id: 'food',
    name: 'Food',
    icon: Utensils,
    type: 'expense',
  },
  {
    id: 'car',
    name: 'Car',
    icon: Car,
    type: 'expense',
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: ShoppingBag,
    type: 'expense',
  },
  {
    id: 'groceries',
    name: 'Groceries',
    icon: ShoppingCart,
    type: 'expense',
  },
  {
    id: 'health',
    name: 'Health',
    icon: Heart,
    type: 'expense',
  },
  {
    id: 'education',
    name: 'Education',
    icon: BookOpen,
    type: 'expense',
  },
  {
    id: 'travel',
    name: 'Travel',
    icon: Plane,
    type: 'expense',
  },
  {
    id: 'rent',
    name: 'Rent',
    icon: HomeIcon,
    type: 'expense',
  },
  {
    id: 'insurance',
    name: 'Insurance',
    icon: Shield,
    type: 'expense',
  },
  {
    id: 'phone',
    name: 'Phone',
    icon: Phone,
    type: 'expense',
  },
  {
    id: 'fitness',
    name: 'Fitness',
    icon: Dumbbell,
    type: 'expense',
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: HeartPulse,
    type: 'expense',
  },
  {
    id: 'transfer',
    name: 'Transfer',
    icon: ArrowDownUp,
    type: 'expense',
  },
  {
    id: 'coffee',
    name: 'Coffee',
    icon: Coffee,
    type: 'expense',
  },
  {
    id: 'repairs',
    name: 'Repairs',
    icon: Wrench,
    type: 'expense',
  },
  {
    id: 'ellipsis',
    name: 'Ellipsis',
    icon: Ellipsis,
    type: 'expense',
  },

  {
    id: 'transfer',
    name: 'Transfer',
    icon: ArrowDownUp,
    type: 'income',
  },
  {
    id: 'gift',
    name: 'Gift',
    icon: Gift,
    type: 'income',
  },
  {
    id: 'investment',
    name: 'Investment',
    icon: TrendingUp,
    type: 'income',
  },
  {
    id: 'business',
    name: 'Business',
    icon: Building,
    type: 'income',
  },
  {
    id: 'savings',
    name: 'Savings',
    icon: PiggyBank,
    type: 'income',
  },
  {
    id: 'cash',
    name: 'Cash',
    icon: Coins,
    type: 'income',
  },
  {
    id: 'works',
    name: 'Freelance',
    icon: Briefcase,
    type: 'income',
  },
  {
    id: 'receipt',
    name: 'Refund',
    icon: Receipt,
    type: 'income',
  },
  {
    id: 'wallet',
    name: 'Wallet',
    icon: Wallet,
    type: 'income',
  },
  {
    id: 'professional',
    name: 'Professional',
    icon: Landmark,
    type: 'income',
  },
  {
    id: 'heart',
    name: 'Heart',
    icon: Heart,
    type: 'income',
  },
  {
    id: 'ellipsis',
    name: 'Ellipsis',
    icon: Ellipsis,
    type: 'income',
  },
];

export const getIconsByType = (
  type: string
): IconData[] => {
  return icons.filter(
    (icon) => icon.type.toLowerCase() === type.toLowerCase()
  );
};

export const getIconById = (
  id: string
): IconData | undefined => {
  return icons.find((icon) => icon.id === id);
};
