export type JwtPayload = {
    id: number;
    username: string;
    iat: number;
    exp: number;
}