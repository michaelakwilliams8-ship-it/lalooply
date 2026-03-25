# Copilot Instructions

## Project Overview

Lalooply is a **Next.js** web application built with **React**, **TypeScript**, **Supabase**, **Tailwind CSS**, and **Framer Motion**.

## Tech Stack

- **Framework**: Next.js (App Router, `app/` directory)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database / Auth**: Supabase (`@supabase/supabase-js`)
- **Animations**: Framer Motion
- **Package Manager**: npm

## Project Structure

```
app/          # Next.js App Router pages and layouts
.env.local    # Local environment variables (never commit secrets)
tailwind.config.ts
tsconfig.json
package.json
```

## Coding Conventions

- Use **TypeScript** for all new files. Avoid `any`; prefer explicit types and interfaces.
- Use **functional React components** with hooks. Do not use class components.
- Style components exclusively with **Tailwind CSS** utility classes. Avoid inline styles or separate CSS files unless absolutely necessary.
- Use **Framer Motion** for animations and transitions.
- Interact with the database exclusively via the **Supabase client** (`@supabase/supabase-js`). Never expose service-role keys on the client side.
- Keep environment variables in `.env.local` and prefix client-side variables with `NEXT_PUBLIC_`.
- Follow the **Next.js App Router** conventions: co-locate `page.tsx`, `layout.tsx`, `loading.tsx`, and `error.tsx` within the relevant `app/` subdirectory.
- Prefer **named exports** for components; use default exports only for page and layout files where Next.js requires them.

## Build & Development

```bash
npm install          # Install dependencies
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
```

## Testing

There is currently no test suite configured. When adding tests, use **Jest** with **React Testing Library** consistent with the Next.js testing documentation.

## Security

- Never commit `.env.local` or any file containing secrets/API keys.
- Always validate and sanitize user input before passing it to Supabase queries.
- Use Row Level Security (RLS) policies in Supabase to protect data.
