import { z } from 'zod';

export const createAccountSchema = z.object({
  name: z.string().trim().max(10, {
    message: 'Name has a maximum of 10 characters only',
  }),
  type: z.string().min(1, {
    message: 'Please select an account type',
  }),
  description: z.string(),
  isDropdown: z.number().min(0).max(1),
});

export const updateAccountSchema = z.object({
  name: z.string().trim().max(10, {
    message: 'Name has a maximum of 10 characters only',
  }),
  type: z.string().min(1, {
    message: 'Please select an account type',
  }),
  description: z.string(),
  isDropdown: z.number().min(0).max(1),
});
