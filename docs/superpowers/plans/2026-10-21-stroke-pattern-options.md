# Stroke Pattern Options Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> On execution, first copy this file to `docs/superpowers/plans/2026-10-21-stroke-pattern-options.md` and commit it with Task 1.

**Goal:** Make each Arabic-border motif's corner piece join its edge pattern, and give ornamented strokes more choices: four new motifs, a corner style, a pattern density and a mirror-at-center toggle.

**Architecture:** Motifs stay as procedural `PathCommand[]` in unit space (`src/features/frame/ornament/*`). Corner pieces are redrawn so they are symmetric about the diagonal and meet the tile's *seams*, meaning the v-intervals where the tile's ink touches u=0 and u=1. The ornament schema gains `corner`, `density` and `mirror`, all with defaults. The URL codec emits a v4 suffix only when one of them differs from its default, so existing v3 links stay byte-identical. `bandInkPath` reads these options. The stroke editor shows them through one shared option radio group.

**Tech Stack:** Astro 7, React 19 islands, Tailwind 4, zod 4, Biome. Tests are plain assertion scripts run with `node --experimental-strip-types`.

**Spec:** The user's request ("the corners don't quite fit, add more options"), plus their answers in this session: all four option kinds (more motifs, corner style, density, mirror), and fix corners **by redesigning the corner pieces only**, leaving the stretch-to-fit tiling as it is. Prior design: `docs/superpowers/plans/2026-10-20-arabic-border-strokes.md`.

## Global Constraints

- No new dependencies, and no `Math.random` in `ornament/`. Output must be deterministic.
- `MIN_ORNAMENT_WIDTH = 4` is unchanged.
- Every unit-space point of every `tile()`, `corner()` and corner-style piece lies in [0,1]². This is already asserted in `scripts/verify-ornament.ts:57-75`, and that loop must cover the new pieces too.
- Match the surrounding style. The `ornament/`, `frame.*.ts` and codec files use `function` declarations, React components use `export const`, there are no comments, and Biome has the final say (`pnpm check`).
- Existing `?f=` links (codec v1–v3) must decode exactly as they do today.
- Commits use Conventional Commits with a kebab-case scope and a capitalized subject, for example `fix(frame-ornament): …`, and end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- After every task, `pnpm verify && pnpm typecheck && pnpm check` passes.

## Review Focus

1. **Old links keep working.** A v3 link such as `3.24.f7f4ec.0~16-1a3a3f*kc9a227~4-c9a227!Gilt` decodes with the default options and re-encodes byte-identical. Test is in Task 3.
2. **Short edges with mirror or density.** An edge whose length gives exactly one tile, or none, must not produce NaN or a reflected lone tile. A 60×60 rect at t=20 has one tile per edge, and that tile stays unmirrored. Test is in Task 4.
3. **Corner style "none" on a tiny frame.** A 40×40 rect at t=20 has no edge tiles and no corner ink, so it returns `''`, and `framePaint` must emit no ink op. Test is in Task 4.
4. **Malformed option suffix.** `:x`, `:mr`, `:mrq1` and `:zr1` all decode to `null` rather than throwing or partially applying. Test is in Task 3.
5. **Switching motif in the editor keeps the chosen corner, density and mirror.** Picking None and then a motif again resets them to the defaults. This is checked in the browser in Task 5.

Out of scope, flag but do not fix: tiles on rounded frames (`radius > 0`) are still laid on a square grid and clipped by the arc.

---

## Corner geometry convention (applies to Tasks 1, 2 and 4)

`band.ts` maps each corner's unit square so that (0,0) is the outer frame corner and (1,1) is the inner corner nearest the image. The **outgoing** edge leaves through side u=1, and its tile v lines up with the corner's v. The **incoming** edge arrives through side v=1, and its tile v lines up with the corner's u.

A corner therefore fits when both of these hold:
- (a) Its point set is closed under the transpose (x,y)→(y,x).
- (b) For every tile seam [a,b], the corner contains the points (1,a), (1,b), (a,1) and (b,1). The tile contains (0,a), (0,b), (1,a) and (1,b).

