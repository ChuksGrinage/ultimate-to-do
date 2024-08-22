import { Hono } from 'hono'
import { CookieStore, Session, sessionMiddleware } from 'hono-sessions'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { generateState, OAuth2Client } from 'oslo/oauth2'

import { eq } from 'drizzle-orm'
import { cors } from 'hono/cors'
import { db } from './db'
import { taskRoutes } from './routes'
import { account, type Account } from './schema'

const CLIENT_URL = Bun.env.CLIENT_URL

const NEXT_PAGE_SESSION_KEY = 'nextPage'
const GOOGLE_OAUTH2_STATE_COOKIE_NAME = 'google_oauth2_state'

const app = new Hono<{
  Variables: {
    session: Session
    // session_key_rotation: boolean
  }
}>()

const store = new CookieStore()

const googleOAuth2Client = new OAuth2Client(
  Bun.env.GOOGLE_CLIENT_ID,
  'https://accounts.google.com/o/oauth2/v2/auth',
  'https://oauth2.googleapis.com/token',
  {
    // TODO: Add to env variables
    redirectURI: 'http://localhost:8080/login/google/callback',
  }
)

const getGoogleUser = async (accessToken: string) => {
  const response = await fetch(
    'https://www.googleapis.com/oauth2/v3/userinfo',
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )
  return await response.json()
}

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
    allowMethods: ['*'],
    exposeHeaders: ['*'],
    maxAge: 600,
    credentials: true,
  })
)

app.get('/login/google', async (c) => {
  const googleOAuth2State = generateState()
  const nextPage = c.req.query('next')
  const session = c.get('session')
  session.set(NEXT_PAGE_SESSION_KEY, nextPage)

  const url = await googleOAuth2Client.createAuthorizationURL({
    state: googleOAuth2State,
    scopes: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  })

  // console.log(`Redirect url: ${url}`)

  setCookie(c, GOOGLE_OAUTH2_STATE_COOKIE_NAME, googleOAuth2State, {
    httpOnly: true,
    secure: false, // `true` for production
    path: '/',
    maxAge: 60 * 60,
  })

  return c.redirect(url.toString() + '&prompt=select_account')
})

app.get('/login/google/callback', async (c, next) => {
  const { state, code } = c.req.query()
  const googleOAuth2State = getCookie(c, 'google_oauth2_state')

  if (!googleOAuth2State || !state || googleOAuth2State !== state) {
    return c.status(400)
  }

  const { access_token } = await googleOAuth2Client.validateAuthorizationCode(
    code,
    {
      credentials: Bun.env.GOOGLE_CLIENT_SECRET,
      authenticateWith: 'request_body',
    }
  )

  // console.log(`accessToken: ${access_token}`)

  const authUser = await getGoogleUser(access_token)
  let [dbAccount] = await db
    .select()
    .from(account)
    .where(eq(account.email, authUser.email))
    .execute()

  if (!dbAccount) {
    // new user
    ;[dbAccount] = await db
      .insert(account)
      .values({
        email: authUser.email as string,
        firstName: authUser.given_name,
        lastName: authUser.family_name,
        picture: authUser.picture,
      })
      .returning()
  }

  // console.log(`user: ${JSON.stringify(authUser)}`, { accountFromDb: dbAccount })

  // set user information to the session cookie
  const session = c.get('session')
  session.set('user', dbAccount)
  const nextPage = session.get(NEXT_PAGE_SESSION_KEY)

  return c.redirect(CLIENT_URL + nextPage)
})

app.get('/logout', async (c) => {
  deleteCookie(c, GOOGLE_OAUTH2_STATE_COOKIE_NAME)

  return c.redirect(CLIENT_URL)
})

app.get('/me', async (c) => {
  const session = c.get('session')
  const user = session.get('user') as Account

  if (!user) {
    return c.text('Unauthorized', 401)
  }

  const [dbAccount] = await db
    .select()
    .from(account)
    .where(eq(account.email, user.email))
    .execute()

  return c.json(dbAccount)
})

app.get('/ping', (c) => c.json({ data: 'Pong! 🏓' }))

app.route('/task', taskRoutes)

export default {
  port: process.env.PORT,
  fetch: app.fetch,
}

console.log(`server running at ${process.env.PORT}`)
