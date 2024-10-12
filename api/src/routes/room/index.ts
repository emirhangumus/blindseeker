import { Hono } from 'hono';
import { db } from '../../lib/db/database';
import { z } from 'zod';
import { r, zValidate } from '../../lib/utils';
import { Game } from '../../lib/maze/logic';

export const ROOM_STATUS = {
    OPEN: 'OPEN',
    CLOSED: 'CLOSED',
} as const;

const room = new Hono()

const roomCreateSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
})

const generateUniqueRoomId = async () => {
    const id = 'R' + Math.random().toString(36).substring(7).toUpperCase();
    const room = await db.selectFrom('rooms')
        .where('id', '=', id)
        .executeTakeFirst();
    if (room) return generateUniqueRoomId();
    return id;
}

room.get('/', async (c) => {
    const rooms = await db.selectFrom('rooms')
        .selectAll()
        .where('status', '=', ROOM_STATUS.OPEN)
        .execute();

    return c.json(r({
        message: 'Rooms fetched successfully!',
        status: true,
        data: rooms,
    }))
});

room.post('/create', zValidate(roomCreateSchema), async (c) => {
    const { name, description } = c.req.valid('json');
    const room = await db.insertInto('rooms')
        .values({
            id: await generateUniqueRoomId(),
            description,
            name,
            status: ROOM_STATUS.OPEN,
        })
        .returning('id')
        .executeTakeFirst();

    if (!room) return c.json(r({
        status: false,
        message: 'Failed to create room!',
    }))

    const game = new Game({
        gameId: -1,
        badWheelTileCount: 1,
        goodWheelTileCount: 1,
        shopTileCount: 2,
        blankStationTileCount: 5,
        players: []
    });

    let gameId = await db.insertInto('games')
        .values({
            data: JSON.stringify(game),
        })
        .returning('id')
        .executeTakeFirst();

    if (!gameId) return c.json(r({
        status: false,
        message: 'Failed to create game!',
    }))

    game.setGameId(gameId.id);

    await db.updateTable('games').set({
        data: JSON.stringify(game),
    }).where('id', '=', gameId.id).execute();

    await db.insertInto('room_games')
        .values({
            game_id: gameId.id,
            room_id: room.id,
        })
        .execute();

    return c.json(r({
        status: true,
        message: 'Room created successfully!',
        data: room,
    }))
})

export default room;