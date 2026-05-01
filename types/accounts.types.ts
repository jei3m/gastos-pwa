export interface Account {
  id: string;
  name: string;
  type: string;
  description: string;
  totalBalance: string;
  isDropdown: number;
}

export interface CreateAccount {
  name: string;
  type: string;
  description: string;
  isDropdown: number;
}

export interface EditAccount {
  name: string;
  type: string;
  description: string;
  isDropdown: number;
}