Seams per motif:

| motif | seams |
|---|---|
| khatam | none |
| interlace | [0.15,0.35], [0.65,0.85] |
| kufic | [0.85,1] |
| mihrab | none |
| chevron | [0.25,0.45] |
| chain | [0.45,0.55] |
| hexagram | none |
| dentil | [0.8,1] |

---

### Task 1: Redraw corners so they meet their edges

**Files:**
- Create: `src/features/frame/ornament/shapes.ts`
- Modify: `src/features/frame/ornament/interlace.ts`, `kufic.ts`, `mihrab.ts`
- Test: `scripts/verify-ornament.ts`

**Interfaces:**
- Produces: `circle(radius: number, isClockwise: boolean, center?: Point): PathCommand[]` in `shapes.ts`. This is the existing `interlace.ts` circle moved out, with `center` defaulting to `{x:0.5,y:0.5}`. It also produces `quarterRing(center: Point, inner: number, outer: number): PathCommand[]`, a closed quarter-annulus between the two radii covering the quadrant toward (0,0), built with kappa 0.5523.

- [ ] **Step 1: Write the failing tests.** In `verify-ornament.ts`, add a `SEAMS: Record<MotifId, [number, number][]>` table holding the values above, plus a helper `hasPoint(points, x, y)` that compares within 1e-6. For each motif in `MOTIFS`:
  - `assert` that the corner point multiset equals its transpose (`${id} corner must be symmetric about the diagonal`).
  - For each seam [a,b], `assert` that the tile has (0,a), (0,b), (1,a) and (1,b), and the corner has (1,a), (1,b), (a,1) and (b,1) (`${id} corner must meet the ${a}–${b} seam`).
  - Change the kufic subpath count at line 87 to **134**.
- [ ] **Step 2: Run the tests.** Run `node --experimental-strip-types scripts/verify-ornament.ts`. The expected result is FAIL with `interlace corner must meet the 0.15–0.35 seam`.
- [ ] **Step 3: Redraw the corners.**
  - **interlace:** two `quarterRing`s about (1,1), one with radii 0.65–0.85 and one with radii 0.15–0.35. Each strand bends 90° into the next edge. `circle` now imports from `shapes.ts`.
  - **kufic:** `CORNER_RECTS` becomes `[0.85,0.85,0.15,0.15]`, which joins the two baselines, plus a ring made of `[0.1,0.1,0.6,0.15]`, `[0.55,0.1,0.15,0.6]`, `[0.1,0.55,0.6,0.15]` and `[0.1,0.1,0.15,0.6]`, plus a centre square `[0.325,0.325,0.15,0.15]`.
  - **mihrab:** a corner arch pointing at the outer corner. The path is M(0.88,0.88) L(0.4,0.88) L(0.4,0.7) Q c(0.4,0.3) → (0.15,0.15) Q c(0.3,0.4) → (0.7,0.4) L(0.88,0.4) Z.
  - **khatam:** unchanged.
- [ ] **Step 4: Run the tests again.** Run `pnpm verify && pnpm typecheck && pnpm check`. All should pass.
- [ ] **Step 5: Commit.** `fix(frame-ornament): Draw corner pieces that join their edge patterns`

### Task 2: Add four motifs

**Files:**
- Create: `src/features/frame/ornament/chevron.ts`, `chain.ts`, `hexagram.ts`, `dentil.ts`
- Modify: `src/features/frame/frame.schema.ts:9`, `ornament/motif.ts:24`, `frame.codec.ts:7-12`
- Test: `scripts/verify-ornament.ts`, `scripts/verify-frame.ts`

**Interfaces:**
- Produces: `MOTIF_IDS = ['khatam','interlace','kufic','mihrab','chevron','chain','hexagram','dentil']`, along with matching `MOTIFS` entries and `MOTIF_CODES` (chevron `v`, chain `o`, hexagram `h`, dentil `d`).

