import { frameGeometry } from '../src/features/frame/frame.geometry.ts';
import { framePaint } from '../src/features/frame/frame.paint.ts';
import {
  fmt,
  type PathCommand,
  rectCommands,
  roundedRectPath,
  toPathData,
} from '../src/features/frame/frame.path.ts';
import {
  CORNER_STYLES,
  DEFAULT_FRAME,
  DEFAULT_PATTERN,
  type Frame,
  type MotifId,
} from '../src/features/frame/frame.schema.ts';
import { bandInkPath } from '../src/features/frame/ornament/band.ts';
import { cornerCommands } from '../src/features/frame/ornament/cornerStyle.ts';
import { defaultOrnamentInk, MOTIFS } from '../src/features/frame/ornament/motif.ts';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function commandPoints(command: PathCommand): { x: number; y: number }[] {
  switch (command.op) {
    case 'M':
    case 'L':
      return [command.to];
    case 'Q':
      return [command.c, command.to];
    case 'C':
      return [command.c1, command.c2, command.to];
    case 'Z':
      return [];
  }
}

function pathNumbers(d: string): number[] {
  return (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
}

assert(fmt(-0) === '0', 'fmt must print -0 as 0');
const firstFmt = fmt(1.005);
assert(firstFmt === fmt(1.005), 'fmt must be stable across calls');
assert(fmt(2.345678) === '2.35', 'fmt should round to two decimals');

assert(
  toPathData(rectCommands(0, 0, 2, 1)) === 'M0 0L2 0L2 1L0 1Z',
  'rectCommands should trace a clockwise rect',
);

assert(
  roundedRectPath(0, 0, 10, 10, 0) === 'M0 0L10 0L10 10L0 10Z',
  'a zero radius should emit plain line segments',
);
assert(
  roundedRectPath(0, 0, 10, 4, 9).includes('A2 2 0 0 1'),
  'the corner radius should clamp to half the shorter side',
);

for (const motif of Object.values(MOTIFS)) {
  for (const [part, commands] of [
    ['tile', motif.tile()],
    ['corner', motif.corner()],
    ...CORNER_STYLES.map((style) => [`${style} corner`, cornerCommands(style, motif)] as const),
  ] as const) {
    if (commands.length === 0) {
      continue;
    }
    assert(commands.at(-1)?.op === 'Z', `${motif.id} ${part} must end closed`);
    for (const point of commands.flatMap(commandPoints)) {
      assert(
        Number.isFinite(point.x) && Number.isFinite(point.y),
        `${motif.id} ${part} has a non-finite point`,
      );
      assert(
        point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1,
        `${motif.id} ${part} point (${point.x}, ${point.y}) leaves the unit tile`,
      );
    }
  }
}

const SEAMS: Record<MotifId, [number, number][]> = {
  khatam: [],
  interlace: [
    [0.15, 0.35],
    [0.65, 0.85],
  ],
  angularInterlace: [
    [0.15, 0.35],
    [0.65, 0.85],
  ],
  stepInterlace: [
    [0.15, 0.35],
    [0.65, 0.85],
  ],
  braid: [
    [0.1, 0.26],
    [0.42, 0.58],
    [0.74, 0.9],
  ],
  guilloche: [[0.4, 0.6]],
  lattice: [
    [0, 0.14],
    [0.86, 1],
  ],
  kufic: [[0.85, 1]],
  mihrab: [],
  chevron: [[0.25, 0.45]],
  chain: [[0.45, 0.55]],
  hexagram: [],
  dentil: [[0.8, 1]],
};

function hasPoint(points: { x: number; y: number }[], x: number, y: number): boolean {
  return points.some((point) => Math.abs(point.x - x) < 1e-6 && Math.abs(point.y - y) < 1e-6);
}

function sortedKeys(points: { x: number; y: number }[]): string[] {
  const keys = points.map((point) => `${point.x.toFixed(6)},${point.y.toFixed(6)}`);
  return [...new Set(keys)].sort();
}

for (const motif of Object.values(MOTIFS)) {
  const tilePoints = motif.tile().flatMap(commandPoints);
  const cornerPoints = motif.corner().flatMap(commandPoints);
  const transposed = cornerPoints.map((point) => ({ x: point.y, y: point.x }));
  assert(
    sortedKeys(cornerPoints).join('|') === sortedKeys(transposed).join('|'),
    `${motif.id} corner must be symmetric about the diagonal`,
  );
  for (const [a, b] of SEAMS[motif.id]) {
    assert(
      hasPoint(tilePoints, 0, a) &&
        hasPoint(tilePoints, 0, b) &&
        hasPoint(tilePoints, 1, a) &&
        hasPoint(tilePoints, 1, b) &&
        hasPoint(cornerPoints, 1, a) &&
        hasPoint(cornerPoints, 1, b) &&
        hasPoint(cornerPoints, a, 1) &&
        hasPoint(cornerPoints, b, 1),
      `${motif.id} corner must meet the ${a}–${b} seam`,
    );
  }
}

assert(
  MOTIFS.angularInterlace.label === 'Angular interlace' && !MOTIFS.angularInterlace.isDirectional,
  'angular interlace is a symmetric twin of interlace',
);
assert(
  MOTIFS.angularInterlace.tile().every((command) => command.op !== 'C'),
  'angular interlace must be all straight segments',
);

assert(MOTIFS.braid.isDirectional, 'a three-strand braid leans one way and must offer mirror');
assert(
  toPathData(MOTIFS.lattice.corner()) === toPathData(MOTIFS.lattice.tile()),
  'the lattice corner is its own tile',
);

const bandRect = { x: 0, y: 0, width: 200, height: 100 };
const khatamPattern = { ...DEFAULT_PATTERN, motif: 'khatam' } as const;
const kuficPattern = { ...DEFAULT_PATTERN, motif: 'kufic' } as const;
const starBand = bandInkPath(bandRect, 20, khatamPattern);

assert(starBand.length > 0, 'a 20px khatam band should produce ink');
assert(starBand === bandInkPath(bandRect, 20, khatamPattern), 'band ink must be deterministic');
assert(!starBand.includes('NaN'), 'band ink must not contain NaN');
assert(
  pathNumbers(starBand).every((n) => n >= 0 && n <= 200),
  'band ink must stay inside the outer rect',
);

const kuficMoves = bandInkPath(bandRect, 20, kuficPattern).match(/M/g)?.length;
assert(kuficMoves === 134, `kufic band should have 134 subpaths, got ${kuficMoves}`);

assert(bandInkPath(bandRect, 3, khatamPattern) === '', 'bands under 4px should carry no ink');

function pointsOf(d: string): { x: number; y: number }[] {
  const numbers = pathNumbers(d);
  return Array.from({ length: numbers.length / 2 }, (_, index) => ({
    x: numbers[2 * index] as number,
    y: numbers[2 * index + 1] as number,
  }));
}

function subpaths(pattern: Parameters<typeof bandInkPath>[2], rect = bandRect): number | undefined {
  return bandInkPath(rect, 20, pattern).match(/M/g)?.length;
}

const tightCount = subpaths({ ...kuficPattern, density: 'tight' });
assert(tightCount === 174, `tight kufic should have 174 subpaths, got ${tightCount}`);
const wideCount = subpaths({ ...kuficPattern, density: 'wide' });
assert(wideCount === 94, `wide kufic should have 94 subpaths, got ${wideCount}`);

function topEdgeKeys(pattern: Parameters<typeof bandInkPath>[2], isReflected: boolean): string[] {
  return pointsOf(bandInkPath(bandRect, 20, pattern))
    .filter((point) => point.y < 20)
    .map((point) => `${fmt(isReflected ? 200 - point.x : point.x)},${fmt(point.y)}`)
    .sort();
}

const mirroredTop = topEdgeKeys({ ...kuficPattern, mirror: true }, false);
assert(
  mirroredTop.join('|') === topEdgeKeys({ ...kuficPattern, mirror: true }, true).join('|'),
  'a mirrored top edge must equal its own reflection',
);
assert(
  topEdgeKeys(kuficPattern, false).join('|') !== topEdgeKeys(kuficPattern, true).join('|'),
  'an unmirrored top edge must differ from its reflection',
);

const oddRect = { x: 0, y: 0, width: 220, height: 100 };
const oddMirroredTop = pointsOf(bandInkPath(oddRect, 20, { ...kuficPattern, mirror: true }))
  .filter((point) => point.y < 20)
  .map((point) => point.x);
assert(
  [...new Set(oddMirroredTop.map(fmt))].sort().join('|') ===
    [...new Set(oddMirroredTop.map((x) => fmt(220 - x)))].sort().join('|'),
  'a mirrored top edge with an odd tile count must stay symmetric',
);

function subpathShapes(d: string): string {
  return d
    .split('M')
    .filter((subpath) => subpath !== '')
    .map((subpath) => sortedKeys(pointsOf(subpath)).join(' '))
    .sort()
    .join('|');
}

const evenRect = { x: 0, y: 0, width: 200, height: 120 };
for (const motif of Object.values(MOTIFS)) {
  const mirrored = subpathShapes(
    bandInkPath(evenRect, 20, { ...kuficPattern, motif: motif.id, mirror: true }),
  );
  const plain = subpathShapes(
    bandInkPath(evenRect, 20, { ...kuficPattern, motif: motif.id, mirror: false }),
  );
  assert(
    motif.isDirectional === (mirrored !== plain),
    `${motif.id} isDirectional must match whether mirror changes its ink`,
  );
}

const shortRect = { x: 0, y: 0, width: 60, height: 60 };
const shortMirrored = bandInkPath(shortRect, 20, { ...kuficPattern, mirror: true });
assert(
  shortMirrored === bandInkPath(shortRect, 20, kuficPattern),
  'a lone tile must stay unmirrored',
);
assert(!shortMirrored.includes('NaN'), 'a short mirrored band must not contain NaN');

const plainCorners = { ...kuficPattern, corner: 'none' } as const;
const plainCount = subpaths(plainCorners);
assert(plainCount === 110, `kufic with plain corners should have 110 subpaths, got ${plainCount}`);
assert(
  bandInkPath({ x: 0, y: 0, width: 40, height: 40 }, 20, plainCorners) === '',
  'a band with no tiles and plain corners should carry no ink',
);
for (const corner of ['rosette', 'block'] as const) {
  const ink = bandInkPath(bandRect, 20, { ...kuficPattern, corner });
  assert(
    pointsOf(ink).every((p) => p.x >= 0 && p.x <= 200 && p.y >= 0 && p.y <= 100),
    `${corner} corners must stay inside the outer rect`,
  );
  assert(ink !== bandInkPath(bandRect, 20, kuficPattern), `${corner} corners must change the ink`);
}

const emptyInkOps = framePaint(
  frameGeometry(
    {
      ...DEFAULT_FRAME,
      padding: 0,
      strokes: [
        {
          width: 20,
          color: '#1a3a3f00',
          ornament: { ...plainCorners, ink: '#c9a227' },
        },
      ],
    },
    { width: 0, height: 0 },
  ),
);
assert(
  emptyInkOps.every((op) => op.clip == null),
  'an ornamented ring with empty ink should carry no clipped op',
);

const motifCornerOps = framePaint(
  frameGeometry(
    {
      ...DEFAULT_FRAME,
      padding: 0,
      strokes: [
        {
          width: 20,
          color: '#1a3a3f00',
          ornament: { ...plainCorners, corner: 'motif', ink: '#c9a227' },
        },
      ],
    },
    { width: 0, height: 0 },
  ),
);
assert(
  motifCornerOps.some((op) => op.clip != null),
  'an ornamented ring with motif corners should carry a clipped op',
);

const IMAGE = { width: 480, height: 360 };
const plainGeometry = frameGeometry(DEFAULT_FRAME, IMAGE);
const plainOps = framePaint(plainGeometry);

assert(plainOps.length === 4, `default frame should paint 3 rings + mat, got ${plainOps.length}`);
assert(plainOps.at(-1)?.fill === plainGeometry.matColor, 'the mat should paint last');
assert(
  plainOps.every((op) => !op.d.includes('A')),
  'a zero-radius frame should keep square ring corners',
);
assert(
  framePaint(frameGeometry({ ...DEFAULT_FRAME, radius: 12 }, IMAGE))[0]?.d.includes('A'),
  'a rounded frame should round its rings',
);

const withRing = (ring: Frame['strokes'][number]): Frame => ({
  ...DEFAULT_FRAME,
  strokes: [ring, { width: 4, color: '#c9a227' }],
});

const transparentOps = framePaint(
  frameGeometry(
    withRing({
      width: 24,
      color: '#f7f4ec00',
      ornament: { ...DEFAULT_PATTERN, motif: 'kufic', ink: '#1a3a3f' },
    }),
    IMAGE,
  ),
);
assert(transparentOps.length === 3, 'a transparent ornamented ring should paint ink only');
const inkOp = transparentOps.find((op) => op.clip != null);
assert(inkOp?.fill === '#1a3a3f', 'ornament ink should be clipped to its ring');
assert(
  transparentOps.every((op) => op.fill !== '#f7f4ec00'),
  'a transparent ground should not paint',
);

const thinOps = framePaint(
  frameGeometry(
    withRing({
      width: 3,
      color: '#1a3a3f',
      ornament: { ...DEFAULT_PATTERN, motif: 'khatam', ink: '#c9a227' },
    }),
    IMAGE,
  ),
);
assert(thinOps.length === 3, 'a 3px ornamented ring should paint its ground only');
assert(
  thinOps.every((op) => op.clip == null),
  'a ring too thin for ink should carry no clipped op',
);

const ornateGeometry = frameGeometry(
  withRing({
    width: 24,
    color: '#1a3a3f',
    ornament: { ...DEFAULT_PATTERN, motif: 'interlace', ink: '#c9a227' },
  }),
  IMAGE,
);
const firstPaint = JSON.stringify(framePaint(ornateGeometry));
assert(
  firstPaint === JSON.stringify(framePaint(ornateGeometry)),
  'paint ops must be deterministic',
);
assert(framePaint(ornateGeometry).length === 4, 'an ornate ring should paint ground + ink');

assert(defaultOrnamentInk('#1a3a3f') === '#c9a227', 'a dark ground should default to gilt ink');
assert(
  defaultOrnamentInk('#C9A227') !== '#c9a227',
  'a gilt ground must not default to the same gilt ink',
);
assert(
  defaultOrnamentInk('#c9a22780') !== '#c9a227',
  'ground alpha must not hide a same-colour clash',
);

console.log('ornament verify: ok');
