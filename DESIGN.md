---
name: Itar
description: Instant, param-driven Arabic borders—quiet chrome, craft in the output.
---

# Design System: Itar

## 1. Overview

**Creative North Star: "The Quiet Frame Shop"**

Itar is a one-sitting tool: upload, tweak a few parameters, download. The visual system stays calm and precise so the bordered image is the only ornament. Chrome borrows the quiet density of Linear and Raycast, and the job focus of Remove.bg—huge result, almost no UI theater.

Surfaces are restrained: teal-tinted neutrals carry the layout; oxidized teal appears only as the accent voice (≤10%) for primary actions, selection, and focus. Motion is state-only—hover, focus, loading—never entrance choreography. Typography is a single humanist sans so controls feel familiar and disappear into the task.

This system explicitly rejects heavy “Islamic heritage” theme-park UI (gold everything, arabesque wallpaper as chrome), bloated design-suite toolbars, and generic AI SaaS purple-gradient marketing chrome.

**Key Characteristics:**
- Restrained palette; oxidized teal as scarce accent
- One humanist sans across UI, labels, and body
- Flat chrome; depth via tone, not shadow theater
- State-change motion only; respect `prefers-reduced-motion`
- Ornament lives in the framed output, never in the tool chrome

**Token source:** `src/styles/tokens/` bridged in `src/styles/global.css`.

## 2. Colors

Restrained strategy: tinted neutrals dominate; oxidized teal is the single accent and stays scarce. All values are OKLCH.

### Primary — Oxidized Teal

Hue anchor **195**. Used for primary actions, current selection, focus rings, and other high-signal interactive states only. Never as a large fill behind content or as decorative chrome.

| Token | Value |
| --- | --- |
| `--teal-50` | `oklch(0.97 0.02 195)` |
| `--teal-100` | `oklch(0.93 0.035 195)` |
| `--teal-200` | `oklch(0.87 0.05 195)` |
| `--teal-300` | `oklch(0.75 0.07 195)` |
| `--teal-400` | `oklch(0.62 0.085 195)` |
| `--teal-500` | `oklch(0.5 0.095 195)` — primary |
| `--teal-600` | `oklch(0.43 0.09 195)` — hover |
| `--teal-700` | `oklch(0.36 0.08 195)` — active / link |
| `--teal-800` | `oklch(0.28 0.06 195)` |
| `--teal-900` | `oklch(0.22 0.045 195)` |

Aliases: `--brand-primary` → `--teal-500`, `--brand-primary-hover` → `--teal-600`, `--brand-primary-active` → `--teal-700`.

### Neutral — Teal-tinted ink

Body text, page background, panel surfaces, and dividers. Chroma ~0.006–0.02 toward hue 195 — never cream/sand or gold warmth.

| Token | Value | Role |
| --- | --- | --- |
| `--ink-50` | `oklch(0.985 0.006 195)` | page wash (`--surface-page`) |
| `--ink-100` | `oklch(0.96 0.008 195)` | sunken / muted surface |
| `--ink-200` | `oklch(0.91 0.01 195)` | subtle border |
| `--ink-300` | `oklch(0.82 0.012 195)` | default border |
| `--ink-600` | `oklch(0.42 0.017 195)` | subtle text |
| `--ink-700` | `oklch(0.34 0.018 195)` | muted / secondary body (≥4.5:1 on page) |
| `--ink-800` | `oklch(0.26 0.019 195)` | body text |
| `--ink-900` | `oklch(0.2 0.02 195)` | strong / display ink |
| `--white` | `oklch(1 0 0)` | panels |

**The Scarce Accent Rule.** Oxidized teal appears on ≤10% of any given screen. If the UI starts looking teal, the accent has escaped its job.

**The Output Owns Ornament Rule.** Arabic border craft, pattern, and richness belong in the downloaded image. The product chrome stays quiet, legible, and nearly colorless.

## 3. Typography

**Family:** Source Sans 3 (single humanist sans) via `--font-family-sans`. Hierarchy is weight, size, and color — not a second typeface.

### Scale (fixed rem, ~1.2 ratio)

| Role | Token | Size | Weight |
| --- | --- | --- | --- |
| Display | `--fs-display` | 2.5rem | 700 |
| Headline | `--fs-headline` | 1.75rem | 600 |
| Title | `--fs-title` | 1.25rem | 600 |
| Body | `--fs-body` | 1rem | 400 |
| Label | `--fs-label` | 0.875rem | 500 |
| Caption | `--fs-caption` | 0.75rem | 500 |

Utilities: `type-display`, `type-headline`, `type-title`, `type-body`, `type-label`.

**The One Family Rule.** No serif/display pairing in the tool UI.

## 4. Elevation

Flat by default. Depth comes from subtle tonal shifts between page, panel, and field—not stacked shadows. Radii: `--radius-control-sm` 6px, `--radius-control-md` 10px, `--radius-control-lg` 14px.

**The Flat-By-Default Rule.** Surfaces are flat at rest. If a shadow appears, it is a response to state (focus, open popover), never ambient decoration.

## 5. Motion

- `--dur-fast`: 120ms · `--dur-base`: 200ms · `--ease-out`: expo-style cubic-bezier
- State changes only (hover, focus, loading)
- `prefers-reduced-motion: reduce` collapses transitions globally in `global.css`

## 6. Components

Shared layout: `src/components/layout/BaseLayout.astro`. Feature UI lives under `src/features/<feature>/`. Re-run `/impeccable document` as the framing UI lands.

## 7. Do's and Don'ts

### Do:
- **Do** keep the happy path visible: upload → few parameters → download, with one clear primary action per step.
- **Do** use oxidized teal only for primary action, selection, and focus—and always pair state with a non-color cue (icon, label, weight).
- **Do** keep touch targets large for the mobile framing flow; meet WCAG 2.2 AA contrast.
- **Do** use short state transitions only (hover, focus, loading); honor `prefers-reduced-motion`.
- **Do** let the preview/result dominate the viewport—chrome stays secondary.

### Don't:
- **Don't** ship heavy “Islamic heritage” theme-park UI (gold everything, busy arabesque wallpaper as chrome).
- **Don't** build bloated design suites (Canva / Photoshop vibes—toolbars everywhere).
- **Don't** use generic AI SaaS patterns (purple gradients, feature grids, signup walls).
- **Don't** put decorative arabesque, gold leaf, or patterned fills in the tool chrome.
- **Don't** invent entrance choreography, bounce, or elastic motion.
- **Don't** use cream/sand/parchment body backgrounds or purple-on-white gradients as the default look.
