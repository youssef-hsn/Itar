# Arabic Border Strokes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Any stroke can optionally carry a deterministic Arabic ornament (8-point star, interlace, Kufic key, arch row) drawn procedurally inside its band, round-tripped through the share URL and rendered identically in preview and PNG export.

**Architecture:** A stroke gains an optional `ornament: { motif, ink }`. The stroke's `color` stays the band's ground and `width` stays its thickness. Each motif is a pure function that returns closed path commands in a unit tile. A band layout module snaps whole tiles along each edge, adds a corner tile at each corner, and emits SVG path-data strings. `framePaint(geometry)` turns every ring (solid or ornamented) into a list of `PaintOp`s. Two thin painters consume that list: canvas through `Path2D` for export, and an inline `<svg>` for preview. The CSS `box-shadow` ring preview is retired for framed images because it cannot render patterns.

**Tech Stack:** Astro 7 + React 19 islands, Zod 4, nuqs, Tailwind v4, Biome, Node `--experimental-strip-types` assertion scripts (`pnpm verify`).

**Spec:** Inline. There is no separate spec doc; this plan was agreed in conversation on 2026-10-20. The ornament is a property of a stroke, at the same level as width and colour. Output is deterministic: the same URL gives a byte-identical PNG. Existing v1/v2 links keep decoding unchanged.

**Plan location:** When execution starts, copy this file to `docs/superpowers/plans/2026-10-20-arabic-border-strokes.md` and commit it with Task 1.

## Global Constraints

- Repo idiom wins over global rules: frame modules use `function` declarations and `type`; components are arrow consts. Imports use the `#/` alias across features and relative paths within a feature. No barrels.
- No new dependencies. No randomness anywhere in the ornament path (`Math.random` is banned in `src/features/frame/ornament/`).
- Path numbers are formatted with `fmt(n) = String(Math.round(n * 100) / 100)`, which keeps output deterministic and compact. `-0` must print as `0`.
- Motif ids: `'khatam' | 'interlace' | 'kufic' | 'mihrab'`. URL codes: `k`, `b`, `q`, `m`.
- Labels shown in the UI: `8-point star`, `Interlace`, `Kufic key`, `Arches`, plus `None` for no ornament.
- `MIN_ORNAMENT_WIDTH = 4`. Below this the ring paints only its ground colour.
- Commits use Conventional Commits with a kebab-case scope and a capitalized subject, e.g. `feat(frame-ornament): Add band tiling`. Trailer: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Gate after every task: `pnpm verify && pnpm typecheck && pnpm check`.

## Review Focus

