
import { PUBLIC_API_URL } from "$env/static/public";
import { type Actions } from "@sveltejs/kit";
import { fail, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types.js";
import { formSchema } from "./schema";

export const load: PageServerLoad = async () => {
    return {
        form: await superValidate(zod(formSchema)),
    };
};

export const actions: Actions = {
    default: async (event) => {
        try {
            const form = await superValidate(event, zod(formSchema));
            if (!form.valid) {
                return fail(400, {
                    form,
                    location: '/login',
                });
            }

            const ret = await fetch(PUBLIC_API_URL + '/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form.data),
            });

            const data = await ret.json();
            console.log(data);

            if (!data.status) {
                throw new Error(data.message);
            }

            event.cookies.set('token', data.data.token, {
                path: '/',
                httpOnly: false,
            });

            return {
                form,
                location: '/',
            }
        } catch (e) {
            console.log(e);
            return fail(500, {
                form: {
                    valid: false,
                    errors: ['An error occurred!'],
                },
                location: '/login',
            });
        }

    },
};