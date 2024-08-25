import { Hono } from 'hono'
import { Session } from 'hono-sessions'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { generateState, OAuth2Client } from 'oslo/oauth2'

import { eq } from 'drizzle-orm'
import {
  CLIENT_URL,
  GOOGLE_OAUTH2_STATE_COOKIE_NAME,
  NEXT_PAGE_SESSION_KEY,
} from '../../constants'
import { db } from '../../db'
import { account, type Account } from '../../schema'

const authRoutes = new Hono<{
  Variables: {
    session: Session
    // session_key_rotation: boolean
  }
}>()

authRoutes.use('/*')

const googleOAuth2Client = new OAuth2Client(
  Bun.env.GOOGLE_CLIENT_ID,
  'https://accounts.google.com/o/oauth2/v2/auth',
  'https://oauth2.googleapis.com/token',
  {
    // TODO: Add to env variables
    redirectURI: `${process.env.SERVER_URL}/login/google/callback`,
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

authRoutes
  .get('/login/google', async (c) => {
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
  .get('/login/google/callback', async (c) => {
    const { state, code } = c.req.query()
    const googleOAuth2State = getCookie(c, GOOGLE_OAUTH2_STATE_COOKIE_NAME)

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

    // set user information to the session cookie
    const session = c.get('session')
    session.set('user', dbAccount)
    const nextPage = session.get(NEXT_PAGE_SESSION_KEY)

    return c.redirect(CLIENT_URL + nextPage)
  })
  .get('/logout', async (c) => {
    c.get('session').deleteSession()
    deleteCookie(c, GOOGLE_OAUTH2_STATE_COOKIE_NAME)

    return c.redirect(CLIENT_URL)
  })
  .get('/me', async (c) => {
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

export { authRoutes }
