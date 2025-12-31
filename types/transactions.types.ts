export interface Transaction {
  date: string,
  total: string,
  totalIncome: string,
  totalExpense: string,
  details: TransactionDetails[],
  userID: string
};

export interface TransactionDetails {
  id: string,
  note: string,
  time: string,
  type: string,
  amount: number,
  category: string
}

export interface CreateTransaction {
  amount: number,
  type: string,
  time: string,
  date: string,
  refCategoriesID: string
};

export interface EditTransaction {
  id: string,
  note: string,
  time: string,
  type: "" | "income" | "expense",
  amount: string,
  category: string,
  date: string,
  refCategoriesID: string,
  refAccountsID: string,
  refUserID: string
};

export interface EditTransactionPayload {
  amount: number,
  note: string;
  type: "" | "income" | "expense",
  refCategoriesID: string,
  refAccountsID: string,
  date: string,
  time: string,
};