# UpNext Creators

Nigeria's creator marketplace — discover, book, and connect with photographers, musicians, makeup artists, designers, and more.

## Features

- **Creator directory** — ranked, searchable list with state and category filters
<<<<<<< HEAD
- **Service booking** — prices, discounts, and booking management
- **WhatsApp + chat** — contact creators and message in-app
- **Creator auth + dashboard** — register, sign in, manage profile
- **Admin panel** — creators, bookings, subscriptions, categories, and editable landing page
- **PostgreSQL backend** — raw SQL + `pg` + Next.js API routes with JWT cookie auth
- **Cloudinary uploads** — profile images and showcase videos via `/api/upload`
=======
- **Service booking** — browse services, see prices (with discounts), and book directly
- **WhatsApp integration** — one-tap contact via WhatsApp on every creator profile
- **Subscription ranking** — creators pay monthly (Pro / Premium) to rank at the top
- **Integrated chat** — direct messaging between clients and creators
- **Creator registration** — creators can register, upload photos/videos, and set service prices
- **Admin panel** — manage creators, bookings, subscriptions, and categories
- **Olive green + milky theme** — warm, earthy palette throughout
>>>>>>> e6fa7f550d4aa5e450cde1035f69549c44600e54

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
| `npm run db:seed` / `db:setup` | Apply schema + seed data |

## Tech stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- PostgreSQL via `pg` (no ORM)
- jose (JWT) + bcryptjs + zod

## Project structure

```
<<<<<<< HEAD
db/              # schema.sql + seed
src/app/api/     # REST API routes
src/app/admin/   # Admin UI (includes Landing CMS)
src/lib/         # pg pool, SQL repository, auth, API client
```
=======
src/
  app/           # Pages (home, creator profile, chat, bookings, admin, auth)
  components/    # Reusable UI components
  data/          # Seed creator data
  lib/           # Auth, storage helpers (bookings, chat, creators)
  types/         # TypeScript interfaces
```

## Next Steps

- Connect a real database (Supabase, Firebase, or PostgreSQL)
- Add payment integration (Paystack / Flutterwave for Nigerian subscriptions)
- Real-time chat with WebSockets or a service like Pusher
- Expand beyond browser localStorage for production
>>>>>>> e6fa7f550d4aa5e450cde1035f69549c44600e54
