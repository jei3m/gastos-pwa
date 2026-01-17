export interface Account {
  id: string;
  name: string;
  type: string;
  description: string;
  totalBalance: string;
}

export interface CreateAccount {
  name: string;
  type: string;
  description: string;
}

export interface EditAccount {
  name: string;
  type: string;
  description: string;
}
