import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema/',
  out: './drizzle',
  dbCredentials: {
    url: 'postgresql://dev:devPassword@localhost:5432/ultimate_to_do_db',
  },
})
