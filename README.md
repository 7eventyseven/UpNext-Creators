# UpNext Creators

An app to push, showcase, and book creators on the Jos Plateau.

## Features

- **Creator directory** — ranked list of photographers, musicians, makeup artists, designers, and more
- **Service booking** — browse services, see prices (with discounts), and book directly
- **WhatsApp integration** — one-tap contact via WhatsApp on every creator profile
- **Subscription ranking** — creators pay monthly (Pro / Premium) to rank at the top
- **Integrated chat** — direct messaging between clients and creators
- **Olive green + milky theme** — warm, earthy palette throughout

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- Next.js 15 (App Router)
- React 19
- Tailwind CSS 4
- TypeScript
- Lucide icons

## Project Structure

```
src/
  app/           # Pages (home, creator profile, chat, bookings, subscribe)
  components/    # Reusable UI components
  data/          # Mock creator data
  lib/           # Local storage helpers (bookings, chat)
  types/         # TypeScript interfaces
```

## Next Steps

- Connect a real database (Supabase, Firebase, or PostgreSQL)
- Add payment integration (Paystack / Flutterwave for Nigerian subscriptions)
- Real-time chat with WebSockets or a service like Pusher
- Creator authentication and dashboard
- Admin panel for managing listings
