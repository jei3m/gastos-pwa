import type { Category } from '../categories/categories.interface';

export interface InsightsData {
  income: string;
  totalIncome: number;
  totalExpense: number;
  categories: Category[];
  refUserID: string;
  refAccountsID: string;
}
