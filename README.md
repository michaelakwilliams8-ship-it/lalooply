# Lalooply

Lalooply is a **Next.js** web application built with React, TypeScript, Supabase, Tailwind CSS, and Framer Motion.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database / Auth**: [Supabase](https://supabase.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Deployment**: [Vercel](https://vercel.com/)

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.local` and fill in your Supabase project credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

## Project Structure

```
app/
  layout.tsx    # Root layout (html + body shell, Tailwind globals)
  page.tsx      # Home page
  globals.css   # Tailwind base/components/utilities
.github/
  copilot-instructions.md   # GitHub Copilot agent context
package.json
tailwind.config.ts
tsconfig.json
next.config.js
```

## Deployment

The app is deployed on **Vercel**. Any push to the `main` branch triggers an automatic deployment.

Make sure the following environment variables are set in your Vercel project settings:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Security

- Never commit `.env.local` with real credentials.
- All Supabase tables should have Row Level Security (RLS) enabled.
- Only use the `ANON` key on the client side; keep the service-role key server-side only.
