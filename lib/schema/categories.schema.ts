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
    description: z.string({
        message: 'Please add description'
    }),
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
    description: z.string().min(1, {
        message: 'Please add a description',
    })
});