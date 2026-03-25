# Lalooply

> Ask. Answer. Repeat! Human-led data to sink your teeth into.

A survey-based knowledge exchange platform. Users post surveys (costs 1 🪙), others swipe through and answer them (earns 1 🪙). View de-identified responses in your personal dashboard and export them to CSV.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 · TypeScript · React 19 · Tailwind CSS · Framer Motion |
| Backend | Supabase (PostgreSQL · Auth · Row-Level Security) |
| Fonts | Fredoka (headings) · DM Sans (body) |

---

## Getting started

### 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase dashboard and run the full contents of [`supabase/schema.sql`](./supabase/schema.sql).  
   This creates the `profiles`, `surveys`, and `answers` tables, enables Row-Level Security on all three, adds the `adjust_coins` RPC function, and registers a trigger that auto-creates a profile row for every new user.

### 2. Configure environment variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-public-key>
```

Find these values in your Supabase dashboard under **Settings → API**.

### 3. Install dependencies & run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Screens

| Route | Screen | Description |
|---|---|---|
| `/auth/signup` | Sign Up | Email + optional name (defaults to "Anon") + password. Starts with 60 🪙 |
| `/auth/signin` | Sign In | Email / password |
| `/auth/verify` | Verify Email | Prompt to click the Supabase verification link |
| `/swipe` | Swipe Deck | Cards showing the survey AREA. Swipe right to answer, left to pass. Peek 👁️ reveals all questions before deciding |
| `/survey/[id]` | Answer | Open-text answers for each question. Submit earns +1 🪙 |
| `/ask` | Ask | Create a survey: AREA (≤ 3 words) + 1–3 questions (≤ 200 chars each). Costs 1 🪙 |
| `/results` | My Results | All surveys you posted with answer counts. Expand to read de-identified responses. Export to CSV |

---

## Coin economy

| Action | Change |
|---|---|
| New account | +60 🪙 (starting balance) |
| Answer any survey | +1 🪙 |
| Post a survey | −1 🪙 |

All coin mutations go through the `adjust_coins` Postgres function (security definer) — never directly from the client.

---

## Database schema

```
profiles   id · name · coins · created_at
surveys    id · area · questions (jsonb) · asker_id · asker_name · created_at
answers    id · survey_id · responder_id · responder_name · responses (jsonb) · created_at
```

**RLS rules (all tables require authentication)**

- `profiles` — anyone can read; only the owner can insert/update.
- `surveys` — anyone can read; only the asker can insert/update/delete.
- `answers` — anyone can read; only the responder can insert. Unique constraint on `(survey_id, responder_id)`.

---

## Deploying to Vercel

1. Push the repository to GitHub.
2. Import it in [vercel.com](https://vercel.com).
3. Add the two environment variables in **Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. Vercel auto-detects Next.js — no additional config file is needed.

---

## Scripts

```bash
npm run dev     # start development server
npm run build   # production build
npm run start   # serve production build locally
npm run lint    # ESLint (flat config, ESLint 9)
```
