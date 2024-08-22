import { Hono } from 'hono'
import { db } from '../../db'
import { isAuth } from '../../middleware/isAuth'

const taskRoutes = new Hono()

taskRoutes.use('/task/*', isAuth)

taskRoutes.get('/task', async (c) => {
  const { page, pageSize } = c.req.query()
  const data = await db.query.task.findMany({
    orderBy: (tasks, { asc }) => asc(tasks.id),
    limit: Number(pageSize),
    offset: (Number(page) - 1) * Number(pageSize),
  })
  return c.json({ data })
})

export { taskRoutes }
