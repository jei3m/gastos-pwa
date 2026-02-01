import {
  CreateTransaction,
  EditTransactionPayload,
  Transaction,
} from '@/types/transactions.types';

export const createTransaction = async (
  transaction: CreateTransaction
) => {
  try {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    });
    const data = await res.json();
    if (!data.success) {
      throw Error(data.message);
    }
    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw Error(error.message);
    }
    throw Error('Failed to Create Transaction');
  }
};

export const fetchTransactions = async (
  selectedAccountID: string | null,
  page: number
) => {
  try {
    const params = new URLSearchParams();

    if (selectedAccountID)
      params.append('accountID', selectedAccountID);
    if (page) params.append('page', page.toString());

    const res = await fetch(
      `/api/transactions?${params.toString() || ''}`,
      {
        method: 'GET',
      }
    );
    const data = await res.json();
    if (!data.success) {
      throw Error(data.message);
    }

    const sortedData = JSON.parse(JSON.stringify(data));
    // Sort by time (newest to oldest)
    sortedData.data.forEach((transaction: Transaction) => {
      transaction.details.sort((a, b) => {
        return b.time.localeCompare(a.time);
      });
    });

    return sortedData;
  } catch (error) {
    if (error instanceof Error) {
      throw Error(error.message);
    }
    throw Error('Failed to Fetch Transactions');
  }
};

export const fetchTransactionsByCategory = async (
  selectedAccountID: string | null,
  categoryID: string | null,
  page: number,
  dateStart?: string,
  dateEnd?: string
) => {
  try {
    const params = new URLSearchParams();

    if (selectedAccountID)
      params.append('accountID', selectedAccountID);
    if (page) params.append('page', page.toString());
    if (dateStart) params.append('dateStart', dateStart);
    if (dateEnd) params.append('dateEnd', dateEnd);

    const res = await fetch(
      `/api/categories/${categoryID}/transactions?${params.toString() || ''}`,
      {
        method: 'GET',
      }
    );
    const data = await res.json();
    if (!data.success) {
      throw Error(data.message);
    }

    const sortedData = JSON.parse(JSON.stringify(data));
    // Sort by time (newest to oldest)
    sortedData.data.forEach((transaction: Transaction) => {
      transaction.details.sort((a, b) => {
        return b.time.localeCompare(a.time);
      });
    });

    return sortedData;
  } catch (error) {
    if (error instanceof Error) {
      throw Error(error.message);
    }
    throw Error('Failed to Fetch Transactions');
  }
};

export const fetchTransactionByID = async (id: string) => {
  try {
    const res = await fetch(`/api/transactions/${id}`, {
      method: 'GET',
    });
    const data = await res.json();
    if (!data.success) {
      throw Error(data.message);
    }
    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw Error(error.message);
    }
    throw Error('Failed to Fetch Transaction');
  }
};

export const fetchTransactionsCount = async (
  selectedAccountID: string
) => {
  try {
    const res = await fetch(
      `/api/transactions/count?accountID=${selectedAccountID}`,
      {
        method: 'GET',
      }
    );
    const data = await res.json();
    if (!data.success) {
      throw Error(data.message);
    }
    return data.data?.[0].count;
  } catch (error) {
    if (error instanceof Error) {
      throw Error(error.message);
    }
    throw Error('Failed to Fetch Transactions');
  }
};

export const editTransaction = async (
  id: string,
  transaction: EditTransactionPayload
) => {
  try {
    const res = await fetch(`/api/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    });
    const data = await res.json();
    if (!data.success) {
      throw Error(data.message);
    }
    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw Error(error.message);
    }
    throw Error('Failed to Update Transaction');
  }
};

export const deleteTransaction = async (id: string) => {
  try {
    const res = await fetch(`/api/transactions/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!data.success) {
      throw Error(data.message);
    }
    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw Error(error.message);
    }
    throw Error('Failed to Update Transaction');
  }
};
