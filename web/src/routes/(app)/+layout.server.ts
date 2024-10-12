import { PUBLIC_API_URL } from "$env/static/public";
import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ cookies }) => {

    try {

        const token = cookies.get('token');

        if (!token) {
            throw new Error('No token');
        }

        const ret = await fetch(PUBLIC_API_URL + '/auth/me', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(res => res.json());

        if (!ret.status) {
            throw new Error(ret.message);
        }

        return {
            user: ret.data
        }
    } catch (e) {
        console.log(e);

        return redirect(302, '/login');
    };
}