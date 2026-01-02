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
  transferFee?: number,
  isTransfer?: boolean,
  category: string
}

export interface CreateTransaction {
  amount: number,
  transferFee: number,
  type: string,
  time: string,
  date: string,
  refCategoriesID?: string,
  transferToAccountID?: string,
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
  type: "" | "income" | "expense" | "transfer",
  refCategoriesID?: string,
  refAccountsID: string,
  date: string,
  time: string,
  refTransferToAccountsID?: string,
};