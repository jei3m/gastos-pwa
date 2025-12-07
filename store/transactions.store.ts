import {
  CreateTransaction,
  EditTransactionPayload,
} from "@/types/transactions.types";

export const createTransaction = async(transaction: CreateTransaction) => {
  try {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(transaction)
    });
    const data = await res.json();
    if(!res.ok) throw Error(data.message);
    return(data.data);
  } catch (error) {
    if (error instanceof Error) {
      throw Error(error.message);
    };
    throw Error('Failed to Create Transaction');
  }
};

export const fetchTransactions = async(
  selectedAccountID: string,
  page: number,
) => {
  try {
    const res = await fetch(`/api/transactions?accountID=${selectedAccountID}&page=${page}`)
    const data = await res.json();
    return(data.data);
  } catch (error) {
    if (error instanceof Error) {
      throw Error(error.message)
    };
    throw Error("Failed to Fetch Transactions")
  }
};

export const fetchTransactionByID = async(
  uuid: string,
) => {
  try {
    const res = await fetch(`/api/transactions/${uuid}`)
    const data = await res.json();
    return(data.data);
  } catch (error) {
    if (error instanceof Error) {
      throw Error(error.message)
    };
    throw Error("Failed to Fetch Transaction")
  }
};

export const fetchTransactionsCount = async(
  selectedAccountID: string
) => {
  try {
    const res = await fetch(`/api/transactions/count?accountID=${selectedAccountID}`)
    const data = await res.json();
    return(data.data);
  } catch (error) {
    if (error instanceof Error) {
      throw Error(error.message)
    };
    throw Error("Failed to Fetch Transactions")
  }
};

export const editTransactions = async(
  uuid: string,
  transaction: EditTransactionPayload
) => {
  try {
    const res = await fetch(`/api/transactions/${uuid}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(transaction)
    });
    const data = await res.json();
    if (!res.ok) throw Error(data.message);
    return(data.data);
  } catch (error) {
    if (error instanceof Error){
      throw Error(error.message);
    };
    throw Error('Failed to Update Transaction')
  }
};

export const deleteTransaction = async(uuid: string) => {
  try {
    const res = await fetch(`/api/transactions/${uuid}`, {
      method: 'DELETE',
      headers: {'Content-Type': 'application/json'},
    });
    const data = await res.json();
    if (!res.ok) throw Error(data.message);
    return(data.data);
  } catch (error) {
    if (error instanceof Error){
      throw Error(error.message);
    };
    throw Error('Failed to Update Transaction')
  }
};