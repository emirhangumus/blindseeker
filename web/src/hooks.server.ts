import type { Handle } from "@sveltejs/kit";

export type SessionUser = {
    id: number;
    email: string;
};

// const parse = (cookie: string) =>
//     cookie
//         .split(";")
//         .map((v) => v.split("="))
//         .reduce((acc: Record<string, string>, [key, value]) => {
//             if (key.trim() === "") return acc;
//             acc[key.trim()] = decodeURIComponent(value);
//             return acc;
//         }, {});

export const handle: Handle = async ({ event, resolve }) => {
    // const { headers } = event.request;
    // const cookies = parse(headers.get("cookie") ?? "");

    // if (cookies.AuthorizationToken) {
    //     // Remove Bearer prefix
    //     const token = cookies.AuthorizationToken.split(" ")[1];

    //     console.log("->", token);

    //     try {
    //         const user = await fetch("http://localhost:3000/auth/verify", {
    //             headers: {
    //                 Authorization: `Bearer ${token}`,
    //             },
    //         }).then((res) => res.json());

    //         const sessionUser: SessionUser = {
    //             id: user.id,
    //             email: user.email,
    //         };

    //         event.locals.user = sessionUser;
    //     } catch (error) {
    //         console.error(error);
    //     }
    // }

    return await resolve(event);
};