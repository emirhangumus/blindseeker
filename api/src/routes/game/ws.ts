import { ServerWebSocket } from "bun"
import { Hono } from "hono"
import { createBunWebSocket } from "hono/bun"
import { verify } from "hono/jwt";
import { JwtPayload } from "../../types";
import { WSContext } from "hono/ws";
import { db } from "../../lib/db/database";
import { Game, GameMap, TGameMap } from "../../lib/maze/logic";

const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>()

const gameWS = new Hono();

type Players = {
    ws: WSContext<ServerWebSocket>,
    player: {
        id: number,
        username: string
    }
}

type RoomData = {
    players: Players[]
    game: Game
}

const gameMap = new Map<string, RoomData>()

const getRoomAndPlayer = async (ws: WSContext<ServerWebSocket>) => {
    const token = ws.url?.searchParams.get('token')
    const roomId = ws.url?.searchParams.get('roomId')

    if (!token || !roomId) {
        ws.close(4001, 'Unauthorized')
        return {
            success: false,
            roomId: null,
            payload: null
        }
    }

    const payload: JwtPayload = await verify(token, Bun.env.JWT_SECRET!) as JwtPayload;
    const room = await db.selectFrom('rooms').where('id', '=', roomId).executeTakeFirst();

    if (!room) {
        ws.close(4001, 'Unauthorized')
        return {
            success: false,
            roomId: null,
            payload: null
        }
    }

    return {
        success: true,
        roomId,
        payload
    }
}

const getPlayerByIds = async (ids: number[]) => {
    return await db.selectFrom('users')
        .where('id', 'in', ids)
        .select(['id', 'username'])
        .execute();
}

const ALL_MESSAGE_TYPES = ['players', 'startGame', 'move', 'end']

gameWS.get(
    '/game',
    upgradeWebSocket((c) => {
        return {
            onOpen: async (event, ws) => {
                try {
                    const { success, roomId, payload } = await getRoomAndPlayer(ws)

                    if (!success || !roomId || !payload) {
                        return
                    }

                    if (gameMap.has(roomId)) {
                        gameMap.get(roomId)?.players.push({
                            ws,
                            player: {
                                id: payload.id,
                                username: payload.username
                            }
                        })
                    } else {
                        await initGame(roomId);
                        gameMap.get(roomId)?.players.push({
                            ws,
                            player: {
                                id: payload.id,
                                username: payload.username
                            }
                        })
                    }

                    const players = gameMap.get(roomId)?.players

                    if (!players) {
                        return
                    }

                    ws.send(JSON.stringify({
                        type: 'players',
                        data: await getPlayerByIds(players.map(p => p.player.id))
                    }))

                    players.forEach(async (p) => {
                        p.ws.send(JSON.stringify({
                            type: 'players',
                            data: await getPlayerByIds(players.map(p => p.player.id))
                        }))
                    })

                } catch (error) {
                    ws.close(4001, 'Unauthorized')
                }
            },
            onMessage: async (event, ws) => {
                const data = JSON.parse(event.data.toString())

                if (!ALL_MESSAGE_TYPES.includes(data.type)) {
                    return
                }

                switch (data.type) {
                    case 'startGame': {
                        await startGame(data, ws)
                        break
                    }
                    case 'move': {
                        const { success, roomId, payload } = await getRoomAndPlayer(ws)

                        if (!success || !roomId || !payload) {
                            return
                        }

                        const players = gameMap.get(roomId)?.players

                        if (!players) {
                            return
                        }

                        const room = gameMap.get(roomId)

                        if (!room) {
                            return
                        }

                        const player = room.players.find(p => p.player.id === payload.id)

                        if (!player) {
                            return
                        }

                        // room.game.movePlayer(player.player, data.data)

                        players.forEach(async (p) => {
                            p.ws.send(JSON.stringify({
                                type: 'move',
                                data: {
                                    player: player.player,
                                    move: data.data
                                }
                            }))
                        })

                        break
                    }
                    default:
                        break
                }
            },
            onClose: async (event, ws) => {
                const { success, roomId, payload } = await getRoomAndPlayer(ws)

                if (!success || !roomId || !payload) {
                    return
                }

                const players = gameMap.get(roomId)?.players

                if (!players) {
                    return
                }

                const index = players.findIndex(p => p.player.id === payload.id)

                if (index === -1) {
                    return
                }

                players.splice(index, 1)

                players.forEach(async (p) => {
                    p.ws.send(JSON.stringify({
                        type: 'players',
                        data: await getPlayerByIds(players.map(p => p.player.id))
                    }))
                })

                if (players.length === 0) {
                    gameMap.delete(roomId)
                }
            },
        }
    })
)

export default {
    gameWS: gameWS,
    websocket: websocket,
};

const startGame = async (data: any, ws: WSContext<ServerWebSocket>) => {
    const { success, roomId, payload } = await getRoomAndPlayer(ws)

    if (!success || !roomId || !payload) {
        return
    }

    const players = gameMap.get(roomId)?.players

    if (!players) {
        return
    }

    if (players[0].player.id !== payload.id) {
        return
    }

    const room = gameMap.get(roomId)

    if (!room) {
        return
    }

    const startPlayers = await db.selectFrom('users').where('id', 'in', players.map(p => p.player.id)).select(['id', 'username']).execute()

    if (!startPlayers || startPlayers.length < 2) {
        return
    }

    startPlayers.forEach(async (p) => {
        room.game.addPlayer(p)
    });

    room.game.startGame()

    players.forEach(async (p) => {
        p.ws.send(JSON.stringify({
            type: 'startGame',
            data: {
                currentPlayer: room.game.getMap().currentPlayer,
            }
        }))
    })
}

const initGame = async (roomId: string) => {
    const room = await db.selectFrom('room_games').where('room_id', '=', roomId).selectAll().executeTakeFirst()
    if (!room || !room.room_id) {
        return
    }

    const game = await db.selectFrom('games').where('id', '=', room.game_id).selectAll().executeTakeFirst()
    if (!game || !game.data) {
        return
    }

    if (typeof game.data !== 'object' || Array.isArray(game.data)) {
        return
    }

    const gameObj: TGameMap = game.data.map as unknown as TGameMap

    const gameObj_ = new Game(null, {
        gameId: game.id,
        gameMap: new GameMap(gameObj.stations, gameObj.players, gameObj.moves),
    })

    gameMap.set(roomId, {
        players: [],
        game: gameObj_
    })
}