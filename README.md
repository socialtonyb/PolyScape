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

## Features
- LMSR AMM pricing + buy/sell (sell fee = **0%**)
- Admin-only market create/close/resolve + audit log
- Wallet + ledger transactions + positions + trades
- Random events (2% spawn, 6h cooldown, 15m expiry)
- Achievement diary and Prediction skill XP/levels (OSRS-style curve)

## Environment
Create `.env`:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/polyscape"
NEXTAUTH_SECRET="change-me"
NEXTAUTH_URL="http://localhost:3000"
```

## Local run (2-3 commands)
```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Local users after seed:
- `admin@polyscape.local` / `admin123`
- `user@polyscape.local` / `user123`

## API routes
User:
- `GET /api/markets`
- `GET /api/markets/[slug]`
- `POST /api/markets/[id]/buy`
- `POST /api/markets/[id]/sell`
- `GET /api/me/wallet`
- `GET /api/me/positions`
- `GET /api/me/skills`
- `GET /api/me/achievements`
- `POST /api/random-event/claim`

Admin:
- `POST /api/admin/markets`
- `POST /api/admin/markets/[id]/close`
- `POST /api/admin/markets/[id]/resolve`
- `GET /api/admin/audit`

## Test
```bash
npm test
```
