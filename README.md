# UpNext Creators

Nigeria's creator marketplace — discover, book, and connect with photographers, musicians, makeup artists, designers, and more.

## Features

- **Creator directory** — ranked, searchable list with state and category filters
- **Service booking** — prices, discounts, and booking management
- **WhatsApp contact** — reach creators directly on WhatsApp
- **Progressive Web App** — installable on Android, iOS, Windows, and desktop Chromium
- **Creator auth + dashboard** — register, sign in, manage profile
- **Admin panel** — creators, bookings, subscriptions, categories, and editable landing page
- **PostgreSQL backend** — raw SQL + `pg` + Next.js API routes with JWT cookie auth
- **Cloudinary uploads** — profile images and showcase videos via `/api/upload`

## Setup

1. Copy env and install deps:

```bash
cp .env.example .env
npm install
```

2. Start PostgreSQL (or point `DATABASE_URL` at any Postgres instance):

```bash
docker compose up -d
```

3. Apply schema + seed data:

```bash
npm run db:setup
```

This runs `db/schema.sql` and seeds admin, categories, creators, and landing content.

4. Run the app:

```bash
npm run dev
```

- Site: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin](http://localhost:3000/admin) — `nungseplangnan@gmail.com` / `William`
- Landing editor: [http://localhost:3000/admin/landing](http://localhost:3000/admin/landing)

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Next.js dev server |
| `npm run db:schema` | Apply `db/schema.sql` only |
| `npm run pwa:icons` | Regenerate PWA icons, splash screens, screenshots |
| `npm run build` | Production build (includes service worker) |

## Tech stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- PostgreSQL via `pg` (no ORM)
- jose (JWT) + bcryptjs + zod

## Project structure

```
db/              # schema.sql + seed
src/app/api/     # REST API routes
src/app/admin/   # Admin UI (includes Landing CMS)
src/lib/         # pg pool, SQL repository, auth, API client
```
