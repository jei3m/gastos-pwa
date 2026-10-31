import { Router } from 'express';
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryByID,
  getCategoryTransactions,
  updateCategory,
} from './categories.controller.ts';

const categoriesRouter = Router();

// Create Category
categoriesRouter.post('/', createCategory);

// Get Categories (breakdown / list / options)
categoriesRouter.get('/', getCategories);

// Fetch Transactions By Category with Pagination
categoriesRouter.get(
  '/:id/transactions',
  getCategoryTransactions
);

// Get Specific Category
categoriesRouter.get('/:id', getCategoryByID);

// Update Category
categoriesRouter.put('/:id', updateCategory);

// Delete Category
categoriesRouter.delete('/:id', deleteCategory);

export default categoriesRouter;
