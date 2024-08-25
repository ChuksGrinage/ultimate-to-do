import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import type { Session } from 'hono-sessions'
import { z } from 'zod'
import { db } from '../../db'
import { isAuth } from '../../middleware/isAuth'
import { account } from '../../schema'

const userRoutes = new Hono<{
  Variables: {
    session: Session
    // session_key_rotation: boolean
  }
}>()

userRoutes.use('/user/*', isAuth)

const userSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
})

userRoutes.patch(
  '/:id',
  // zValidator(
  //   'json',
  //   z.object({
  //     firstName: z.string().optional(),
  //     lastName: z.string().optional(),
  //   })
  // ),
  async (c) => {
    const id = c.req.param('id')
    const body = userSchema.safeParse(await c.req.json())
    if (!body.success) {
      return c.json({ error: body.error })
    }
    const [updateUser] = await db
      .update(account)
      .set(body.data)
      .where(eq(account.id, Number(id)))
      .returning()

    return c.json(updateUser)
  }
)

export { userRoutes }
