## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Stack

- Astro app shell (`src/pages/` for routes)
- React islands for interactive feature UI (`@astrojs/react`)
- Tailwind CSS v4 via `@tailwindcss/vite`
- Biome for format/lint
- Path alias `#/*` → `src/*`

## Project structure

```text
src/
  styles/
    tokens/          # OKLCH color, type, spacing tokens
    global.css       # Tailwind + @theme bridge
  lib/
    utils.ts         # cn()
    theme.ts         # pure theme store + subscriber
  components/
    layout/          # shared Astro layouts
    theme/           # ThemeToggle and ThemeScript
    ui/              # shadcn primitives (retuned)
  features/
    <feature>/
      components/    # feature UI (React)
      pages/         # feature page modules (optional)
  pages/             # Astro routes
```

Group by feature, not by layer. No barrel files — import from source paths.

## shadcn Normalization Pass

Every `pnpm dlx shadcn@latest add <name>` or added primitive is followed by this five-part normalization pass on the generated file:

1. **Imports** — rewrite to the repo convention: `from '@/lib/utils'` → `from '#/lib/utils.ts'`, `from '@/components/ui/x'` → `from '#/components/ui/x.tsx'`.
2. **Exports** — convert `function Button({…})` to `export const Button = ({…}: ButtonProps) => {…}`.
3. **Focus** — delete every `focus-visible:ring-*`, `focus-visible:border-ring`, `focus-visible:outline-*`, `ring-offset-*` class. The global `:focus-visible` box-shadow is the only ring.
4. **Shadows** — delete every `shadow-xs` / `shadow-sm` / `shadow-md`.
5. **Motion** — delete every `animate-in`, `animate-out`, `fade-in-*`, `fade-out-*`, `zoom-in-*`, `zoom-out-*`, `slide-in-from-*`, `slide-out-to-*` class. Where a transition is genuinely wanted, write `transition-opacity duration-[var(--dur-fast)] ease-[var(--ease-out)]`.

Then run `pnpm check` — Biome will fix quote style and import order.

## Scripts

| Command | Action |
| --- | --- |
| `pnpm dev` | Start Astro dev server |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm verify` | Run assertion verification scripts |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm check` | Biome check |
| `pnpm lint` | Biome lint |
| `pnpm format` | Biome format write |

## Documentation

- Product context: `PRODUCT.md`
- Design system: `DESIGN.md`
- Astro docs: https://docs.astro.build

