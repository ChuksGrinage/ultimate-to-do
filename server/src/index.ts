import { Hono } from 'hono'
import { CookieStore, Session, sessionMiddleware } from 'hono-sessions'
import { getCookie, setCookie } from 'hono/cookie'
import { generateState, OAuth2Client } from 'oslo/oauth2'

import { eq } from 'drizzle-orm'
import { db } from './db'
import { isAuth } from './middleware/isAuth'
import { account } from './schema'

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
    // TODO: Add to env variavbles
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
app.get('/login/google', async (c) => {
  const googleOAuth2State = generateState()

  const url = await googleOAuth2Client.createAuthorizationURL({
    state: googleOAuth2State,
    scopes: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  })

  console.log(`Redirect url: ${url}`)

  setCookie(c, 'google_oauth2_state', googleOAuth2State, {
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

  console.log(`accessToken: ${access_token}`)

  const authUser = await getGoogleUser(access_token)
  let [accountFromDb] = await db
    .select()
    .from(account)
    .where(eq(account.email, authUser.email))
    .execute()

  if (!accountFromDb) {
    // new user
    ;[accountFromDb] = await db
      .insert(account)
      .values({
        email: authUser.email as string,
        firstName: authUser.given_name,
        lastName: authUser.family_name,
        picture: authUser.picture,
      })
      .returning()
  }

  console.log(`user: ${JSON.stringify(authUser)}`, { accountFromDb })

  // set user information to the session cookie
  const session = c.get('session')
  session.set('user', accountFromDb)

  return c.redirect('/')
})

app.get('/logout', (c) => {
  c.get('session').deleteSession()
  return c.redirect('/')
})

app.get('/ping', (c) => c.json({ data: 'Pong! 🏓' }))

app.use('/task/*', isAuth)

app.get('/task', async (c) => {
  const { page, pageSize } = c.req.query()
  const data = await db.query.task.findMany({
    orderBy: (tasks, { asc }) => asc(tasks.id),
    limit: Number(pageSize),
    offset: (Number(page) - 1) * Number(pageSize),
  })
  return c.json({ data })
})

export default {
  port: process.env.PORT,
  fetch: app.fetch,
}

console.log(`server running at ${process.env.PORT}`)
