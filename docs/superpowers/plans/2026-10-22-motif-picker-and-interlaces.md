# Searchable Pattern Picker and Interlace Motifs: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> On execution, first copy this file to `docs/superpowers/plans/2026-10-22-motif-picker-and-interlaces.md` and commit it with Task 1.

**Goal:** Replace the stroke editor's 3-column "Pattern" radio grid with a searchable dropdown. While you hover or arrow through the list, the highlighted pattern is painted live on the real frame. Then add five interlace-family motifs to the registry, including an angular interlace with sharp corners.

**Architecture:** A thin `#/components/ui/combobox.tsx` wraps Base UI's `Combobox`, which is already installed (`@base-ui/react` ^1.7). It follows the shape of `popover.tsx` and uses the "input inside popup" pattern. `MotifField` is rebuilt on it. Base UI's `onItemHighlighted` drives a transient preview held in `FrameEditor` state, never in the URL. A pure `withMotifPreview(frame, preview)` derives the frame passed to `FrameStage`. The new motifs are procedural `PathCommand[]` files in `src/features/frame/ornament/`. They are built from three new shape helpers and wired through `MOTIF_IDS`, `MOTIFS` and `MOTIF_CODES`.

**Tech Stack:** Astro 7, React 19 islands, Tailwind 4, Base UI 1.7 Combobox, zod 4, Biome. Tests are plain assertion scripts (`pnpm verify`).

**Spec:** The user's request: "make the current patterns selection use a dropdown that allows you to search the available patterns and it will preview each pattern before you select one … add to the registry new patterns like the interlace, one necessarily one that looks like the interlace but is more angular showing some sharp corners". Their answers in this session: preview means **live on the frame**, and the new motifs are **Angular interlace (required), Braid, Guilloche (knot), Step interlace, Lattice**. Prior design: `docs/superpowers/plans/2026-10-21-stroke-pattern-options.md`, which defines the corner/seam convention reused below.

## Global Constraints

- No new dependencies. Combobox comes from the installed `@base-ui/react/combobox`.
- `ornament/` stays deterministic, with no `Math.random`. Every tile and corner point lies in [0,1]², and every motif corner is symmetric about the diagonal and meets its seams. `scripts/verify-ornament.ts` already asserts this for every `MOTIFS` entry.
- Ink is filled `nonzero`. All strand polygons and ribbons in one motif must wind the same way (clockwise on screen, y down). Otherwise overlapping crossings cancel into holes. Counter-clockwise is used only for a deliberate hole, as in `circle(r, false)`.
- Existing `?f=` links decode exactly as today. New motifs get new one-letter codes and **no codec version bump**.
- Match the surrounding style. `ornament/` and `frame.*.ts` use `function` declarations, components use `export const`, there are no comments, and Biome decides (`pnpm check`). The UI primitive follows `AGENTS.md` normalization: no focus-ring, shadow-scale or animate classes, and `transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]` where a transition is needed.
- Commits use a scoped Conventional Commit with a capitalized subject and end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- After every task, `pnpm verify && pnpm typecheck && pnpm check` passes.

## Review Focus

1. **The preview sticks after an exit path.** Closing the stroke editor by outside click, pressing Escape, removing the stroke, or switching to another stroke while the dropdown is open must restore the committed frame. `MotifField` calls `onPreviewEnd` on unmount, and `withMotifPreview` ignores an out-of-range index. The test is in Task 2, with a browser check.
2. **Escape inside the nested dropdown.** The first Escape closes only the combobox and clears the preview. The stroke popover stays open. A second Escape closes the popover. This is a browser check in Task 1.
3. **Previewing "None" and previewing from an un-ornamented stroke.** Highlighting None removes ink. Highlighting a motif on a plain stroke uses `defaultOrnamentInk(stroke.color)`. The test is in Task 2.
4. **A search with no matches.** Typing "zzz" shows "No patterns match." and no preview is painted. The browser check is in Task 1. A search for "interlace" lists Interlace, Angular interlace and Step interlace once Task 3 lands.
5. **Overlapping strands with opposite winding.** A crossing must render solid, not punched out. Each new tile is checked in the browser on a 24 px ring (Tasks 3 and 4). `verify-ornament` cannot see winding.

