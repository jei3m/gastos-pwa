export interface Transaction {
  uuid: string,
  amount: number,
  type: string,
  time: string,
  date: string,
  categoryID: string
};

export interface CreateTransaction {
  amount: number,
  type: string,
  time: string,
  date: string,
  categoryID: string
};

export interface EditTransaction {
  amount: number,
  type: string,
  time: string,
  date: string,
  categoryID: string
};