- [ ] **Step 1: Write the failing tests.**
  - Add the four seam rows to `SEAMS`. TypeScript then fails until the ids exist.
  - In `verify-frame.ts`, loop over `MOTIF_IDS` and run `verifyRoundTrip(\`${id} ornament\`, …)` on a one-stroke ornate frame.
  - Assert that `new Set(Object.values(MOTIF_CODES)).size === MOTIF_IDS.length`. Export `MOTIF_CODES` if needed.
- [ ] **Step 2: Run the tests.** Run `pnpm typecheck`. The expected result is FAIL with `'chevron' does not exist`.
- [ ] **Step 3: Implement the motifs.** Labels are in quotes.
  - **chevron**, "Chevron":
    - tile: polygon (0,0.25), (0.5,0.6), (1,0.25), (1,0.45), (0.5,0.8), (0,0.45).
    - corner: L-bend polygon (1,0.25), (0.25,0.25), (0.25,1), (0.45,1), (0.45,0.45), (1,0.45).
  - **chain**, "Chain":
    - tile: `circle(0.42,true)` plus `circle(0.26,false)` plus bars `rectCommands(0,0.45,0.12,0.1)` and `rectCommands(0.88,0.45,0.12,0.1)`. The bars run clockwise, the same direction as the outer circle, so their overlap stays filled under nonzero.
    - corner: `circle(0.3,true)` plus `circle(0.16,false)` plus bars `[0.78,0.45,0.22,0.1]` and `[0.45,0.78,0.1,0.22]`.
  - **hexagram**, "6-point star":
    - tile: two triangles of radius 0.46 about (0.5,0.5), at angles −90°/30°/150° and 90°/210°/330°. Both are wound the same way and there is no hole.
    - corner: the same two triangles rotated to 45°/165°/285° and 105°/225°/345°. The upright star is not symmetric about the diagonal, so this rotation is what lets it pass the transpose test.
  - **dentil**, "Dentil":
    - tile: baseline `[0,0.8,1,0.2]` plus tooth `[0.2,0.15,0.6,0.65]`.
    - corner: `[0.8,0.8,0.2,0.2]` plus `[0.2,0.2,0.45,0.45]`.
- [ ] **Step 4: Run the tests again.** Run `pnpm verify && pnpm typecheck && pnpm check`. All should pass, and the motif loop now covers 8 motifs.
- [ ] **Step 5: Commit.** `feat(frame-ornament): Add chevron, chain, hexagram and dentil motifs`

### Task 3: Corner, density and mirror in the schema and codec

**Files:**
- Modify: `src/features/frame/frame.schema.ts:13-18` and the presets at `:115` and `:131`, plus `src/features/frame/frame.codec.ts`
- Test: `scripts/verify-frame.ts`

**Interfaces:**
- Produces, in `frame.schema.ts`:
  - `CORNER_STYLES = ['motif','rosette','block','none'] as const`, `type CornerStyle`
  - `DENSITIES = ['tight','regular','wide'] as const`, `type Density`
  - `DEFAULT_PATTERN = { corner: 'motif', density: 'regular', mirror: false } as const satisfies …`
  - `ornamentSchema` gains `corner: z.enum(CORNER_STYLES).default('motif')`, `density: z.enum(DENSITIES).default('regular')` and `mirror: z.boolean().default(false)`. `Ornament` is `z.infer`, the output type, so all three are always present.
- Produces, in `frame.codec.ts`:
  - `CODEC_VERSION_PATTERNED = 4`
  - The ornament token `*<motif><ink>[:<corner><density><mirror>]`. Corner codes are motif `m`, rosette `r`, block `b` and none `n`. Density codes are tight `t`, regular `r` and wide `w`. Mirror is `1` or `0`. The suffix is emitted only when the ornament differs from `DEFAULT_PATTERN`. The version is 4 if any stroke emits a suffix, otherwise the existing rule applies.

