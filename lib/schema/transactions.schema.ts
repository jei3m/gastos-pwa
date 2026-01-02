import { z } from "zod"

export const createTransactionSchema = z.object({
  note: z.string().max(20, {
    message: "Note has a maximum of 20 characters only",
  }),
  amount: z.string()
    .regex(/^\d{1,10}(\.\d{1,2})?$/, {
      message: "Amount must be a valid decimal with up to 2 decimal places"
    })
    .refine((val) => parseFloat(val) > 0, {
      message: "Amount must be greater than 0"
    }),
  transferFee: z.string().optional(),
  type: z.enum(['income', 'expense', 'transfer', ''], {
    message: "Transaction type can only be income or expense"
  }),
  refCategoriesID: z.string().optional(),
  refAccountsID: z.string({
    message: "Please select an account"
  }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Date must be in YYYY-MM-DD format"
  }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Time must be in HH:MM format"
  }),
  refTransferToAccountsID: z.string().optional()
})
.refine(
  (data) => {
    // If type is 'transfer', transferToAccountID is required
    if (data.type === 'transfer') {
      return data.refTransferToAccountsID && data.refTransferToAccountsID.trim() !== '';
    }
    return true;
  },
  {
    message: "Please select a destination account for transfer",
    path: ["refTransferToAccountsID"]
  }
)
.refine(
  (data) => {
    // If type is not 'transfer', refCategoriesID is required
    if (data.type !== 'transfer' && data.type !== '') {
      return data.refCategoriesID && data.refCategoriesID.trim() !== '';
    }
    return true;
  },
  {
    message: "Please select a category",
    path: ["refCategoriesID"]
  }
)
.refine(
  (data) => {
    // If type is 'transfer', transferFee is required
    if (data.type === 'transfer') {
      return data.transferFee !== undefined && data.transferFee !== null && data.transferFee.trim() !== '';
    }
    return true;
  },
  {
    message: "Transfer fee is required for transfers",
    path: ["transferFee"]
  }
)
.refine(
  (data) => {
    // If type is 'transfer', validate transferFee format
    if (data.type === 'transfer' && data.transferFee) {
      // Check if it's a valid decimal with up to 2 places
      const decimalRegex = /^\d{1,10}(\.\d{1,2})?$/;
      if (!decimalRegex.test(data.transferFee)) {
        return false;
      }
      
      // Check if it's a non-negative number
      const numericValue = parseFloat(data.transferFee);
      return numericValue >= 0;
    }
    return true;
  },
  {
    message: "Transfer fee must be a valid non-negative decimal with up to 2 decimal places",
    path: ["transferFee"]
  }
);

export const editTransactionSchema = z.object({
  note: z.string().max(20, {
    message: "Note has a maximum of 20 characters only",
  }),
  amount: z.string()
    .regex(/^\d{1,10}(\.\d{1,2})?$/, {
      message: "Amount must be a valid decimal with up to 2 decimal places"
    })
    .refine((val) => parseFloat(val) > 0, {
      message: "Amount must be greater than 0"
    }),
  transferFee: z.string().optional(),
  type: z.enum(['income', 'expense', 'transfer', ''], {
    message: "Transaction type can only be income or expense"
  }),
  refCategoriesID: z.string().optional(),
  refAccountsID: z.string({
    message: "Please select an account"
  }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Date must be in YYYY-MM-DD format"
  }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Time must be in HH:MM:SS format"
  }),
  refTransferToAccountsID: z.string().optional()
})
.refine(
  (data) => {
    // If type is 'transfer', transferToAccountID is required
    if (data.type === 'transfer') {
      return data.refTransferToAccountsID && data.refTransferToAccountsID.trim() !== '';
    }
    return true;
  },
  {
    message: "Please select a destination account for transfer",
    path: ["transferToAccountID"]
  }
)
.refine(
  (data) => {
    // If type is not 'transfer', refCategoriesID is required
    if (data.type !== 'transfer' && data.type !== '') {
      return data.refCategoriesID && data.refCategoriesID.trim() !== '';
    }
    return true;
  },
  {
    message: "Please select a category",
    path: ["refCategoriesID"]
  }
)
.refine(
  (data) => {
    // If type is 'transfer', transferFee is required
    if (data.type === 'transfer') {
      return data.transferFee !== undefined && data.transferFee !== null && data.transferFee.trim() !== '';
    }
    return true;
  },
  {
    message: "Transfer fee is required for transfers",
    path: ["transferFee"]
  }
)
.refine(
  (data) => {
    // If type is 'transfer', validate transferFee format
    if (data.type === 'transfer' && data.transferFee) {
      // Check if it's a valid decimal with up to 2 places
      const decimalRegex = /^\d{1,10}(\.\d{1,2})?$/;
      if (!decimalRegex.test(data.transferFee)) {
        return false;
      }
      
      // Check if it's a non-negative number
      const numericValue = parseFloat(data.transferFee);
      return numericValue >= 0;
    }
    return true;
  },
  {
    message: "Transfer fee must be a valid non-negative decimal with up to 2 decimal places",
    path: ["transferFee"]
  }
);