import { db } from 'db'
import { user } from 'schema'

const server = Bun.serve({
  port: process.env.PORT,
  async fetch(req, res) {
    const { pathname } = new URL(req.url)
    const { method } = req
    if (pathname === '/') {
      return new Response('Home page!')
    }

    if (pathname === '/ping') {
      return new Response('Pong! 🏓')
    }

    if (pathname === '/user') {
      if (method === 'POST') {
        const body = await req.json()
        if ('name' in body) {
          const [newUser] = await db
            .insert(user)
            .values({
              name: body.name,
            })
            .returning()
          return new Response(`New user created: ${newUser?.name}`)
        }
      }
    }

    if (pathname === '/task') {
      if (method === 'POST') {
      }
    }

    return new Response('404', { status: 404 })
  },
})

console.log(`Server started on port ${server.port} 🚀`)