- [ ] **Step 1: Write the failing tests.**
  - Update the existing ornament literals that are typed as `Frame` (for example `verify-frame.ts:186`) to `{ ...DEFAULT_PATTERN, motif, ink }`.
  - `encodeFrame(<ornateFrame with ornament {...DEFAULT_PATTERN, motif:'kufic', ink:'#c9a227', corner:'rosette', density:'wide', mirror:true}>)` should include `*qc9a227:rw1` and start with `4.`.
  - `verifyRoundTrip` on that frame.
  - `decodeFrame('3.24.f7f4ec.0~16-1a3a3f*kc9a227~4-c9a227!Gilt')`: its ornament should deep-equal `{ motif:'khatam', ink:'#c9a227', ...DEFAULT_PATTERN }`, and re-encoding it should give the identical string.
  - Each of `:x`, `:mr`, `:mrq1` and `:zr1` appended after `*kc9a227` should make `decodeFrame` return `null`.
- [ ] **Step 2: Run the tests.** Run `node --experimental-strip-types scripts/verify-frame.ts`. The expected result is FAIL: the encoding lacks `:rw1`.
- [ ] **Step 3: Implement.**
  - Extend the schema.
  - Add `...DEFAULT_PATTERN` to the two preset ornaments.
  - In `decodeOrnament`, split on `:` before parsing ink. A suffix must be exactly 3 valid codes, otherwise the whole decode returns null.
  - Raise the accepted version ceiling to `CODEC_VERSION_PATTERNED`.
- [ ] **Step 4: Run the tests again.** Run `pnpm verify && pnpm typecheck && pnpm check`. All should pass. Typecheck will flag `StrokeEditorPopover.tsx:111`. Change it to `{ ...DEFAULT_PATTERN, ...ornament, motif, ink }` so that changing motif keeps the chosen options.
- [ ] **Step 5: Commit.** `feat(frame-codec): Carry corner, density and mirror in ornament links`

### Task 4: Band rendering honours the options

**Files:**
- Create: `src/features/frame/ornament/cornerStyle.ts`
- Modify: `src/features/frame/ornament/band.ts`, `src/features/frame/frame.paint.ts:49-53`
- Test: `scripts/verify-ornament.ts`

**Interfaces:**
- Consumes: `Ornament`, `CornerStyle`, `Density` from Task 3, `circle` from Task 1, and `MOTIFS`.
- Produces:
  - In `cornerStyle.ts`:
    - `CORNER_LABELS: Record<CornerStyle, string>`, with the labels Matched, Rosette, Block and Plain.
    - `cornerCommands(style: CornerStyle, motif: Motif): PathCommand[]`:
      - motif → `motif.corner()`
      - rosette → `circle(0.4,true)` + `circle(0.28,false)` + `circle(0.14,true)`
      - block → `rectCommands(0,0,1,1)`
      - none → `[]`
  - In `band.ts`:
    - `DENSITY_SCALE: Record<Density, number> = { tight: 0.75, regular: 1, wide: 1.5 }`.
    - The new signature is `bandInkPath(outer: Rect, thickness: number, pattern: Omit<Ornament,'ink'>): string`. It looks up `MOTIFS[pattern.motif]` itself.
  - The paint call passes `ring.ornament`.

- [ ] **Step 1: Write the failing tests.** Change the existing `bandInkPath(rect, t, MOTIFS.x)` calls to `bandInkPath(rect, t, { ...DEFAULT_PATTERN, motif: 'x' })`. Add these tests, using the existing `pathNumbers` helper paired into points:
  - **density:** on `bandRect` at t=20, kufic subpaths are 134 at regular. Tight gives top edge `round(160/15)=11` tiles and side `round(60/15)=4` tiles, so `(11+11+4+4)×5 + 4×6 = 174` subpaths. Wide gives `round(160/30)=5` and `round(60/30)=2`, so `14×5 + 24 = 94` subpaths.
  - **mirror:** for kufic with `mirror:true` on `bandRect` at t=20, take the multiset of points with `y < 20`. It equals its reflection x→200−x after `fmt` rounding. With `mirror:false` it does not equal it, which proves the test can fail.
  - **mirror on a short edge:** on `{x:0,y:0,width:60,height:60}` at t=20 with `mirror:true`, the output equals the `mirror:false` output. A single tile stays unmirrored, and neither contains `NaN`.
  - **corner styles:** for `corner:'none'`, kufic subpaths are 110 on `bandRect`. On `{width:40,height:40}` at t=20, `bandInkPath` returns `''`, and `framePaint` of a frame whose ring is 20px kufic with `corner:'none'` and an 8-digit transparent ground has no op with `clip`. Both `rosette` and `block` stay inside [0,200]×[0,100].
  - **unit square:** add every `cornerCommands(style, motif)` piece to the unit-square loop.
