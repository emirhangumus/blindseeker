export type Player = {
    id: string;
    username: string;
};

export type ChatMessage = {
    isServer: boolean;
    id: string;
    username: string;
    message: string;
}

export type Stats = {
    username: string;
    gold: number;
    isSeeker: boolean;
}

export type Item = {
    id: string;
    name: string;
    photo: string;
    description: string;
    effect: string;
}