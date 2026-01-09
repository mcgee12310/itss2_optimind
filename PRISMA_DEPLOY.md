Neon + Prisma + Vercel — Quick checklist (2025)

✅ Local config
- Create Neon Postgres project and copy `DATABASE_URL` (postgresql://...)
- Add `DATABASE_URL` to local `.env` (DO NOT commit secrets)

✅ Prisma schema
- `prisma/schema.prisma` should use:
  generator client { provider = "prisma-client-js" }
  datasource db { provider = "postgresql" }
- **Do not** keep url in `schema.prisma` (Prisma 7 reads it from `prisma.config.ts`)

✅ `prisma.config.ts` (minimal, no adapters)
- Add `prisma.config.ts` with:
  import "dotenv/config";
  import { defineConfig, env } from "prisma/config";
  export default defineConfig({ schema: "prisma/schema.prisma", datasource: { provider: "postgresql", url: env("DATABASE_URL") }});
- **Do not** add adapters (no `@prisma/adapter-libsql`) — use native Postgres/Neon.

✅ Prisma client (Vercel-friendly)
- Create `lib/prisma.ts` using the global PrismaClient pattern:
  export const prisma = globalForPrisma.prisma ?? new PrismaClient(...)
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
- Do **not** create lazy hacks or proxy adapters;
- For compatibility, you can keep `lib/db.ts` as a tiny re-export of `lib/prisma.ts`.

✅ Dependencies
- Remove `@prisma/adapter-libsql` and `@libsql/client` from dependencies.

✅ Migrate / push
- To push schema to DB locally: `npx prisma db push` (Prisma 7 reads `DATABASE_URL` from `prisma.config.ts`).
- For migrations: `npx prisma migrate dev --name init` (if you need migrations).

✅ Vercel
- Add an environment variable in Vercel project settings: `DATABASE_URL=<Neon URL>`
- Ensure `NODE_ENV=production` on production deploys.

Notes
- If you see validation error P1012 about `url` in `schema.prisma`, move the `url` into `prisma.config.ts` and remove it from the schema.
- Avoid `prisma.config.ts` files that configure adapters or libsql; a minimal `prisma.config.ts` with `url` via `env()` is fine for Prisma 7 and Neon.

If you want, I can also add a short README section in `README.md` and run a final `npx prisma db push` to confirm the DB is reachable from your local environment. ✅