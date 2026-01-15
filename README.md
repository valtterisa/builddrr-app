## Landing page
<img width="2880" height="10114" alt="image" src="https://github.com/user-attachments/assets/45ab34e7-7adb-46d3-b749-e2c2660eb556" />

## Dashboard
<img width="1440" height="786" alt="Näyttökuva 2026-01-15 kello 12 38 17" src="https://github.com/user-attachments/assets/f6bb71d9-9efd-4b24-8c8b-6c38c083db04" />

## Editor

<img width="1440" height="786" alt="Näyttökuva 2026-01-15 kello 12 59 42" src="https://github.com/user-attachments/assets/8db64823-a874-479c-ae27-61a41b08ebd1" />


## Builddrr

> **Status: Archived** – This repository is no longer under active development. The code and documentation are kept for reference and inspiration, but features, dependencies, and infrastructure may be out of date.

> **Builddrr** is an AI-powered landing page builder that turns plain-English product ideas into **production-ready, high‑converting marketing sites**. It combines a rich visual editor, smart sections, and one‑click deploys so you can go from idea to live site in minutes instead of days.

---

### Contents

- [Builddrr](#builddrr)
  - [Why Builddrr](#why-builddrr)
  - [Feature overview](#feature-overview)
  - [Tech stack](#tech-stack)
  - [Quickstart](#quickstart)
  - [Architecture](#architecture)
  - [Key folders](#key-folders)
  - [Contributing](#contributing)

---

### Why Builddrr

Builddrr is designed for founders, marketers, and product teams who want **fast iteration** without sacrificing code quality.

- **AI-first workflow**: Describe your product and audience; Builddrr generates page structure, copy, and sections tailored to your use case.
- **Visual editor**: Drag, reorder, and tweak sections with instant preview instead of wrestling with code or templates.
- **Built for iteration**: Quickly adjust headlines, CTAs, and layouts to test new angles without touching your codebase.
- **Production-grade output**: Clean Next.js pages with sensible structure, SEO-friendly markup, and responsive design.
- **Integrated analytics & usage tracking**: Understand how your AI usage and features are being consumed across plans.

> **Use case examples**
>
> - Launch a new SaaS landing page in an afternoon.
> - Spin up variations of your pricing page for A/B testing.
> - Hand developers production-ready code instead of screenshots.

---

### Feature overview

#### Core product features

- **Dashboard**
  - Manage projects, see recent edits, and jump back into any landing page.
  - Surface AI usage and project activity at a glance.

- **Section library**
  - Hero, features, pricing, FAQs, testimonials, and more – all generated and then fully editable.
  - Opinionated defaults so pages look good out of the box.

- **AI editing**
  - Regenerate or refine individual sections and copy with contextual AI prompts.
  - Keep human control while letting AI handle first drafts and variations.

- **Deploy-ready output**
  - Built on Next.js and TypeScript, ready to deploy to platforms like Vercel.
  - SEO-friendly structure and responsive layouts baked in.

- **Team & billing aware**
  - Hooks into Supabase/Polar for plans, limits, and usage when configured.
  - Enables usage-based features and paywalls if you wire them up.

#### Developer-centric benefits

| Area                | What you get                                                                    |
| ------------------- | ------------------------------------------------------------------------------- |
| **DX**              | Type-safe APIs, modular components, clear separation between editor and AI     |
| **Performance**     | Next.js App Router, streaming AI responses, modern React patterns              |
| **Extensibility**   | Pluggable AI backends and prompts in `lib/ai`, flexible section/component model |
| **Maintainability** | Strong typing, cohesive folder structure, and focused domain boundaries        |

---

### Tech stack

- **Frontend**
  - Next.js App Router
  - React + TypeScript
  - Tailwind CSS + custom UI components

- **Backend & data**
  - Supabase (auth, database)
  - Redis-based rate limiting and usage tracking

- **Payments & billing**
  - Polar.sh + Stripe integration for subscriptions and usage-based features

- **AI**
  - Pluggable AI layer (see `lib/ai/*`) for chat, generation, and editing flows

---

### Quickstart

#### 1. Install dependencies

```bash
pnpm install
```

#### 2. Configure environment

Create a `.env.local` file in the project root and configure at least your Supabase and auth-related variables. You can also enable billing/usage tracking:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Polar / billing (optional, for paid plans & usage-based features)
POLAR_API_KEY=your_polar_api_key_here
NEXT_PUBLIC_POLAR_API_URL=https://api.polar.sh
```

If you are wiring this into a full billing setup, also make sure your Stripe/Polar settings match what’s in `lib/stripe.ts` and `lib/polar.ts`.

#### 3. Run the dev server

```bash
pnpm dev
```

Then open `http://localhost:3000` and start creating landing pages.

> **Tip**
>
> You can explore the main in-app experience at the dashboard route under `app/(app)/dashboard` once you have auth and Supabase wired up.

---

### Architecture

At a high level, Builddrr coordinates:

```text
User action → AI layer (content & structure) → Editor + Preview UI → Deploy / Export
         ↓             ↓                           ↓
   Auth & teams   Usage tracking            Billing & limits
    (Supabase)   (Supabase + Redis)     (Polar.sh / Stripe integration)
```

From a code perspective, the flow looks like this:

1. **User initiates an action** (e.g. create page, refine section) from the dashboard/editor.
2. **API routes in `app/api/*`** orchestrate AI calls, apply business rules, and update Supabase.
3. **Editor state** is managed in the client (see `lib/editor-store.ts` and `components/editor/*`).
4. **Usage and billing hooks** (Supabase, Polar, Stripe) track consumption and enforce plan limits when configured.

---

### Key folders

- `app/(app)/dashboard/*` – main app flows and dashboard UI.
- `components/editor/*` – page editor, sections, and preview components.
- `components/landing-page/*` – marketing site sections and templates.
- `lib/ai/*` – AI prompts, orchestration, and streaming logic.
- `app/api/*` – backend endpoints for chat, generation, deploys, and usage.

---

### Contributing

This project is **archived** and not under active development. Pull requests and new feature ideas are generally **not accepted**.

You are welcome to:

- Fork the repository and adapt it for your own projects.
- Use the architecture, editor patterns, and AI flows as inspiration.

If you do open an issue or PR, please understand that maintainers may not respond or review changes in a timely manner, if at all.
