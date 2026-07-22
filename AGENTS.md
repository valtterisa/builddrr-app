# Nebula — AI Astro site generator

Nebula turns a plain-English prompt into a production-ready Astro site with a live
preview. It is a Next.js 15 (App Router) frontend backed by Convex, generating
sites inside box.ascii.dev sandboxes via an AI SDK agent, with Autumn billing.

## Architecture

- **Frontend:** Next.js App Router + Tailwind v4 (dark, locked theme). Chat UI is
  built with AI SDK Elements (`components/ai-elements/*`). Marketing/app UI is
  composition-first (`components/site/*`, `components/landing/*`, `components/workspace/*`).
- **Backend/DB:** Convex (`convex/`). Auth via Convex Auth (password provider).
  Reactive queries drive the chat + preview.
- **Agent:** AI SDK v5 `Experimental_Agent` (`lib/ai/agent.ts`) runs inside the
  Convex Node action `convex/generate.ts`. Tool activity + summaries stream back
  into Convex tables, so the UI updates reactively.
- **Output schema:** `lib/schema/site.ts` (zod `SitePlan`) → `lib/astro/scaffold.ts`
  deterministically emits a complete Astro project. No brittle parsing of model text.
- **Sandbox/preview:** `lib/box/client.ts` wraps `@asciidev/box-sdk`. Each project
  gets a Box VM running `astro dev` exposed on a public URL via the in-box `host` command.
- **Billing:** `@useautumn/convex` component for backend gating (`convex/autumn.ts`,
  fail-open) + `autumn.config.ts` plans. Frontend uses `autumn-js/react` via the
  handler route `app/api/autumn/[...all]/route.ts`.

## Cursor Cloud specific instructions

- **Two dev processes.** Run Convex and Next.js together during development:
  `pnpm dev:convex` (starts `convex dev`, generates `convex/_generated`, pushes
  functions) and `pnpm dev` (Next.js on :3000). Standard scripts live in `package.json`.
- **Convex is required for the app to function.** `NEXT_PUBLIC_CONVEX_URL` and
  `CONVEX_DEPLOYMENT` are written to `.env.local` by `convex dev`. Without a running
  deployment, client queries stay in a loading state.
- **`convex/_generated` is committed as an untyped `AnyApi` fallback** so the repo
  builds without a deployment. Running `convex dev` against a real deployment
  regenerates fully-typed versions; frontend Convex calls are intentionally
  cast to `any` where the generated types are the stub.
- **Node action bundle is heavy.** `convex/generate.ts` (`"use node"`) bundles the
  AI SDK + Box SDK. The local anonymous Convex backend (`CONVEX_AGENT_MODE=anonymous`)
  can hit its 64MB module-load limit while pushing this action. Use a real Convex
  cloud deployment (`npx convex dev` logged in) for end-to-end generation.
- **Secrets live in the Convex deployment, not `.env.local`.** Set them with
  `npx convex env set KEY value`: `AI_GATEWAY_API_KEY` (AI SDK Gateway),
  `BOX_API_KEY` (box.ascii.dev), `AUTUMN_SECRET_KEY` (Autumn). Optional:
  `AGENT_MODEL` (defaults to `anthropic/claude-sonnet-4.5`), `BOX_BASE_URL`.
- **Convex Auth keys:** run `npx @convex-dev/auth` once to provision `JWT_PRIVATE_KEY`,
  `JWKS`, and `SITE_URL` in the Convex deployment env.
- **Autumn pricing:** push plans with `npx atmn push` (config in `autumn.config.ts`).
- **Preview iframes** load the sandbox Astro dev server over `*.on.ascii.dev`; the
  scaffolder sets Vite `server.allowedHosts: true` so those hosts are not blocked.
- `next build` ignores type/lint errors (see `next.config.mjs`); run `pnpm typecheck`
  for real type checking.
