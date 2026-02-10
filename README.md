# FVG Signals

Ultramodern Next.js dashboard that scans crypto pairs for the “Sweep → Displacement → FVG → Retrace” setup, computes execution plans, and fires alerts.

## Stack
- Next.js (App Router) + TypeScript
- TailwindCSS v4 + custom shadcn-inspired components
- Drizzle ORM + PostgreSQL (Supabase ready)
- Upstash Redis cache (memory fallback)
- Bybit REST/WS market data
- Web Push (VAPID) + Resend email fallback

## Run locally
```bash
corepack pnpm install           # install deps (internet required)
pnpm db:generate                # optional: generate drizzle client
pnpm db:migrate                 # push schema to DATABASE_URL
pnpm db:seed                    # seed pairs + mock user
pnpm dev                        # start http://localhost:3000
```

If the registry is unreachable in your environment, install when online then re-run the commands above.

## Environment
Create `.env.local` from `.env.example`.
```
DATABASE_URL=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
CRON_SECRET=
BYBIT_WS_URL=wss://stream.bybit.com/v5/public/linear
BYBIT_REST_URL=https://api.bybit.com
WEBPUSH_VAPID_PUBLIC_KEY=
WEBPUSH_VAPID_PRIVATE_KEY=
RESEND_API_KEY=
```

## Scripts
- `pnpm dev` – dev server
- `pnpm db:generate` – drizzle-kit generate
- `pnpm db:migrate` – drizzle-kit push
- `pnpm db:seed` – seed pairs + demo user
- `pnpm test` – run engine unit tests (ts)

## Cron / jobs
`vercel.json` includes a sample cron hitting `/api/cron/recompute`. Protect with `CRON_SECRET`.

## Notes
- Premium toggle is a mock stored in localStorage (free: 5 pairs / 60s refresh, premium: 30 pairs / 5s refresh).
- Alerts POST to `/api/alerts`; Web Push + email are no-ops without keys.
- UI intentionally light, neon-accented, table-less, card-first.
