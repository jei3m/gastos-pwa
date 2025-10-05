import { z } from "zod";

export const createCategorySchema = z.object({
    name: z.string().max(15, {
        message: 'Name has a maximum of 15 characters only',
    }),
    type: z.string().min(1, {
        message: 'Please select a category type',
    })
});