1. **Ornament on a transparent-ground stroke** (`color` alpha 0). `frame.canvas.ts:63` and `frame.css.ts` currently skip alpha-0 rings, which would hide the ink. Expected: the ground is skipped and the ink still paints. Pinned in Task 4.
2. **Ornament narrower than 4 px.** Expected: only the ground paints, with no NaN or hairline speckle, and the popover explains why. Pinned in Tasks 3 and 6.
3. **Corner radius > 0 with an ornament.** Expected: the ink is clipped to the rounded ring, so nothing bleeds outside the composed size. Pinned in Task 4 (an ornament op carries a `clip`).
4. **Hand-edited or truncated share link** (unknown motif code, bad ink hex, `*` with nothing after it). Expected: decoding returns `null` and the editor falls back to the default frame without crashing. Pinned in Task 2.
5. **Preview and export drift.** Both renderers must consume the same `PaintOp[]`. Expected: `framePaint` output is identical across repeated calls. Pinned in Task 4. Visual parity is checked in Task 7.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/features/frame/frame.schema.ts` (modify) | `MOTIF_IDS`, `ornamentSchema`, `stroke.ornament?`, two ornamented presets |
| `src/features/frame/frame.codec.ts` (modify) | Codec v3: `*<code><ink>` stroke suffix |
| `src/features/frame/frame.path.ts` (new) | `PathCommand`, `Affine`, `transformCommands`, `toPathData`, `roundedRectPath`, `fmt` |
| `src/features/frame/ornament/motif.ts` (new) | `Motif` type and the `MOTIFS` registry |
| `src/features/frame/ornament/khatam.ts`, `interlace.ts`, `kufic.ts`, `mihrab.ts` (new) | One motif each: `tile` and `corner` in unit space |
| `src/features/frame/ornament/band.ts` (new) | `bandInkPath(rect, thickness, motif)`: edge tiling and corners |
| `src/features/frame/frame.paint.ts` (new) | `framePaint(geometry): PaintOp[]` |
| `src/features/frame/frame.geometry.ts` (modify) | `RingInset.ornament?` |
| `src/features/frame/frame.canvas.ts` (modify) | Paints `PaintOp[]` via `Path2D` |
| `src/features/frame/frame.css.ts` (modify) | Splits out `frameMatCss` (mat only; no shadows) |
| `src/features/frame/components/FrameRings.tsx` (new) | `<svg>` painter for `PaintOp[]` |
| `src/features/frame/components/FramedBox.tsx` (new) | Composed-size wrapper: rings `<svg>` plus the mat |
| `src/features/frame/components/MotifTile.tsx` (new) | Single-tile SVG preview of a motif |
| `src/features/frame/components/MotifField.tsx` (new) | Radio-group picker: None plus the four motifs |
| `StrokeEditorPopover.tsx`, `StrokeSlab.tsx`, `strokeLabel.ts`, `FrameStage.tsx`, `landing/components/PresetCard.tsx` (modify) | Wire-up |
| `scripts/verify-ornament.ts` (new), `scripts/verify-frame.ts`, `package.json` `verify` script (modify) | Tests |

`DropOverlay.tsx` and `src/pages/og.png.ts` stay as they are. Both draw fixed solid frames, so they keep using `frameCss` / `ring.color`.

---

### Task 1: Ornament schema

**Files:** Modify `src/features/frame/frame.schema.ts`. Test: `scripts/verify-frame.ts`.

**Interfaces — Produces:**
```ts
export const MOTIF_IDS = ['khatam', 'interlace', 'kufic', 'mihrab'] as const;
export type MotifId = (typeof MOTIF_IDS)[number];
export const ornamentSchema = z.object({ motif: z.enum(MOTIF_IDS), ink: hexColor });
export type Ornament = z.infer<typeof ornamentSchema>;
// strokeSchema gains: ornament: ornamentSchema.optional()
```

- [ ] **Step 1: Write failing assertions** in `verify-frame.ts`: `frameSchema.safeParse({...DEFAULT_FRAME, strokes:[{width:24,color:'#1a3a3f',ornament:{motif:'khatam',ink:'#c9a227'}}]}).success === true`; the same input with `motif:'paisley'` gives `.success === false`; with `ink:'gold'` gives `false`.
- [ ] **Step 2: Run** `node --experimental-strip-types scripts/verify-frame.ts`. Expected: it fails, because `ornament` is stripped or unknown and the `paisley` case does not reject. (Zod 4 `z.object` strips unknown keys, so assert `parsed.data.strokes[0].ornament?.motif === 'khatam'` on the success case.)
- [ ] **Step 3: Implement** the schema additions above. Leave `DEFAULT_FRAME` and the existing presets untouched.
- [ ] **Step 4: Run** `pnpm verify && pnpm typecheck`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(frame-schema): Add optional ornament to strokes`. Include the copied plan doc in this commit.

### Task 2: Codec v3

**Files:** Modify `src/features/frame/frame.codec.ts`. Test: `scripts/verify-frame.ts`.

**Interfaces — Consumes:** `Ornament`, `MotifId` (Task 1). **Produces:** `CODEC_VERSION_ORNATE = 3`. The `encodeFrame` and `decodeFrame` signatures are unchanged.

Grammar for one stroke segment: `<width>-<color>[*<code><ink6or8hex>][!<name>]`. Look for `*` only in the part before `!`. The version is `3` if any stroke has an ornament, otherwise `2` if any stroke is named, otherwise `1`. The decoder accepts versions 1–3 and accepts `*` under any of them.

