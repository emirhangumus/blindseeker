
import { z } from "zod";

export const formSchema = z.object({
    email: z.string().email(),
    username: z.string(),
    password: z.string(),
    confirmPassword: z.string()
});

export type FormSchema = typeof formSchema;