---

### Task 1: Searchable pattern dropdown

**Files:**
- Create: `src/components/ui/combobox.tsx`
- Modify: `src/features/frame/components/MotifField.tsx` (full rewrite)
- Unchanged consumer: `src/features/frame/components/StrokeEditorPopover.tsx:117-122`

**Interfaces:**
- Produces, in `combobox.tsx`: the re-exports `Combobox = BaseCombobox.Root`, `ComboboxLabel`, `ComboboxTrigger`, `ComboboxValue`, `ComboboxIcon`, `ComboboxInput`, `ComboboxList`, `ComboboxItem`, `ComboboxItemIndicator` and `ComboboxEmpty`. It also produces a styled `ComboboxContent` (Portal, then Positioner `z-[var(--z-dropdown)]`, then Popup). It takes the same positioner props as `PopoverContent` and uses `max-h-[min(var(--available-height),20rem)]` and `w-[var(--anchor-width)]`.
- Produces: `MotifField` props `{ value: MotifId | null; ground: string; ink: string; onChange: (motif: MotifId | null) => void; onPreview: (motif: MotifId | null) => void; onPreviewEnd: () => void }`. In this task `StrokeEditorPopover` passes no-ops for the last two. Task 2 wires them.

- [ ] **Step 1: Build `combobox.tsx`.** Mirror `src/components/ui/popover.tsx`: the same token classes (`bg-popover`, `border-border`, `shadow-[var(--shadow-popover)]`, `rounded-md`), with `ComboboxItem` styled `data-[highlighted]:bg-accent` and a min height of 44 px. The `ComboboxInput` reuses the `Input` classes.
- [ ] **Step 2: Rewrite `MotifField`.**
  - Use a module-level `MOTIF_OPTIONS: { value: MotifId | null; label: string }[]`, with `{value: null, label: 'None'}` first and then `MOTIF_IDS` mapped to `MOTIFS[id].label`. Base UI reads `{value,label}` automatically. Pass `items={MOTIF_OPTIONS}` and `value={MOTIF_OPTIONS.find(o => o.value === value)}`. The stable references make equality work.
  - `ComboboxLabel` reads "Pattern".
  - The trigger is an outline-button look (match `Button variant="outline"`). It shows the current swatch (a `MotifTile` at 28 px, or the plain ground swatch for None), the label and a `ChevronsUpDown` icon.
  - The popup holds a `ComboboxInput` with placeholder "Search patterns", then a `ComboboxEmpty` reading "No patterns match.", then a `ComboboxList` whose items each show the swatch, the label and a `Check` indicator.
  - `onValueChange(option)` guards `option == null` and returns early. Otherwise it calls `onChange(option.value)` and then `onPreviewEnd()`.
  - `onItemHighlighted(option)` calls `option == null ? onPreviewEnd() : onPreview(option.value)`.
  - `onOpenChange(isOpen)` calls `onPreviewEnd()` when `!isOpen`.
  - `useEffect(() => onPreviewEnd, [onPreviewEnd])` runs the cleanup on unmount.
- [ ] **Step 3: Verify.** Run `pnpm verify && pnpm typecheck && pnpm check`. All pass. Then start the app (`astro dev --background`), open `/editor`, edit a stroke and check each of these:
  - The dropdown opens with focus in the search box.
  - Typing "kuf" filters the list to Kufic key.
  - Enter selects it and the stage updates.
  - "zzz" shows the empty message.
  - Escape closes only the dropdown (Review Focus 2).
- [ ] **Step 4: Commit** with `feat(motif-picker): Replace pattern grid with a searchable dropdown`.

### Task 2: Live preview on the frame

**Files:**
- Modify: `src/features/frame/ornamentPatch.ts`, `components/FrameEditor.tsx:173,208-215`, `components/StrokeStack.tsx:36,281-300` and `components/StrokeEditorPopover.tsx`
- Test: `scripts/verify-frame.ts` (append before the final `console.log`)