- [ ] **Step 2: Run the tests.** Run `node --experimental-strip-types scripts/verify-ornament.ts`. The expected result is FAIL, from a type or arity error on `bandInkPath`.
- [ ] **Step 3: Implement.**
  - In `edgeTiles(edge, t, scale, isMirrored)`, set `count = max(1, round(length / (t*scale)))`.
  - When `isMirrored` is set, tile `index` with `2*index > count-1` uses `origin = edge.origin + along*tileLength*(index+1)` and `u = −along*tileLength`.
  - Corners use `cornerCommands(pattern.corner, motif)`.
  - Skip empty transforms so `'none'` adds no characters.
- [ ] **Step 4: Run the tests again.** Run `pnpm verify && pnpm typecheck && pnpm check`. All should pass.
- [ ] **Step 5: Commit.** `feat(frame-ornament): Render corner style, density and mirror on bands`

### Task 5: Stroke editor controls

**Files:**
- Create:
  - `src/features/frame/components/OptionRadioGroup.tsx`: the radiogroup, roving tabindex, arrow keys and check badge, lifted from `MotifField.tsx`.
  - `src/features/frame/components/CornerTile.tsx`: like `MotifTile`, but it renders `cornerCommands` at the TL orientation, with a quarter of the adjacent edge tile drawn to the right of the corner and below it so the join shows.
- Modify: `MotifField.tsx` (now built on `OptionRadioGroup`), `StrokeEditorPopover.tsx`

**Interfaces:**
- Produces: `OptionRadioGroup<T extends string | null>`, with props `{ label: string; options: { value: T; label: string; preview?: ReactNode }[]; value: T; onChange: (value: T) => void; columns: 3 | 4 }`. The generic is justified by three callers. The component is `export const`.

- [ ] **Step 1: Build the controls.**
  - `MotifField` keeps its props and renders None plus 8 motifs in a 3×3 grid.
  - `StrokeEditorPopover` adds three controls under "Pattern color", shown only when `ornament` is set:
    - **Corners:** an `OptionRadioGroup` with 4 columns, `CORNER_LABELS`, and 24px `CornerTile` previews.
    - **Density:** an `OptionRadioGroup` with 3 columns and the text options Tight, Regular and Wide.
    - **Mirror at center:** an `outline` `Button` with `aria-pressed={ornament.mirror}`, toggling `mirror`.
  - Each control calls `onUpdate({ ornament: { ...ornament, <field> } })`.
  - Keep the UI quiet, with no new colors (see DESIGN.md, "The Output Owns Ornament").
- [ ] **Step 2: Run the checks.** Run `pnpm typecheck && pnpm check && pnpm verify`. All should pass.
- [ ] **Step 3: Check it in the browser.**
  - Run `astro dev --background`.
  - Open the editor, apply the Star Band preset, and open the stroke popover. Check each of the following:
    - Every motif's corners join their edges, especially Interlace, Kufic key and Chevron.
    - Corners: Rosette, Block and Plain each change all four corners.
    - Density: Tight and Wide change the tile count.
    - Mirror: the top edge is symmetric.
    - Arrow keys move through each group.
    - Switching motif keeps the corner, density and mirror choices, and picking None then a motif resets them.
    - Reloading the page restores the state from `?f=4.…`, and an old `?f=3.…` link still loads.
    - The PNG export matches the preview.
  - Run `astro dev stop`.
- [ ] **Step 4: Commit.** `feat(stroke-editor): Offer corner, density and mirror pattern options`

## Verification (end to end)

1. Run `pnpm verify && pnpm typecheck && pnpm check`. All should be green.
2. Do the browser walkthrough from Task 5, Step 3, and export a PNG of an ornamented frame for each corner style.
