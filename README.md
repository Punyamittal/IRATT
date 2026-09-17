# International Student Registration System

Claymorphism student registration terminal with administrator QR verification.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- **Supabase Postgres** + Prisma
- Iron Session (httpOnly encrypted cookies)
- Zod validation
- QR generation (`qrcode.react`) and camera scanning (`@yudiel/react-qr-scanner`)

## Quick start

1. Create a free project at [supabase.com](https://supabase.com).

2. In the dashboard open **Project Settings → Database**. Copy:

   - **Transaction pooler** URI (port `6543`) → `DATABASE_URL`
   - **Session pooler** URI (port `5432`) → `DIRECT_URL`

3. Put those values in `.env` (see `.env.example`). URL-encode any special characters in the database password.

4. Install, migrate, and seed:

```bash
npm install
npm run setup
npm run dev
```

Docker is not required. Open [http://localhost:3000](http://localhost:3000).

### Default administrator (development)

- Username: `admin`
- Password: `terminal-admin-1984`

Change `ADMIN_SEED_PASSWORD` and `SESSION_SECRET` before any real deployment.

## Demo data

Seed inserts four records named with a `[DEMO]` prefix and registration numbers starting with `DEMO-`.

To skip demo students:

```
SEED_DEMO_DATA=false
```

Then re-seed, or delete `isDemo = true` rows before production.

## Workflow

1. Student submits `/register`.
2. Backend stores the registration and issues an opaque UUID token.
3. Success page shows a QR payload of `REGISTRATION_TOKEN=<uuid>` plus a public registration ID.
4. Admin logs in at `/admin/login`.
5. Admin scans at `/admin/scanner`. The token is looked up server-side.
6. Admin confirms **Add to Working Database**. Duplicates are blocked by a unique constraint on `registration_id`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run setup` | Apply Prisma migrations to Supabase and seed |
| `npm run db:studio` | Prisma Studio |
| `npm run db:reset` | Reset database and re-seed |
| `npm run build` | Production build |

## Production notes

- Serve over HTTPS.
- Replace `SESSION_SECRET` with a long random value.
- Do not ship default admin credentials.
- Set `SEED_DEMO_DATA=false`.
- Keep `DATABASE_URL` and `DIRECT_URL` only on the server.
