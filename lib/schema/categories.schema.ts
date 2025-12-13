import { z } from "zod";

export const createCategorySchema = z.object({
    name: z.string().max(15, {
        message: 'Name has a maximum of 15 characters only',
    }),
    type: z.string().min(1, {
        message: 'Please select a category type',
    }),
    icon: z.string().min(1, {
        message: 'Please select a category icon',
    }),
    accountID: z.string().min(1, {
        message: 'Account ID is Required',
    })
});

export const editCategorySchema = z.object({
    name: z.string().max(15, {
        message: 'Name has a maximum of 15 characters only',
    }),
    type: z.string().min(1, {
        message: 'Please select a category type',
    }),
    icon: z.string().min(1, {
        message: 'Please select a category icon',
    }),
    accountID: z.string().min(1, {
        message: 'Account ID is Required',
    })
});