**Interfaces:**
- Consumes: `MotifField`'s `onPreview` and `onPreviewEnd` from Task 1, `withMotif` (`ornamentPatch.ts:3`) and `defaultOrnamentInk` (`ornament/motif.ts`).
- Produces, in `ornamentPatch.ts`: `export type MotifPreview = { index: number; motif: MotifId | null }` and `export function withMotifPreview(frame: Frame, preview: MotifPreview | null): Frame`.
- Produces: `StrokeEditorPopover` gains the props `onPreviewMotif: (motif: MotifId | null) => void` and `onPreviewEnd: () => void`. `StrokeStack` gains `onPreviewMotif: (index: number, motif: MotifId | null) => void` and `onPreviewEnd: () => void`.

- [ ] **Step 1: Write the failing tests** in `verify-frame.ts`:
  ```ts
  const previewBase = { ...DEFAULT_FRAME, strokes: [{ width: 16, color: '#1a3a3f' }, { width: 4, color: '#c9a227', ornament: customKufic }] };
  assert(withMotifPreview(previewBase, null) === previewBase, 'no preview returns the same frame');
  assert(withMotifPreview(previewBase, { index: 9, motif: 'khatam' }) === previewBase, 'an out-of-range preview is ignored');
  assert(withMotifPreview(previewBase, { index: 0, motif: 'khatam' }).strokes[0]?.ornament?.ink === '#c9a227', 'previewing on a plain stroke uses the default ink');
  assert(withMotifPreview(previewBase, { index: 1, motif: null }).strokes[1]?.ornament === undefined, 'previewing None removes the ornament');
  const previewed = withMotifPreview(previewBase, { index: 1, motif: 'khatam' }).strokes[1]?.ornament;
  assert(previewed?.motif === 'khatam' && previewed.density === 'wide' && previewed.mirror === true, 'a preview keeps the stroke pattern options');
  assert(previewBase.strokes[1]?.ornament?.motif === 'kufic', 'a preview must not mutate the committed frame');
  ```
- [ ] **Step 2: Run the tests.** Run `node --experimental-strip-types scripts/verify-frame.ts`. The expected result is FAIL, because `withMotifPreview` is not exported.
- [ ] **Step 3: Implement `withMotifPreview`.** Use guard clauses: return `frame` when `preview == null` or when there is no stroke at `preview.index`. Otherwise map the strokes and replace that stroke's `ornament` with `withMotif(stroke.ornament, preview.motif, stroke.ornament?.ink ?? defaultOrnamentInk(stroke.color))`.
- [ ] **Step 4: Wire the preview.**
  - `FrameEditor` holds `const [motifPreview, setMotifPreview] = useState<MotifPreview | null>(null)`. It passes `withMotifPreview(frame, motifPreview)` to `FrameStage` only, so export and the URL still use `frame`. It passes stable `useCallback` handlers to `StrokeStack`.
  - `StrokeStack` binds `editingIndex`. Its close (`onClose`) and `handleRemove` paths also call `onPreviewEnd()`.
  - `StrokeEditorPopover` forwards the handlers to `MotifField`.
- [ ] **Step 5: Verify.** Run `pnpm verify && pnpm typecheck && pnpm check`. All pass. In the browser, check each of these:
  - Arrowing through the list repaints the stage on each item.
  - Hovering does the same.
  - Escape, an outside click or closing the editor restores the committed motif.
  - The `?f=` URL does not change until an item is chosen.
- [ ] **Step 6: Commit** with `feat(motif-picker): Preview highlighted patterns live on the frame`.

### Task 3: Angular interlace and step interlace

**Files:**
- Modify: `src/features/frame/ornament/shapes.ts`, `frame.schema.ts:9-18`, `frame.codec.ts:19-28`, `ornament/motif.ts` and `scripts/verify-ornament.ts:77-86` (`SEAMS`)
- Create: `src/features/frame/ornament/angularInterlace.ts` and `ornament/stepInterlace.ts`

