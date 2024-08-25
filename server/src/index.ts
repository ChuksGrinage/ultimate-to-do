import { Hono } from 'hono'
import { CookieStore, Session, sessionMiddleware } from 'hono-sessions'

import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { CLIENT_URL } from './constants'
import { authRoutes, taskRoutes, userRoutes } from './routes'

const app = new Hono<{
  Variables: {
    session: Session
    // session_key_rotation: boolean
  }
}>()

const store = new CookieStore()

app.use('*', logger())

app.use(
  '*',
  sessionMiddleware({
    store,
    encryptionKey: Bun.env.SESSION_ENCRYPTION_KEY,
    expireAfterSeconds: 900,
    cookieOptions: {
      path: '/',
      httpOnly: true,
    },
  })
)

app.use(
  '*',
  cors({
    origin: CLIENT_URL,
    allowHeaders: ['*'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    exposeHeaders: ['*'],
    maxAge: 600,
    credentials: true,
  })
)

app.get('/ping', (c) => c.json({ data: 'Pong! 🏓' }))

app.route('/', authRoutes)
app.route('/user', userRoutes)
app.route('/task', taskRoutes)

export default {
  port: process.env.PORT,
  fetch: app.fetch,
}

console.log(`server running at ${process.env.PORT}`)
