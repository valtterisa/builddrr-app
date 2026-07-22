# Floras

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![Convex](https://img.shields.io/badge/Backend-Convex-orange)](https://convex.dev/)

<p align="center">
  <img src="public/og-image.png" alt="Floras — chat with AI to create your website" width="720" />
</p>

**Floras** turns a plain-English prompt into a production-ready [Astro](https://astro.build/) site with a live preview.

It is a Next.js 16 (App Router) frontend backed by [Convex](https://www.convex.dev/), generating sites inside [box.ascii.dev](https://box.ascii.dev) sandboxes via an [AI SDK](https://ai-sdk.dev/) agent, with [Autumn](https://useautumn.com/) billing.

## Features

- **Prompt → Astro site** — Describe the site; an agent plans and scaffolds a full Astro project
- **Live sandbox preview** — Each project runs `astro dev` in a Box VM on a public URL
- **Structured output** — Zod `SitePlan` drives a deterministic scaffolder (no brittle parsing of model text)
- **Reactive chat UI** — Tool activity and summaries stream into Convex; the UI updates live
- **Auth + billing** — Convex Auth (password) and Autumn usage gating

## Table of contents

- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quickstart](#quickstart)
- [Environment variables](#environment-variables)
- [Development notes](#development-notes)
- [Project structure](#project-structure)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)

## Tech stack

| Layer | Stack |
| --- | --- |
| Frontend | Next.js 16 App Router, Tailwind v4, AI SDK Elements |
| Backend / DB | Convex + Convex Auth (password) |
| Agent | AI SDK 7 `ToolLoopAgent` in a Convex Node action |
| Output | Zod `SitePlan` → deterministic Astro scaffold |
| Preview | box.ascii.dev VMs running `astro dev` |
| Billing | Autumn (`@useautumn/convex` + `autumn-js`) |

## Architecture

```text
Prompt → Convex generate action → AI agent (plan + tools)
                ↓                        ↓
         SitePlan (zod)          Box sandbox (astro dev)
                ↓                        ↓
      scaffold Astro project      public preview URL
                ↓                        ↓
         Convex tables  ←── reactive UI (chat + iframe)
```

- **Frontend:** Chat UI via `components/ai-elements/*`. Pages compose `MarketingLayout` / `AppLayout` with feature modules in `landing/`, `dashboard/`, `workspace/`, and shared shells in `site/`.
- **Backend:** Convex (`convex/`). Reactive queries drive chat + preview.
- **Agent:** `lib/ai/agent.ts` runs inside `convex/generate.ts`. Tool activity and summaries stream into Convex tables.
- **Output schema:** `lib/schema/site.ts` → `lib/astro/scaffold.ts` emits a full Astro project.
- **Sandbox:** `lib/box/client.ts` wraps `@asciidev/box-sdk`. Preview URLs use `*.on.ascii.dev`.
- **Billing:** `@useautumn/convex` in `convex/autumn.ts` (fail-open) + plans in `autumn.config.ts`. Frontend via `autumn-js/react` and `app/api/autumn/[...all]/route.ts`.

Agent-oriented notes for Cursor / coding agents live in [`AGENTS.md`](AGENTS.md).

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io/) 10+
- A [Convex](https://www.convex.dev/) account (cloud deployment recommended for generation)
- API keys for Anthropic, Box, and Autumn (see [`.env.example`](.env.example))

## Quickstart

### 1. Clone and install

```bash
git clone https://github.com/valtterisa/builddrr-app.git
cd builddrr-app
pnpm install
```

### 2. Environment

```bash
cp .env.example .env.local
```

Start Convex (writes `NEXT_PUBLIC_CONVEX_URL` and `CONVEX_DEPLOYMENT` into `.env.local`):

```bash
pnpm dev:convex
```

In another terminal, set Convex secrets:

```bash
npx convex env set ANTHROPIC_API_KEY <key>
npx convex env set BOX_API_KEY <key>
npx convex env set AUTUMN_SECRET_KEY <key>
```

Also put `AUTUMN_SECRET_KEY` in `.env.local` for the Next.js Autumn API route.

Provision Convex Auth once:

```bash
npx @convex-dev/auth
```

Push Autumn plans (optional for local billing UI):

```bash
npx atmn push
```

### 3. Run

Keep Convex running, then:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Without a running Convex deployment, client queries stay in a loading state.

## Environment variables

Full reference: [`.env.example`](.env.example).

**Next.js (`.env.local`)**

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_CONVEX_URL` | Convex client URL (from `convex dev`) |
| `CONVEX_DEPLOYMENT` | Deployment name (from `convex dev`) |
| `AUTUMN_SECRET_KEY` | Autumn handler on the Next.js side |

**Convex deployment** (`npx convex env set …`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | yes | Anthropic API |
| `BOX_API_KEY` | yes | box.ascii.dev sandboxes |
| `AUTUMN_SECRET_KEY` | yes | Billing / usage gating |
| `AGENT_MODEL` | no | Defaults to `claude-sonnet-4-5` |
| `BOX_BASE_URL` | no | Defaults to `https://ascii.dev/api/box/v1` |
| `JWT_PRIVATE_KEY` / `JWKS` / `SITE_URL` | yes | Via `npx @convex-dev/auth` |

## Development notes

- **`convex/_generated`** is committed as an untyped `AnyApi` fallback so the repo builds without a deployment. Running `convex dev` against a real deployment regenerates fully typed APIs.
- **Heavy Node action:** `convex/generate.ts` bundles the AI SDK + Box SDK. The anonymous local backend (`CONVEX_AGENT_MODE=anonymous`) can hit the 64MB module-load limit. Prefer a real Convex cloud deployment for end-to-end generation.
- **Preview hosts:** Sandbox Astro servers load over `*.on.ascii.dev`; the scaffolder sets Vite `server.allowedHosts: true`.
- **Typecheck:** `next build` ignores type errors (`next.config.mjs`). Use `pnpm typecheck` for real checking. Auth gating is in `proxy.ts`.

## Project structure

| Path | Role |
| --- | --- |
| `app/` | Next.js App Router (marketing, auth, workspace, Autumn API) |
| `components/ai-elements/` | Chat UI primitives |
| `components/site/` | Layouts, PageHeader, Section, EmptyState, Container, nav/footer |
| `components/landing/` | Landing sections |
| `components/dashboard/` | Dashboard prompt + project grid/cards |
| `components/workspace/` | Workspace header, chat, preview |
| `components/auth/` | Sign-in form + auth modal |
| `convex/` | Schema, auth, generate action, Autumn, projects/messages |
| `lib/ai/` | Agent + design guidelines |
| `lib/schema/` | Zod `SitePlan` |
| `lib/astro/` | Deterministic Astro scaffolder |
| `lib/box/` | box.ascii.dev client |
| `autumn.config.ts` | Autumn plans |

## Scripts

```bash
pnpm dev          # Next.js (Turbopack) on :3000
pnpm dev:convex   # Convex backend
pnpm build        # Production build
pnpm typecheck    # tsc --noEmit
```

## Contributing

Contributions are welcome. See [`CONTRIBUTING.md`](CONTRIBUTING.md) for setup, branch workflow, and PR expectations. Please also read the [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).

## Security

Do not open public issues for vulnerabilities. See [`SECURITY.md`](SECURITY.md).

## License

MIT — see [`LICENSE`](LICENSE).