**Interfaces:**
- Produces, in `shapes.ts`:
  - `squareQuarterRing(center: Point, inner: number, outer: number): PathCommand[]` is the square analogue of `quarterRing`. It is a closed L about `center` that covers the quadrant toward (0,0). For center (1,1), inner 0.65 and outer 0.85 it is exactly `polygonCommands([(1,.15),(.15,.15),(.15,1),(.35,1),(.35,.35),(1,.35)])`.
  - `flipVertical(vertices: Point[]): Point[]` maps each vertex to `(x, 1-y)` and reverses the order, so the winding is preserved.
- Produces: `MOTIF_IDS` becomes `['khatam','interlace','angularInterlace','stepInterlace','braid','guilloche','lattice','kufic','mihrab','chevron','chain','hexagram','dentil']`. Task 4 fills in the last three new ids. In this task, add only the ids whose files exist. `MOTIF_CODES` adds `angularInterlace: 'a'`, `stepInterlace: 's'`, `braid: 'r'`, `guilloche: 'g'` and `lattice: 'l'`.

- [ ] **Step 1: Write the failing tests.** Add these `SEAMS` entries: `angularInterlace: [[0.15,0.35],[0.65,0.85]]` and `stepInterlace: [[0.15,0.35],[0.65,0.85]]`. Also add these to `verify-ornament.ts`:
  ```ts
  assert(MOTIFS.angularInterlace.label === 'Angular interlace' && !MOTIFS.angularInterlace.isDirectional, 'angular interlace is a symmetric twin of interlace');
  assert(MOTIFS.angularInterlace.tile().every((c) => c.op !== 'C'), 'angular interlace must be all straight segments');
  ```
- [ ] **Step 2: Run the tests.** Run `pnpm typecheck`. The expected result is FAIL, because the `SEAMS` keys are not `MotifId`.
- [ ] **Step 3: Implement both motifs.** Each corner is `[...squareQuarterRing({x:1,y:1}, 0.65, 0.85), ...squareQuarterRing({x:1,y:1}, 0.15, 0.35)]`, and each has `isDirectional: false`.
  - **angularInterlace** ("Angular interlace"). Strand A is `[(0,.15),(.25,.15),(.75,.65),(1,.65),(1,.85),(.75,.85),(.25,.35),(0,.35)]`. Its tile is `polygonCommands(A)` plus `polygonCommands(flipVertical(A))`. The flat shoulders and the diagonal crossing give the sharp corners.
  - **stepInterlace** ("Step interlace"). Strand A is a right-angle staircase: `[(0,.15),(.4,.15),(.4,.4),(.7,.4),(.7,.65),(1,.65),(1,.85),(.6,.85),(.6,.6),(.3,.6),(.3,.35),(0,.35)]`. Its tile is `polygonCommands(A)` plus `polygonCommands(flipVertical(A))`.
- [ ] **Step 4: Register both motifs** in `MOTIF_IDS`, `MOTIFS` and `MOTIF_CODES`. The existing `verify-frame` loops already round-trip every id and check that codes are unique.
- [ ] **Step 5: Verify.** Run `pnpm verify && pnpm typecheck && pnpm check`. All pass. In the browser, put each motif on a 24 px ring. The crossings must be solid (Review Focus 5) and the corners must join the edges. Searching "interlace" lists all three interlaces.
- [ ] **Step 6: Commit** with `feat(frame-ornament): Add angular and step interlace motifs`.

### Task 4: Braid, guilloche and lattice

**Files:**
- Modify: `ornament/shapes.ts`, `frame.schema.ts`, `frame.codec.ts`, `ornament/motif.ts` and `scripts/verify-ornament.ts`
- Create: `ornament/braid.ts`, `ornament/guilloche.ts` and `ornament/lattice.ts`

