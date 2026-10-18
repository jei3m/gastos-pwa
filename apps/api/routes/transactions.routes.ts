import { Router } from 'express';
import {
  createTransaction,
  deleteTransaction,
  getTransactionByID,
  getTransactions,
  getTransactionsCount,
  updateTransaction,
} from '../controllers/transactions.controller.ts';

const transactionsRouter = Router();

// Create New Transaction
transactionsRouter.post('/', createTransaction);

// Get Count of Transactions
transactionsRouter.get('/count', getTransactionsCount);

// Fetch Transactions with Pagination
transactionsRouter.get('/', getTransactions);

// Get Specific Transaction
transactionsRouter.get('/:id', getTransactionByID);

// Update Transaction
transactionsRouter.put('/:id', updateTransaction);

// Delete Transaction
transactionsRouter.delete('/:id', deleteTransaction);

export default transactionsRouter;
