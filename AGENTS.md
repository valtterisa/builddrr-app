# Floras — AI Astro site generator

Floras turns a plain-English prompt into a production-ready Astro site with a live
preview. It is a Next.js 16 (App Router) frontend backed by Convex, generating
sites inside box.ascii.dev sandboxes via an AI SDK agent, with Autumn billing.

## Architecture

- **Frontend:** Next.js App Router + Tailwind v4 (dark, locked theme). Chat UI is
  built with AI SDK Elements (`components/ai-elements/*`). Marketing/app UI is
  composition-first: pages use `MarketingLayout` / `DashboardShell`, shared shells in
  `components/site/*` (`PageHeader`, `Section`, `EmptyState`, `Container`), and
  feature modules in `landing/`, `dashboard/`, `workspace/`, `auth/`. Billing gates
  around composers share `useBillingGates` / `BillingGateModals`.
- **Backend/DB:** Convex (`convex/`). Auth via Convex Auth (password provider).
  Reactive queries drive the chat + preview. Mutations use `authedMutation`
  (`convex/lib/customFunctions.ts`) so only signed-in owners can write.
- **Agent:** AI SDK 7 `ToolLoopAgent` (`lib/ai/agent.ts`) runs from Next.js API
  routes (`app/api/generate`, `lib/generate/run-generation.ts`). Tool activity +
  summaries stream back into Convex tables, so the UI updates reactively.
- **Template:** New Boxes fork the golden Box from `BOX_GOLDEN_BOX_ID` via
  `box.fork({ noEnv: true })`. Without that env: blank create + clone
  `https://github.com/valtterisa/astro-template.git` into `site/`. The agent
  stores a zod `SitePlan` (`lib/schema/site.ts`) then edits the template in place.
- **Sandbox/preview:** `lib/box/client.ts` wraps `@asciidev/box-sdk`. Each project
  gets a Box VM running `astro dev` exposed on a public URL via the in-box `host` command.
  User Boxes are created with `noEnv: true`.
- **Publish / domains:** Next.js routes `app/api/publish` and `app/api/domains`. Build +
  Wrangler Direct Upload run **inside** the Box; Pages project/domain CRUD uses the
  official `cloudflare` SDK. Because Pages has no wildcard custom domains, publish
  also upserts a DNS CNAME for `{id}.floras.app` → the project `*.pages.dev` host.
  Live URL is the floras.app hostname (custom domains optional afterward).
- **Billing:** `autumn-js` via Next.js (`app/api/autumn/[...all]`, `lib/billing/get-access.ts`,
  fail-closed in production; fail-open only when `BILLING_FAIL_OPEN=1` or non-prod) + `autumn.config.ts` plans. Frontend uses `autumn-js/react`.

## Cursor Cloud specific instructions

- **Two dev processes.** Run Convex and Next.js together during development:
  `pnpm dev:convex` (starts `convex dev`, generates `convex/_generated`, pushes
  functions) and `pnpm dev` (Next.js on :3000). Standard scripts live in `package.json`.
- **Convex is required for the app to function.** `NEXT_PUBLIC_CONVEX_URL` and
  `CONVEX_DEPLOYMENT` are written to `.env.local` by `convex dev`. Without a running
  deployment, client queries stay in a loading state.
- **Keep heavy SDKs out of Convex.** AI SDK, Box SDK, and `autumn-js` run in
  Next.js API routes — not Convex actions — so pushes stay under the 64MB
  module-load limit. Do not reintroduce those packages into `convex/`.
- **Secrets for generation/Box/billing/CF live in Next.js `.env.local`:**
  `ANTHROPIC_API_KEY`, `BOX_API_KEY`, `BOX_GOLDEN_BOX_ID`, `AUTUMN_SECRET_KEY`,
  Cloudflare publish vars below. Optional: `AGENT_MODEL` (defaults to
  `claude-sonnet-5`), `BOX_BASE_URL`. New Boxes fork `BOX_GOLDEN_BOX_ID` when set;
  otherwise they clone `https://github.com/valtterisa/astro-template.git`.
- **Cloudflare publish (Next.js `.env.local` / host secrets, not Box dashboard):**
  `CLOUDFLARE_API_TOKEN` (User token: Account → Cloudflare Pages → Edit **and**
  Zone → DNS → Edit on `floras.app`), `CLOUDFLARE_ACCOUNT_ID`, and
  `CLOUDFLARE_ZONE_ID` (floras.app zone). Pages does not support wildcard custom
  domains, so publish upserts a per-site CNAME `{id}.floras.app` → `*.pages.dev`.
  Do **not** put these in Box Dashboard → Secrets — user Boxes are `noEnv` and
  must not receive Floras hosting credentials. Publish injects them into the Box
  only for the Wrangler deploy command, then scrubs the temp file.
- **Convex deployment env** (set with `npx convex env set`): Convex Auth keys via
  `npx @convex-dev/auth` (`JWT_PRIVATE_KEY`, `JWKS`, `SITE_URL`), plus optional
  `AUTH_RESEND_KEY` / `AUTH_EMAIL_FROM` for magic links. Not the Anthropic/Box/CF keys.
- **Autumn pricing:** push plans with `npx atmn push` (config in `autumn.config.ts`).
- **Preview iframes** load the sandbox Astro dev server over `*.on.ascii.dev`; the
  template should set Vite `server.allowedHosts: true` and bind `0.0.0.0` so those
  hosts are not blocked.
- **Typecheck:** `pnpm typecheck` / `next build` both enforce TypeScript. Auth gating
  lives in `proxy.ts` (Next.js 16 network proxy).
- **Busy jobs:** generate/publish use atomic `claimGeneration` / `claimPublish`. Stuck
  busy states auto-reclaim after 15 minutes via `busyAt`, or the owner can call
  `projects.resetBusy`.
