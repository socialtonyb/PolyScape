# PolyScape

Polymarket-style prediction market using **play GP currency** only (no real money/crypto).

## Stack
- Next.js App Router + TypeScript
- TailwindCSS (shadcn-compatible utility structure)
- NextAuth/Auth.js (Credentials provider for local dev)
- PostgreSQL + Prisma
- Route handlers for API
- In-memory rate limiting utility
- Vitest unit tests

## Environment
Create `.env`:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/polyscape"
NEXTAUTH_SECRET="change-me"
NEXTAUTH_URL="http://localhost:3000"
```

## One-time setup (fully runnable)
```bash
npm install
npm run setup
npm run dev
```

`npm run setup` does:
1. `npm run db:up` (starts DB via Docker if available, otherwise local `initdb/pg_ctl` fallback)
2. `npm run db:migrate`
3. `npm run db:seed`

## Start/stop database manually
```bash
npm run db:up
npm run db:down
```

## Local users (seeded)
- `admin@polyscape.local` / `admin123`
- `user@polyscape.local` / `user123`

## Verify functionality end-to-end
1. Start app:
   ```bash
   npm run dev
   ```
2. Open `http://localhost:3000/markets`.
3. Log in as `user@polyscape.local` and buy/sell on a market.
4. Check wallet and portfolio pages update.
5. Log in as `admin@polyscape.local` and use admin APIs/pages to close/resolve a market.

## Test
```bash
npm test
```

## If DB startup fails
- If Docker is not installed, install PostgreSQL binaries (`initdb`, `pg_ctl`, `psql`) and rerun `npm run db:up`.
- If port `5432` is busy, free the port or set env vars for fallback scripts:
  - `POLYSCAPE_DB_PORT`
  - `POLYSCAPE_PGDATA_DIR`
