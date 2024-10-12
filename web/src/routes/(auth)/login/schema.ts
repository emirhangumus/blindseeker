
import { z } from "zod";

export const formSchema = z.object({
    usernameOrEmail: z.string().min(2).max(100),
    password: z.string().min(2).max(100)
});

export type FormSchema = typeof formSchema;

