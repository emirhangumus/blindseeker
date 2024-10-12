import { Hono } from 'hono';

const game = new Hono()

game.get('/create', async (c) => {
    // return c.json(game);
    return c.json({ message: 'Game created' });
})

export default game;