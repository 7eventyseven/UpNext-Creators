# UpNext Creators

An app to push, showcase, and book creators — Nigeria's marketplace for photographers, musicians, makeup artists, designers, and more.

## Vision

UpNext Creators connects clients with talented creators across Nigeria. Creators list their services, set prices (with optional discounts), get ranked, and receive bookings. Jos was the launch market; the platform is built to scale to every city.

## Features

- **Creator directory** — ranked, searchable list with state and category filters
- **Service booking** — browse services, see prices (with discounts), and book directly
- **WhatsApp integration** — one-tap contact via WhatsApp on every creator profile
- **Subscription ranking** — creators pay monthly (Pro / Premium) to rank at the top
- **Integrated chat** — direct messaging between clients and creators
- **Creator registration** — creators can register, upload photos/videos, and set service prices
- **Admin panel** — manage creators, bookings, subscriptions, and categories
- **Olive green + milky theme** — warm, earthy palette throughout

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Admin panel

1. Open [http://localhost:3000/admin](http://localhost:3000/admin)
2. Sign in with password: `upnext2024`

From the admin dashboard you can:

- View platform stats
- Add, edit, or delete creators and their services
- Update booking statuses
- Assign Free / Pro / Premium subscription tiers
- Manage service categories

## Tech Stack

- Next.js 15 (App Router)
- React 19
- Tailwind CSS 4
- TypeScript
- Lucide icons

## Project Structure

```
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
