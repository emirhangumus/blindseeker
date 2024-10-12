import { Hono } from 'hono';
import { jwt, sign } from 'hono/jwt';
import { validator } from 'hono/validator';
import { z } from 'zod';
import { db } from '../../lib/db/database';
import { r, zValidate } from '../../lib/utils';
import { hashPassword, verifyPassword } from './utils';

const auth = new Hono()

const loginSchema = z.object({
    usernameOrEmail: z.string(),
    password: z.string()
})

auth.post('/login', zValidate(loginSchema), async (c) => {
    const { usernameOrEmail, password } = c.req.valid('json')

    const isEmail = usernameOrEmail.includes('@')

    let query = db.selectFrom('users').select(['id', 'password', 'email', 'username'])

    if (isEmail) {
        query = query.where('email', "=", usernameOrEmail)
    } else {
        query = query.where('username', "=", usernameOrEmail)
    }

    const user = await query.executeTakeFirst()



    if (!user) {
        return c.json(r({
            message: 'User not found!',
            status: false,
        }))
    }

    if (!(await verifyPassword(password, user.password))) {
        return c.json(r({
            message: 'Invalid password!',
            status: false,
        }))
    }

    const token = await sign({
        id: user.id,
        email: user.email,
        username: user.username
    }, Bun.env.JWT_SECRET!);


    return c.json(r({
        message: 'Logged in!',
        status: true,
        data: {
            token
        },
    }))
});


const registerSchema = z.object({
    email: z.string().email(),
    username: z.string(),
    password: z.string(),
    confirmPassword: z.string()
})

auth.post('/register', validator('json', (value, c) => {
    const parsed = registerSchema.safeParse(value)
    if (!parsed.success) {
        return c.text('Invalid!', 401)
    }
    return parsed.data
}), async (c) => {
    try {
        const { email, username, password, confirmPassword } = c.req.valid('json')
        if (password !== confirmPassword) {
            return c.json(r({
                message: 'Passwords do not match!',
                status: false,
            }))
        }

        const user = await db.selectFrom('users')
            .where((eb) => eb.or([
                eb('email', "=", email),
                eb('username', "=", username)
            ]))
            .select(['id'])
            .executeTakeFirst();
        if (user) {
            return c.json(r({
                message: 'User already exists!',
                status: false,
            }))
        };


        const hashedPass = await hashPassword(password);

        await db.insertInto('users').values({
            email,
            username,
            password: hashedPass
        }).execute();

        return c.json(r({
            message: 'User created!',
            status: true,
            data: {}
        }))
    } catch (e) {
        console.log(e);
        return c.json(r({
            message: 'Error!',
            status: false,
        }))
    }
});


auth.get('/me', jwt({
    secret: Bun.env.JWT_SECRET!,
}), async (c) => {
    const payload = c.get('jwtPayload')
    return c.json(r({
        message: '',
        status: true,
        data: payload
    }))
})

export default auth;