- [ ] **Step 1: Write failing assertions:**
  - Round-trip `ornateFrame` = DEFAULT_FRAME with strokes `[{width:16,color:'#1a3a3f',ornament:{motif:'khatam',ink:'#c9a227'}},{width:4,color:'#c9a227',name:'Gilt'}]`, using `verifyRoundTrip`.
  - `encodeFrame(ornateFrame) === '3.24.f7f4ec.0~16-1a3a3f*kc9a227~4-c9a227!Gilt'`.
  - `encodeFrame(DEFAULT_FRAME)` is still `'1.24.f7f4ec.0~16-1a3a3f~4-c9a227~2-1a3a3f'`.
  - Each of `'3.24.f7f4ec.0~16-1a3a3f*zc9a227'`, `'3.24.f7f4ec.0~16-1a3a3f*k'`, `'3.24.f7f4ec.0~16-1a3a3f*'` and `'3.24.f7f4ec.0~16-1a3a3f*kgg0000'` decodes to `null`.
  - A name containing `*` round-trips (`name: 'a*b'`).
  - Change the existing "unknown codec versions" assertion from `'3.…'` to `'4.24.f7f4ec.0~16-1a3a3f'`.
- [ ] **Step 2: Run** the verify script. Expected: it fails on the v3 encode string.
- [ ] **Step 3: Implement.** Add a `MOTIF_CODES: Record<MotifId, string>` and its inverse lookup. Add `encodeOrnament` / `decodeOrnament(raw): Ornament | null`, reusing `encodeColor`/`decodeColor`. Branch on the version as described above. `frameSchema.safeParse` stays the final gate.
- [ ] **Step 4: Run** `pnpm verify`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(frame-codec): Encode stroke ornaments as codec v3`.

### Task 3: Path primitives, motifs and band tiling

**Files:** Create `frame.path.ts`, `ornament/motif.ts`, the four motif files, and `ornament/band.ts`. Test: create `scripts/verify-ornament.ts` and append it to the `verify` script in `package.json`.

**Interfaces — Produces:**
```ts
// frame.path.ts
export type Point = { x: number; y: number };
export type PathCommand =
  | { op: 'M' | 'L'; to: Point }
  | { op: 'Q'; c: Point; to: Point }
  | { op: 'C'; c1: Point; c2: Point; to: Point }
  | { op: 'Z' };
