import { z } from 'zod';

export const createTransactionSchema = z
  .object({
    note: z.string().trim().max(30, {
      message: 'Note has a maximum of 30 characters only',
    }),
    amount: z
      .string()
      .regex(/^\d{1,10}(\.\d{1,2})?$/, {
        message:
          'Amount must be a valid decimal with up to 2 decimal places',
      })
      .refine((val) => parseFloat(val) > 0, {
        message: 'Amount must be greater than 0',
      }),
    transferFee: z.string().optional(),
    type: z.enum(['income', 'expense', 'transfer', ''], {
      message:
        'Transaction type can only be income or expense',
    }),
    refCategoriesID: z.string().optional(),
    refAccountsID: z.string({
      message: 'Please select an account',
    }),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: 'Date must be in YYYY-MM-DD format',
    }),
    time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
      message: 'Time must be in HH:MM format',
    }),
    refTransferToAccountsID: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === 'transfer') {
        return (
          data.refTransferToAccountsID &&
          data.refTransferToAccountsID.trim() !== ''
        );
      }
      return true;
    },
    {
      message:
        'Please select a destination account for transfer',
      path: ['refTransferToAccountsID'],
    }
  )
  .refine(
    (data) => {
      if (data.type !== 'transfer' && data.type !== '') {
        return (
          data.refCategoriesID &&
          data.refCategoriesID.trim() !== ''
        );
      }
      return true;
    },
    {
      message: 'Please select a category',
      path: ['refCategoriesID'],
    }
  )
  .refine(
    (data) => {
      if (data.type === 'transfer') {
        return (
          data.transferFee !== undefined &&
          data.transferFee !== null &&
          data.transferFee.trim() !== ''
        );
      }
      return true;
    },
    {
      message: 'Transfer fee is required for transfers',
      path: ['transferFee'],
    }
  )
  .refine(
    (data) => {
      if (data.type === 'transfer' && data.transferFee) {
        const decimalRegex = /^\d{1,10}(\.\d{1,2})?$/;
        if (!decimalRegex.test(data.transferFee)) {
          return false;
        }

        const numericValue = parseFloat(data.transferFee);
        return numericValue >= 0;
      }
      return true;
    },
    {
      message:
        'Transfer fee must be a valid non-negative decimal with up to 2 decimal places',
      path: ['transferFee'],
    }
  );

export const editTransactionSchema = z
  .object({
    note: z.string().trim().max(30, {
      message: 'Note has a maximum of 30 characters only',
    }),
    amount: z
      .string()
      .regex(/^\d{1,10}(\.\d{1,2})?$/, {
        message:
          'Amount must be a valid decimal with up to 2 decimal places',
      })
      .refine((val) => parseFloat(val) > 0, {
        message: 'Amount must be greater than 0',
      }),
    transferFee: z.string().optional(),
    type: z.enum(['income', 'expense', 'transfer', ''], {
      message:
        'Transaction type can only be income or expense',
    }),
    refCategoriesID: z.string().optional(),
    refAccountsID: z.string({
      message: 'Please select an account',
    }),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: 'Date must be in YYYY-MM-DD format',
    }),
    time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
      message: 'Time must be in HH:MM:SS format',
    }),
    refTransferToAccountsID: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === 'transfer') {
        return (
          data.refTransferToAccountsID &&
          data.refTransferToAccountsID.trim() !== ''
        );
      }
      return true;
    },
    {
      message:
        'Please select a destination account for transfer',
      path: ['refTransferToAccountsID'],
    }
  )
  .refine(
    (data) => {
      if (data.type !== 'transfer' && data.type !== '') {
        return (
          data.refCategoriesID &&
          data.refCategoriesID.trim() !== ''
        );
      }
      return true;
    },
    {
      message: 'Please select a category',
      path: ['refCategoriesID'],
    }
  )
  .refine(
    (data) => {
      if (data.type === 'transfer') {
        return (
          data.transferFee !== undefined &&
          data.transferFee !== null &&
          data.transferFee.trim() !== ''
        );
      }
      return true;
    },
    {
      message: 'Transfer fee is required for transfers',
      path: ['transferFee'],
    }
  )
  .refine(
    (data) => {
      if (data.type === 'transfer' && data.transferFee) {
        const decimalRegex = /^\d{1,10}(\.\d{1,2})?$/;
        if (!decimalRegex.test(data.transferFee)) {
          return false;
        }

        const numericValue = parseFloat(data.transferFee);
        return numericValue >= 0;
      }
      return true;
    },
    {
      message:
        'Transfer fee must be a valid non-negative decimal with up to 2 decimal places',
      path: ['transferFee'],
    }
  );
