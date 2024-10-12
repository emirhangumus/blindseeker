import { PUBLIC_API_URL } from "$env/static/public";

type ResponserErrorResponse = string;

export type ResponserResponse<T> =
    | {
        status: true;
        data: T;
        message: null;
    }
    | {
        status: false;
        data: null;
        message: ResponserErrorResponse;
    };

const returnError = <T>(message: string): ResponserResponse<T> => {
    return {
        status: false,
        data: null,
        message: message,
    };
};

export const parseCookies = (cookie: string): { [key: string]: string } =>
    cookie
        .split(";")
        .map((c) => c.trim())
        .map((c) => c.split("="))
        .reduce((acc: { [key: string]: string }, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {} as { [key: string]: string });

export const fetchAPI = async <T>(
    endpoint: string,
    init?: RequestInit,
): Promise<ResponserResponse<T>> => {
    const token = parseCookies(document.cookie).token;

    try {
        const method = init?.method || "GET";

        const target = endpoint.startsWith("http")
            ? endpoint
            : `${PUBLIC_API_URL}${endpoint}`;

        const res = await fetch(target, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: token ? `Bearer ${token}` : "",
            },
            body: init?.body,
        });

        const data = await res.json();

        return data as ResponserResponse<T>;
    } catch (error) {
        console.log(error);

        return returnError("An error occurred");
    }
};