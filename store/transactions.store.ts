import { 
  CreateTransaction
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