export type Affine = { origin: Point; u: Point; v: Point }; // world = origin + x*u + y*v
export function fmt(n: number): string;
export function transformCommands(commands: PathCommand[], affine: Affine): PathCommand[];
export function toPathData(commands: PathCommand[]): string;      // "M1 2L3 4Z", space-separated, fmt()
export function rectCommands(x: number, y: number, w: number, h: number): PathCommand[]; // clockwise in y-down space
export function roundedRectPath(x: number, y: number, w: number, h: number, r: number): string; // uses 'A' arcs; r clamped like traceRoundedRect
// ornament/motif.ts
export type Motif = { id: MotifId; label: string; tile: () => PathCommand[]; corner: () => PathCommand[] };
export const MOTIFS: Record<MotifId, Motif>;
export const MIN_ORNAMENT_WIDTH = 4;
// ornament/band.ts
export type Rect = { x: number; y: number; width: number; height: number };
export function bandInkPath(outer: Rect, thickness: number, motif: Motif): string; // '' when thickness < MIN_ORNAMENT_WIDTH
```

The unit tile space is `u ∈ [0,1]` along the edge and `v ∈ [0,1]` from the outer edge (`v=0`) to the inner edge (`v=1`). All subpaths are closed and filled `nonzero`. Every shape is traced clockwise, except holes, which are traced counter-clockwise.

**Motif geometry** (unit space; implementers draw it exactly as given):
- **khatam.** The 8-point star centred at (0.5, 0.5) has 16 vertices. Even vertices are at radius 0.46 and angles `k·45°`; odd vertices are at radius `0.46·cos45°/cos22.5°` and angles `22.5° + k·45°`. Add a counter-clockwise octagon hole at radius 0.16. The corner is the same shape.
- **interlace.** Two ribbons, each 0.2 thick measured in `v`:
  - Strand A runs from `v=0.25` at `u=0` to `v=0.75` at `u=1`. Its upper boundary is a cubic `(0,0.15)→c(0.5,0.15),(0.5,0.65)→(1,0.65)`, closed back along the same curve offset by +0.2 in `v`.
  - Strand B is strand A mirrored about `v=0.5`, traced so that it is still clockwise.
  - The strands are continuous across tile seams by construction.
  - Corner: an annulus centred at (0.5, 0.5) with outer radius 0.34 and inner radius 0.18 (inner circle counter-clockwise), each circle drawn as four cubics with `k=0.5523`.
- **kufic.** A union of clockwise rects `(x, y, w, h)`: `(0,0.85,1,0.15)`, `(0.1,0.15,0.15,0.7)`, `(0.1,0.15,0.75,0.15)`, `(0.7,0.15,0.15,0.5)`, `(0.4,0.5,0.45,0.15)`. Corner: the rects `(0.1,0.1,0.8,0.15)`, `(0.75,0.1,0.15,0.8)`, `(0.1,0.75,0.8,0.15)`, `(0.1,0.1,0.15,0.8)` and `(0.4,0.4,0.2,0.2)`.
- **mihrab.** A pointed arch opening toward the image: `M(0.12,1) L(0.12,0.55) Q(0.12,0.2)→(0.5,0.12) Q(0.88,0.2)→(0.88,0.55) L(0.88,1) Z`. Corner: the diamond `(0.5,0.15)`, `(0.85,0.5)`, `(0.5,0.85)`, `(0.15,0.5)`.

**Band layout algorithm** (`bandInkPath`). `outer` is the ring's outer rect and `t` is the thickness. Each edge strip has length `L = side − 2t`, holds `n = max(1, round(L / t))` tiles, and each tile is `len = L / n` long. Tile `i` uses the edge affine with its origin advanced by `i·len` along `u`:

| Edge | origin | u axis (scaled by `len`) | v axis (scaled by `t`) |
|---|---|---|---|
| top | (x+t, y) | (1,0) | (0,1) |
| right | (x+W, y+t) | (0,1) | (−1,0) |
| bottom | (x+W−t, y+H) | (−1,0) | (0,−1) |
| left | (x, y+H−t) | (0,−1) | (1,0) |

Corners use `corner()` at size `t × t` with these origins: TL `(x,y)` with axes (1,0)/(0,1); TR `(x+W,y)` with axes (0,1)/(−1,0); BR `(x+W,y+H)` with axes (−1,0)/(0,−1); BL `(x,y+H)` with axes (0,−1)/(1,0). Every affine is a rotation (determinant > 0), which preserves winding. Concatenate all the `toPathData` outputs.

- [ ] **Step 1: Write failing tests** in `scripts/verify-ornament.ts`:
  - `fmt(-0) === '0'` and `fmt(1.005)` is stable across two calls.
  - `toPathData(rectCommands(0,0,2,1)) === 'M0 0L2 0L2 1L0 1Z'`.
  - For each motif: every point in `tile()` and `corner()` lies within `[0,1]²`, every command list ends with a `Z`, and nothing is NaN.
  - `bandInkPath({x:0,y:0,width:200,height:100}, 20, MOTIFS.khatam)` is identical across two calls (determinism). Parsing all the numbers out of it shows they lie within `[0,200]×[0,100]` (bounds).
  - Count `M` occurrences for kufic on that rect: tiles = `round(160/20)` + `round(60/20)`, each ×2 = 8·2 + 3·2 = 22 tiles, plus 4 corners. With 5 rects per tile and 5 per corner, the expected count is `(22+4)·5 = 130`.
  - `bandInkPath(rect, 3, MOTIFS.khatam) === ''`.
- [ ] **Step 2: Run** `node --experimental-strip-types scripts/verify-ornament.ts`. Expected: FAIL (module not found).
- [ ] **Step 3: Implement** the modules to the interfaces and geometry above. Port the radius clamp from `traceRoundedRect` (`frame.canvas.ts:21`) into `roundedRectPath`. When `r = 0`, emit plain `L` segments.
- [ ] **Step 4: Run** `pnpm verify && pnpm typecheck`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(frame-ornament): Add motif library and band tiling`.

### Task 4: `framePaint` and canvas export

**Files:** Create `frame.paint.ts`; modify `frame.geometry.ts` and `frame.canvas.ts`. Test: `scripts/verify-ornament.ts`.

**Interfaces — Consumes:** `roundedRectPath`, `bandInkPath`, `MOTIFS` (Task 3). **Produces:**
```ts
// frame.geometry.ts: RingInset gains `ornament?: Ornament` (copied from stroke)
export type PaintOp = { d: string; fill: string; fillRule: 'nonzero' | 'evenodd'; clip?: string };
export function framePaint(geometry: FrameGeometry): PaintOp[]; // composed-space coords, painted in array order
```

