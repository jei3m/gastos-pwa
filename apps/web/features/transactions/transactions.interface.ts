export interface TransactionData {
  success: boolean;
  hasMore: boolean;
  currentPage: number;
  data: Transaction[];
}

export interface Transaction {
  date: string;
  total: string;
  totalIncome: string;
  totalExpense: string;
  details: TransactionDetails[];
}

export interface TransactionDetails {
  id: string;
  note: string;
  time: string;
  type: string;
  amount: number;
  transferFee?: number;
  isTransfer?: boolean;
  category: string;
  icon: string;
  categoryType: string;
  userName: string;
  userImage: string;
  refUserID: string;
  transferToAccountName?: string;
}

export interface CategoryTransactionsPage {
  hasMore: boolean;
  currentPage: number;
  categoryDetails: CategoryDetail[];
  data: Transaction[];
}

export interface CategoryDetail {
  id: string;
  name: string;
  type: string;
  icon: string;
  description: string;
  totalAmount: number;
}

export interface CreateTransaction {
  note: string;
  amount: number;
  transferFee: number;
  type: string;
  time: string;
  date: string;
  refCategoriesID?: string;
  refAccountsID: string;
  refTransferToAccountsID?: string;
}

export interface EditTransactionPayload {
  amount: number;
  note: string;
  type: string;
  transferFee?: number;
  refCategoriesID?: string;
  refAccountsID: string;
  date: string;
  time: string;
  refTransferToAccountsID?: string;
}
