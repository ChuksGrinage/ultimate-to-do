import type { Context, Next } from 'hono'

export const isAuth = (c: Context, next: Next) => {
  const session = c.get('session')
  if (!session.get('user')) {
    throw new Error('not authenticated')
    // return c.text('Unauthorized', 401);
  }

  return next()
}