Order of ops: rings from outermost to innermost, then the mat. Each ring has ring path `R = roundedRectPath(outer) + roundedRectPath(inner)` with radius `radius + inset`, exactly as `frame.canvas.ts:68-82` does today. A ring contributes:
- the ground `{ d: R, fill: color, fillRule: 'evenodd' }`, unless the colour's alpha is 0;
- then, if it has an ornament and `bandInkPath` returns something non-empty, `{ d: ink, fill: ornament.ink, fillRule: 'nonzero', clip: R }`.

The mat is `{ d: roundedRectPath(mat, radius), fill: matColor, fillRule: 'nonzero' }`. The `parseAlpha` duplicate moves here, so `frame.css.ts` and `frame.canvas.ts` stop owning it.

- [ ] **Step 1: Write failing tests:**
  - `framePaint(frameGeometry(DEFAULT_FRAME, {width:480,height:360})).length === 4` (3 rings + mat).
  - An ornamented ring with transparent ground (`color:'#f7f4ec00'`) yields exactly one op for that ring, and that op has a `clip`.
  - An ornamented 3 px ring yields only its ground op.
  - `JSON.stringify(framePaint(g)) === JSON.stringify(framePaint(g))` for the ornate frame.
  - The last op's `fill === geometry.matColor`.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement** `framePaint`. Rewrite `renderFrame` to iterate the ops: `ctx.save()`; if there is a `clip`, `ctx.clip(new Path2D(op.clip), 'evenodd')`; then `ctx.fillStyle = op.fill; ctx.fill(new Path2D(op.d), op.fillRule); ctx.restore()`. After that it draws the image, keeping the existing `roundImage` clip but switching it to `Path2D(roundedRectPath(...))`. Delete `traceRoundedRect`. The `downscaled` / `MAX_BITMAP_EDGE` behaviour stays the same.