**Interfaces:**
- Consumes: `circle` and `quarterRing` (`shapes.ts`), `polygonCommands` (`frame.path.ts`) and the codes from Task 3.
- Produces, in `shapes.ts`: `sCurveRibbon(start: [number, number], end: [number, number], x0 = 0, x1 = 1): PathCommand[]`. It is the interlace strand generalized: `M(x0,s0) C((x0+x1)/2,s0)((x0+x1)/2,e0)(x1,e0) L(x1,e1) C(mid,e1)(mid,s1)(x0,s1) Z`. It requires `s0<s1` and `e0<e1`, which makes it clockwise. Refactor `interlace.ts`'s tile to `[...sCurveRibbon([.15,.35],[.65,.85]), ...sCurveRibbon([.65,.85],[.15,.35])]`. Its output is byte-identical, so the existing assertions still pass.

- [ ] **Step 1: Write the failing tests.** Add these `SEAMS` entries: `braid: [[0.1,0.26],[0.42,0.58],[0.74,0.9]]`, `guilloche: [[0.4,0.6]]` and `lattice: [[0,0.14],[0.86,1]]`. Also add:
  ```ts
  assert(MOTIFS.braid.isDirectional, 'a three-strand braid leans one way and must offer mirror');
  assert(toPathData(MOTIFS.lattice.corner()) === toPathData(MOTIFS.lattice.tile()), 'the lattice corner is its own tile');
  ```
- [ ] **Step 2: Run the tests.** Run `pnpm typecheck`. The expected result is FAIL, because of unknown `MotifId` keys.
- [ ] **Step 3: Implement the motifs.**
  - **braid** ("Braid", `isDirectional: true`). Its tile is the three ribbons `sCurveRibbon([.1,.26],[.42,.58])`, `sCurveRibbon([.42,.58],[.74,.9])` and `sCurveRibbon([.74,.9],[.1,.26])`. Its corner is the three `quarterRing({x:1,y:1}, …)` with radii 0.74–0.9, 0.42–0.58 and 0.1–0.26.
  - **guilloche** ("Guilloche", `isDirectional: false`). Its tile has a top arch, `sCurveRibbon([.4,.6],[.1,.26],0,.5)` plus `sCurveRibbon([.1,.26],[.4,.6],.5,1)`. It has a bottom arch, built the same way through `[.74,.9]`. It also has a centre eye ring, `circle(0.14,true)` plus `circle(0.07,false)`. Its corner is `quarterRing({x:1,y:1}, 0.4, 0.6)` plus an eye ring centred at (0.3,0.3) with the same radii.
  - **lattice** ("Lattice", `isDirectional: false`). Strand A is `[(0,0),(.14,0),(1,.86),(1,1),(.86,1),(0,.14)]`. B is A mirrored in x as `(1-x, y)` with its order reversed. The tile is A plus B, and `corner = tile`.
- [ ] **Step 4: Register all three motifs** in `MOTIF_IDS` (order per Task 3), `MOTIFS` and `MOTIF_CODES`.
- [ ] **Step 5: Verify.** Run `pnpm verify && pnpm typecheck && pnpm check`. All pass. Check each motif in the browser on a 24 px ring, in both tight and wide density, for solid crossings and joined corners. Mirror appears only for Braid.
- [ ] **Step 6: Commit** with `feat(frame-ornament): Add braid, guilloche and lattice motifs`.

---

## Verification (end to end)

1. Run `pnpm verify && pnpm typecheck && pnpm check && pnpm build`.
2. Run `astro dev --background`, then open `/editor` and edit a stroke. Then check each of these:
   - Search narrows the list.
   - Arrow keys and hover paint each pattern live.
   - Escape, an outside click or closing the editor reverts the stage.
   - Enter or a click commits the choice and updates `?f=`.
3. Copy the link for a frame using each new motif and reload it. It should decode to the same frame.
4. Open an old v3 link. It should render unchanged.

## Execution

I recommend **Native** (superpowers:executing-plans) with one whole-branch review at the end. There are only four tasks, they run in a straight line, and Tasks 1 and 2 need hands-on browser checks that are easiest to do in-session. Say "subagent-driven" if you'd prefer a fresh reviewer per task.
