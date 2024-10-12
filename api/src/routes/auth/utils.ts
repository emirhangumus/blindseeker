export const hashPassword = async (rawPassword: string) => {
    return await Bun.password.hash(rawPassword);
}

export const verifyPassword = async (rawPassword: string, hashedPassword: string) => {
    return await Bun.password.verify(rawPassword, hashedPassword);
}