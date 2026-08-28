# Itar

Lightweight web tool to style and wrap images in customizable Arabic borders using simple parameters. Client-side only — no account, no backend.

- `/` — marketing landing with a live preset gallery. Drop a photo to see it in all four frames; click a card to open the editor.
- `/editor` — the full frame editor. Legacy `/?f=` links forward here.

`pnpm build` generates `dist/og.png` (1200×630 social card) from the Double Rule preset.

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
| `pnpm verify` | Run verification test suites |
| `pnpm typecheck` | Type-check with `tsc --noEmit` |
| `pnpm check` | Biome check |
| `pnpm lint` | Biome lint |
| `pnpm format` | Format with Biome |

## Structure

```text
src/
├── components/
│   ├── layout/          # BaseLayout
│   ├── theme/           # ThemeToggle and ThemeScript
│   └── ui/              # Primitive component library
├── features/
│   ├── frame/           # Frame editor, drop target, image handoff
│   └── landing/         # Marketing gallery and static sections
├── lib/                 # Shared utilities and theme store
├── pages/               # Astro routes
└── styles/              # Design tokens + global CSS
```
