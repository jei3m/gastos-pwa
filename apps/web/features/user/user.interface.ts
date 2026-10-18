export interface ExportedAccount {
  id: string;
  name: string;
  type: string;
  description: string;
  totalBalance: string;
  isDropdown: number;
  refUserID: string;
}

export interface ExportedCategory {
  id: string;
  name: string;
  type: string;
  icon: string;
  description: string;
  refAccountsID: string | null;
  refUserID: string;
}

export interface ExportedTransaction {
  id: string;
  note: string;
  amount: string;
  transferFee: number;
  isTransfer: number;
  type: string;
  time: string;
  date: string;
  refCategoriesID: string | null;
  refTransferToAccountsID: string | null;
  refUserID: string;
  refAccountsID: string;
  categoryName: string | null;
  categoryIcon: string | null;
  categoryType: string | null;
  accountName: string;
  accountType: string;
  userName: string | null;
  userEmail: string | null;
}

export interface UserDataExport {
  accounts: ExportedAccount[];
  categories: ExportedCategory[];
  transactions: ExportedTransaction[];
}
