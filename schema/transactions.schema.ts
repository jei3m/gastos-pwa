import { z } from "zod"

export const createTransactionSchema = z.object({
  note: z.string().max(20, {
    message: "Note has a maximum of 20 characters only",
  }),
  amount: z.string().regex(/^\d{1,10}(\.\d{1,2})?$/, {
    message: "Amount must be a valid decimal with up to 2 decimal places"
  }),
  type: z.enum(['income', 'expense', ''], {
    message: "Transaction type can only be income or expense"
  }),
  categoryID: z.string({
    message: "Please select a category"
  }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Date must be in YYYY-MM-DD format"
  }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Time must be in HH:MM:SS format"
  })
});