- [ ] **Step 4: Run** `pnpm verify && pnpm typecheck`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(frame-render): Paint rings and ornaments from shared paint ops`.

### Task 5: SVG preview surfaces

**Files:** Create `components/FrameRings.tsx` and `components/FramedBox.tsx`; modify `frame.css.ts`, `FrameStage.tsx` and `landing/components/PresetCard.tsx`. Test: `scripts/verify-frame.ts`.

**Interfaces — Consumes:** `framePaint`, `PaintOp` (Task 4). **Produces:**
```ts
export function frameMatCss(geometry: FrameGeometry): CSSProperties; // frameCss minus boxShadow; frameCss = {...frameMatCss(g), boxShadow}
export const FrameRings = ({ ops, size }: { ops: PaintOp[]; size: Size }) => JSX; // excludes the mat op; useId() prefixes clipPath ids
export const FramedBox = ({ geometry, children }: { geometry: FrameGeometry; children: ReactNode }) => JSX;
// FramedBox: relative div sized composedSize; FrameRings absolutely at inset 0 (aria-hidden, pointer-events-none); child div style=frameMatCss(geometry), position relative
```

- [ ] **Step 1: Write a failing assertion:** `frameMatCss(previewGeometry).boxShadow === undefined && frameMatCss(previewGeometry).margin === previewGeometry.totalThickness`. Keep the existing `frameCss` assertions, since `DropOverlay` still relies on them.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement** `frameMatCss`. Implement `FrameRings` as `<svg width height viewBox>`: each op becomes `<path d fill fillRule>`, and an op with a clip is wrapped in `<g clipPath=url(#id)>` with `<clipPath><path d=clip clipRule="evenodd"/></clipPath>`. Replace the `<div style={frameStyle}>` in `FrameStage.tsx:79` and `PresetCard.tsx:76` with `<FramedBox geometry={geometry}>`. Children are unchanged.
- [ ] **Step 4: Run** `pnpm verify && pnpm typecheck && pnpm check`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(frame-preview): Render ring preview as SVG from paint ops`.

### Task 6: Stroke editor UI and presets

**Files:** Create `components/MotifTile.tsx` and `components/MotifField.tsx`; modify `StrokeEditorPopover.tsx`, `StrokeSlab.tsx`, `strokeLabel.ts` and `frame.schema.ts` (presets). Test: `scripts/verify-frame.ts`.

**Interfaces — Consumes:** `MOTIFS`, `MIN_ORNAMENT_WIDTH`, `toPathData`, `transformCommands`. **Produces:**
```ts
export const MotifTile = ({ motif, ground, ink, size }: { motif: Motif; ground: string; ink: string; size: number }) => JSX; // square svg, tile() scaled to size
export const MotifField = ({ value, ground, ink, onChange }: { value: MotifId | null; ground: string; ink: string; onChange: (motif: MotifId | null) => void }) => JSX;
```

- [ ] **Step 1: Write failing assertions:**
  - `strokeSpecLine({width:24,color:'#1a3a3f',ornament:{motif:'kufic',ink:'#c9a227'}}) === '24 px · Kufic key'`.
  - The same stroke with `color:'#1a3a3f00'` also reads `'24 px · Kufic key'`, not `gap`.
  - Every preset in `PRESETS` round-trips through the codec.
  - `PRESETS.some((p) => p.frame.strokes.some((s) => s.ornament))`.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement:**
  - `strokeSpecLine` checks for an ornament first and returns `` `${width} px · ${MOTIFS[motif].label}` ``.
  - `MotifField` is a `role="radiogroup"` with the label "Pattern", following the `PresetPicker` pattern: a 3-column grid of `Button variant="outline"` items, each `role="radio"` with `aria-checked`, a `MotifTile` at size 28 and a visible text label. That gives a large target and a state that does not rely on hue alone, because a checked item gets `border-primary` plus a check icon. Options: None, then each motif.
  - Popover, below Color:
    - `MotifField` with `onChange={(m) => onUpdate({ ornament: m == null ? undefined : { motif: m, ink: stroke.ornament?.ink ?? '#c9a227' } })}`.
    - When an ornament is set, a `ColorField label="Pattern color"` that updates `ornament.ink`.
    - When `stroke.width < MIN_ORNAMENT_WIDTH`, a `type-caption text-muted-foreground` line: `Patterns show at 4 px and wider.`
    - Rename the "Color" label to "Ground color" only when an ornament is present.
  - `StrokeSwatch` renders a `MotifTile` at size 32 when the stroke has an ornament.
  - Add these presets after `triple-thread`:
    - `{ id:'star-band', name:'Star Band', frame:{ padding:24, matColor:'#f7f4ec', radius:0, roundImage:false, strokes:[{width:3,color:'#c9a227'},{width:28,color:'#1a3a3f',ornament:{motif:'khatam',ink:'#c9a227'}},{width:3,color:'#c9a227'}] } }`
    - `{ id:'kufic-key', name:'Kufic Key', frame:{ padding:28, matColor:'#f7f4ec', radius:0, roundImage:false, strokes:[{width:2,color:'#1a3a3f'},{width:4,color:'#f7f4ec00'},{width:24,color:'#f7f4ec',ornament:{motif:'kufic',ink:'#1a3a3f'}},{width:6,color:'#1a3a3f'}] } }`
- [ ] **Step 4: Run** `pnpm verify && pnpm typecheck && pnpm check`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(stroke-editor): Let a stroke become an Arabic border`.

### Task 7: End-to-end visual verification

- [ ] **Step 1:** Run `astro dev --background`. Use the `run` skill, or claude-in-chrome on `/editor`, to apply **Star Band** and **Kufic Key**. Screenshot each and check: corners carry corner tiles, there are no cut tiles at the seams, and the ink stays inside the ring.
- [ ] **Step 2:** Set radius to 40 on Star Band, export a PNG, and compare it with the preview screenshot. The ink should be clipped to rounded corners in both, with the same tile count.
- [ ] **Step 3:** Copy the URL, reload it in a fresh tab, and check that the frame is identical. Then paste `/editor?f=3.24.f7f4ec.0~16-1a3a3f*z000000` and check that the editor loads the default frame with no console error.
- [ ] **Step 4:** On the landing page `/`, check that the new presets render in the gallery. In the editor at a 375 px viewport, check that the Pattern radiogroup is reachable by keyboard and has 44 px targets.
- [ ] **Step 5:** Run `astro dev stop`. Commit any fixes found as `fix(frame-ornament): …`.

## Verification (whole feature)

`pnpm verify && pnpm typecheck && pnpm check && pnpm build` should all pass, together with the Task 7 browser checklist.
