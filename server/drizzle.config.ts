import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema/',
  out: './drizzle',
  dbCredentials: {
    url: Bun.env.DATABASE_URL,
  },
})
