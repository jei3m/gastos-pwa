export interface CategoryData {
  type: string;
  totalIncome: string;
  totalExpense: string;
  details: Category[];
  refUserID: string;
  refAccountsID: string;
}

export interface Category {
  id: string;
  name: string;
  type: string;
  amount: number;
  icon: string;
  description: string;
  totalAmount: number;
  refUserID: string;
  refAccountsID: string;
}

export interface CreateCategory {
  name: string;
  type: string;
  icon: string;
  description: string;
}

export interface EditCategory {
  name: string;
  type: string;
  icon: string;
  description: string;
}
