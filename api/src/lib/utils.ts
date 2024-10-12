import { validator } from "hono/validator";
import { z } from "zod";

type rProps<T> = {
    message: string;
    code?: number;
} & (
        {
            status: true;
            data: T
        }
        | {
            status: false;
            data?: undefined
        }
    )

export const r = <T>({
    status,
    message,
    data,
    code,
}: rProps<T>) => {
    return {
        status,
        message,
        data,
        code,
    }
}

export const zValidate = <T>(schema: z.ZodType<T, any>) => {
    return validator('json', (value, c) => {
        const parsed = schema.safeParse(value)
        if (!parsed.success) {
            return c.json(r({
                message: 'Invalid request!',
                status: false,
            }), 400)
        }
        return parsed.data
    });
}