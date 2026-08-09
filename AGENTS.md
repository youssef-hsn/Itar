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
  components/
    layout/          # shared Astro layouts
  features/
    <feature>/
      components/    # feature UI (React)
      pages/         # feature page modules (optional)
  pages/             # Astro routes
```

Group by feature, not by layer. No barrel files — import from source paths.

## Scripts

| Command | Action |
| --- | --- |
| `pnpm dev` | Start Astro dev server |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm check` | Biome check |
| `pnpm lint` | Biome lint |
| `pnpm format` | Biome format write |

## Documentation

- Product context: `PRODUCT.md`
- Design system: `DESIGN.md`
- Astro docs: https://docs.astro.build
