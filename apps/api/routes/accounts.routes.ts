import { Router } from 'express';
import {
  createAccount,
  deleteAccount,
  getAccountByID,
  getAccounts,
  updateAccount,
} from '../controllers/accounts.controller.ts';

const accountRouter = Router();

// Create New Account
accountRouter.post('/', createAccount);

// Get All Accounts of the user
accountRouter.get('/', getAccounts);

// Get Specific Account
accountRouter.get('/:id', getAccountByID);

// Update Account
accountRouter.put('/:id', updateAccount);

// Delete Account
accountRouter.delete('/:id', deleteAccount);

export default accountRouter;
