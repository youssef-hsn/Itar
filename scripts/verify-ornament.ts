import { frameGeometry } from '../src/features/frame/frame.geometry.ts';
import { framePaint } from '../src/features/frame/frame.paint.ts';
import {
  fmt,
  type PathCommand,
  rectCommands,
  roundedRectPath,
  toPathData,
} from '../src/features/frame/frame.path.ts';
import { DEFAULT_FRAME, type Frame } from '../src/features/frame/frame.schema.ts';
import { bandInkPath } from '../src/features/frame/ornament/band.ts';
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
  ] as const) {
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

const bandRect = { x: 0, y: 0, width: 200, height: 100 };
const starBand = bandInkPath(bandRect, 20, MOTIFS.khatam);

assert(starBand.length > 0, 'a 20px khatam band should produce ink');
assert(starBand === bandInkPath(bandRect, 20, MOTIFS.khatam), 'band ink must be deterministic');
assert(!starBand.includes('NaN'), 'band ink must not contain NaN');
assert(
  pathNumbers(starBand).every((n) => n >= 0 && n <= 200),
  'band ink must stay inside the outer rect',
);

const kuficMoves = bandInkPath(bandRect, 20, MOTIFS.kufic).match(/M/g)?.length;
assert(kuficMoves === 130, `kufic band should have 130 subpaths, got ${kuficMoves}`);

assert(bandInkPath(bandRect, 3, MOTIFS.khatam) === '', 'bands under 4px should carry no ink');

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
    withRing({ width: 24, color: '#f7f4ec00', ornament: { motif: 'kufic', ink: '#1a3a3f' } }),
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
    withRing({ width: 3, color: '#1a3a3f', ornament: { motif: 'khatam', ink: '#c9a227' } }),
    IMAGE,
  ),
);
assert(thinOps.length === 3, 'a 3px ornamented ring should paint its ground only');
assert(
  thinOps.every((op) => op.clip == null),
  'a ring too thin for ink should carry no clipped op',
);

const ornateGeometry = frameGeometry(
  withRing({ width: 24, color: '#1a3a3f', ornament: { motif: 'interlace', ink: '#c9a227' } }),
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
