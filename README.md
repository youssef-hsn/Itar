# Itar

Lightweight web tool to style and wrap images in customizable Arabic borders using simple parameters. Client-side only — no account, no backend.

Site: [itar.youssefalhassan.com](https://itar.youssefalhassan.com)

## Stack

Astro + React islands, Tailwind CSS v4, Biome. Feature folders under `src/features/`, design tokens in `src/styles/tokens/`.

## Setup

```sh
pnpm install
pnpm dev
```

## Scripts

| Command | Action |
| --- | --- |
| `pnpm dev` | Dev server |
| `pnpm build` | Production build to `./dist/` |
| `pnpm preview` | Preview the build |
| `pnpm typecheck` | Type-check with `tsc --noEmit` |
| `pnpm check` | Biome check |
| `pnpm format` | Format with Biome |

## Structure

```text
src/
├── components/layout/   # BaseLayout
├── features/wip/        # WIP placeholder surface
├── lib/                 # shared utils
├── pages/               # Astro routes
└── styles/              # tokens + global CSS
```
