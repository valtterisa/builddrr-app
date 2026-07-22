# Contributing to Nebula

Thanks for contributing. This guide covers local setup, how we work, and what makes a good pull request.

## Code of conduct

Participation is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). Be respectful and constructive.

## What to work on

- Bug fixes and documentation improvements are always welcome.
- For larger features or architecture changes, open an issue first so we can align on direction.
- Agent / Cursor guidance lives in [`AGENTS.md`](AGENTS.md) — keep it in sync if you change how generation, Convex, or sandboxes work.

## Prerequisites

- Node.js 20+
- pnpm 10+ (`packageManager` in `package.json`)
- Convex account (cloud deployment recommended)
- Keys for AI Gateway, Box, and Autumn (see [`.env.example`](.env.example))

## Local setup

```bash
git clone https://github.com/valtterisa/builddrr-app.git
cd builddrr-app
pnpm install
cp .env.example .env.local
```

Run two processes:

```bash
pnpm dev:convex   # terminal 1 — writes Convex URL into .env.local
pnpm dev          # terminal 2 — Next.js on :3000
```

Set Convex secrets (see README / `.env.example`):

```bash
npx convex env set ANTHROPIC_API_KEY <key>
npx convex env set BOX_API_KEY <key>
npx convex env set AUTUMN_SECRET_KEY <key>
npx @convex-dev/auth
```

Put `AUTUMN_SECRET_KEY` in `.env.local` as well for the Next.js Autumn route.

## Development workflow

1. Fork the repo (or create a branch if you have write access).
2. Create a branch from `main`: `git checkout -b fix/short-description`.
3. Make focused changes — prefer small PRs over large mixed ones.
4. Run checks before opening a PR:

```bash
pnpm typecheck
```

5. Push and open a pull request against `main`.

## Pull request guidelines

- Describe **why** the change exists, not only what files moved.
- Link related issues.
- Include screenshots or short recordings for UI changes.
- Do not commit secrets (`.env.local`, API keys). `.env.example` should stay placeholder-only.
- Match existing TypeScript style: no drive-by refactors, no uncommented noise (comments only when the author asks or when clarifying non-obvious logic).
- Keep Convex public functions with `args` / `returns` validators and auth checks where they touch user data.

## Project map (where to change things)

| Area | Start here |
| --- | --- |
| Agent / tools | `lib/ai/agent.ts`, `convex/generate.ts` |
| Astro scaffold | `lib/schema/site.ts`, `lib/astro/scaffold.ts` |
| Sandbox preview | `lib/box/client.ts` |
| Auth / users | `convex/auth.ts`, `convex/users.ts` |
| Billing | `convex/autumn.ts`, `autumn.config.ts`, `app/api/autumn/` |
| Chat / workspace UI | `components/workspace/`, `components/ai-elements/` |

## Reporting bugs

Use the [bug report](https://github.com/valtterisa/builddrr-app/issues/new?template=bug_report.yml) template when possible. Include:

- Steps to reproduce
- Expected vs actual behavior
- Browser / OS, and whether Convex + Box were configured
- Relevant logs (redact secrets)

## Security

Report vulnerabilities privately — see [`SECURITY.md`](SECURITY.md).

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
