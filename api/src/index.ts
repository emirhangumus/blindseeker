import { Hono } from 'hono'
import { jwt, type JwtVariables } from 'hono/jwt'
import auth from './routes/auth'
import game from './routes/game'
import gameWS from './routes/game/ws'
import room from './routes/room'
import { JwtPayload } from './types'

type Variables = JwtVariables<JwtPayload>
const app = new Hono<{ Variables: Variables }>()

app.route('/auth', auth)

app.route('/ws', gameWS.gameWS);

app.use(
  jwt({
    secret: Bun.env.JWT_SECRET!,
  })
)

app.route('/game', game)
app.route('/room', room)

export default {
  fetch: app.fetch,
  websocket: gameWS.websocket
}