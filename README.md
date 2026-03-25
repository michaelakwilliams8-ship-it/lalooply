# Lalooply 🌀

**Lalooply** is a creative loop-sharing platform built with Next.js, TypeScript, Tailwind CSS, Framer Motion, and Supabase. Share short bursts of inspiration, like others' loops, and watch ideas resonate.

## Features

- 🌀 **Loop feed** – Browse and like short creative posts
- ✍️ **Create loops** – Post your own loops with tags
- 🔐 **Authentication** – Sign up / sign in via Supabase Auth
- 📱 **PWA** – Installable on Android and iOS home screens
- 🎨 **Animations** – Smooth transitions powered by Framer Motion
- 📱 **Responsive** – Mobile-first design

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- A [Supabase](https://supabase.com) project (optional for demo mode)

### Installation

```bash
git clone https://github.com/michaelakwilliams8-ship-it/lalooply
cd lalooply
npm install
```

### Environment variables

Copy the example and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> **Note:** If these variables are not set, the app runs in demo mode with sample data.

### Supabase database setup

Run the following SQL in your Supabase SQL editor:

```sql
-- Loops table
create table loops (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  content text not null check (char_length(content) <= 280),
  tags text[] default '{}',
  likes_count integer default 0 not null,
  author_name text,
  author_avatar text,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table loops enable row level security;

-- Public read
create policy "Anyone can read loops"
  on loops for select using (true);

-- Authenticated users can insert their own loops
create policy "Users can insert their own loops"
  on loops for insert with check (auth.uid() = user_id);

-- Likes increment function
create or replace function increment_loop_likes(loop_id uuid)
returns void language plpgsql security definer as $$
begin
  update loops set likes_count = likes_count + 1 where id = loop_id;
end;
$$;
```

### Development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
npm run build
npm start
```

---

## Deployment

### Vercel (recommended)

1. Push your code to GitHub.
2. Go to [vercel.com](https://vercel.com) and import the repository.
3. Add the environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy.

---

## Progressive Web App (PWA)

Lalooply includes a `public/manifest.json` and PWA meta tags so it can be installed on mobile devices.

### Android (Google Play Store)

To publish on Google Play:

1. Generate PWA icons (192×192 and 512×512 PNG) and place them in `public/icons/`.
2. Use [PWABuilder](https://www.pwabuilder.com/) to wrap the deployed URL into an Android App Bundle (AAB).
3. Create a [Google Play Console](https://play.google.com/console/) account ($25 one-time fee).
4. Upload the AAB, fill in store listing details, and submit for review.

### iOS (Apple App Store)

To publish on the App Store:

1. Join the [Apple Developer Program](https://developer.apple.com/programs/) ($99/year).
2. Use [PWABuilder](https://www.pwabuilder.com/) to generate an Xcode project from the deployed URL.
3. Open the project in Xcode on a Mac, configure signing, and archive.
4. Upload to [App Store Connect](https://appstoreconnect.apple.com/) and submit for review.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Backend / Auth | Supabase |
| Deployment | Vercel |

---

## License

MIT
