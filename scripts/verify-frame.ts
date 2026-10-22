import { classifyDropAsset } from '../src/features/frame/dropAssets.ts';
import { decodeFrame, encodeFrame, MOTIF_CODES } from '../src/features/frame/frame.codec.ts';
import { frameCss, frameMatCss } from '../src/features/frame/frame.css.ts';
import { frameGeometry } from '../src/features/frame/frame.geometry.ts';
import {
  DEFAULT_FRAME,
  DEFAULT_PATTERN,
  frameSchema,
  MOTIF_IDS,
  PRESETS,
} from '../src/features/frame/frame.schema.ts';
import { withMotif, withMotifPreview } from '../src/features/frame/ornamentPatch.ts';
import {
  strokeDisplayName,
  strokeSpecLine,
  strokeSwatchHeight,
} from '../src/features/frame/strokeLabel.ts';

const alphaGapFrame = {
  padding: 20,
  matColor: '#f7f4ec',
  radius: 0,
  roundImage: false,
  strokes: [
    { width: 8, color: '#1a3a3f' },
    { width: 6, color: '#f7f4ec00' },
    { width: 4, color: '#c9a227' },
  ],
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function verifyRoundTrip(label: string, frame: typeof DEFAULT_FRAME): void {
  const encoded = encodeFrame(frame);
  const decoded = decodeFrame(encoded);
  assert(decoded !== null, `${label}: decode returned null`);
  assert(encodeFrame(decoded) === encoded, `${label}: round-trip mismatch`);
}

verifyRoundTrip('DEFAULT_FRAME', DEFAULT_FRAME);
verifyRoundTrip('alpha-gap frame', alphaGapFrame);

assert(decodeFrame('not-a-frame') === null, 'garbage input should decode to null');
assert(decodeFrame('') === null, 'empty input should decode to null');

assert(classifyDropAsset('image/png') === 'accept', 'png should accept');
assert(classifyDropAsset('video/mp4') === 'reject', 'mp4 should reject');
assert(classifyDropAsset('image/svg+xml') === 'reject', 'svg should reject');
assert(classifyDropAsset('') === 'unknown', 'blank type should be unknown');

assert(
  encodeFrame(DEFAULT_FRAME) === '1.24.f7f4ec.0~16-1a3a3f~4-c9a227~2-1a3a3f',
  'DEFAULT_FRAME codec should match brief example',
);

const namedFrame = {
  padding: 24,
  matColor: '#f7f4ec',
  radius: 0,
  roundImage: false,
  strokes: [
    { width: 16, color: '#1a3a3f', name: 'Outer band' },
    { width: 4, color: '#c9a227' },
    { width: 2, color: '#1a3a3f', name: 'Hair~line.!' },
  ],
};

verifyRoundTrip('named frame', namedFrame);

assert(encodeFrame(namedFrame).startsWith('2.'), 'named frames should encode as codec v2');

assert(
  decodeFrame('1.24.f7f4ec.0~16-1a3a3f~4-c9a227~2-1a3a3f') !== null,
  'legacy v1 links should still decode',
);

assert(
  decodeFrame('5.24.f7f4ec.0~16-1a3a3f') === null,
  'unknown codec versions should be rejected',
);

const overlongName = {
  ...DEFAULT_FRAME,
  strokes: [{ width: 4, color: '#1a3a3f', name: 'x'.repeat(25) }],
};

assert(
  decodeFrame(encodeFrame(overlongName)) === null,
  'names longer than 24 characters should be rejected',
);

const decodedNames = decodeFrame(encodeFrame(namedFrame))?.strokes.map((stroke) => stroke.name);

assert(
  JSON.stringify(decodedNames) === JSON.stringify(['Outer band', undefined, 'Hair~line.!']),
  'names should survive a codec round trip, delimiters included',
);

assert(
  strokeDisplayName({ width: 4, color: '#1a3a3f' }, 2) === 'Stroke 2',
  'unnamed strokes should fall back to their position label',
);

assert(
  strokeDisplayName({ width: 4, color: '#1a3a3f', name: '  Gilt line ' }, 2) === 'Gilt line',
  'named strokes should show the trimmed name',
);

assert(
  strokeDisplayName({ width: 4, color: '#1a3a3f', name: '   ' }, 3) === 'Stroke 3',
  'whitespace-only names should fall back to the position label',
);

assert(
  strokeSpecLine({ width: 4, color: '#1a3a3f' }) === '4 px',
  'opaque strokes should omit the alpha suffix',
);

assert(
  strokeSpecLine({ width: 6, color: '#f7f4ec00' }) === '6 px · gap',
  'zero-alpha strokes should read as gaps',
);

assert(
  strokeSpecLine({ width: 4, color: '#c9a22780' }) === '4 px · 50%',
  'partial alpha should render as a percentage',
);

assert(strokeSwatchHeight({ width: 0, color: '#1a3a3f' }) === 2, 'swatch height should floor at 2');
assert(
  strokeSwatchHeight({ width: 200, color: '#1a3a3f' }) === 24,
  'swatch height should cap at 24',
);

const previewGeometry = frameGeometry(DEFAULT_FRAME, { width: 480, height: 360 });
const previewCss = frameCss(previewGeometry);

assert(
  previewCss.margin === previewGeometry.totalThickness,
  'frame CSS must inset by stroke thickness so box-shadows fit composedSize',
);
assert(previewCss.overflow === 'hidden', 'frame CSS must clip the inner image to the rounded mat');

assert(
  decodeFrame('1.24.f7f4ec.12i~16-1a3a3f')?.roundImage === true,
  'radius token suffix i should set roundImage',
);
assert(
  decodeFrame('1.24.f7f4ec.12i~16-1a3a3f')?.radius === 12,
  'i suffix must not change the numeric radius',
);
assert(
  decodeFrame('1.24.f7f4ec.0~16-1a3a3f~4-c9a227~2-1a3a3f')?.roundImage === false,
  'legacy links default roundImage to false',
);

const rounded = { ...DEFAULT_FRAME, radius: 12, roundImage: true };
assert(encodeFrame(rounded).includes('.12i~'), 'roundImage should encode as radius i suffix');
verifyRoundTrip('roundImage frame', rounded);

const decodedRounded = decodeFrame('1.24.f7f4ec.12i~16-1a3a3f');
assert(
  decodedRounded !== null && encodeFrame(decodedRounded) === '1.24.f7f4ec.12i~16-1a3a3f',
  'i-suffix frames should round-trip',
);

const ornateStrokeFrame = (ornament: { motif: string; ink: string }) => ({
  ...DEFAULT_FRAME,
  strokes: [{ width: 24, color: '#1a3a3f', ornament }],
});

const parsedOrnate = frameSchema.safeParse(ornateStrokeFrame({ motif: 'khatam', ink: '#c9a227' }));
assert(
  parsedOrnate.success && parsedOrnate.data.strokes[0]?.ornament?.motif === 'khatam',
  'strokes should keep a valid ornament',
);
assert(
  !frameSchema.safeParse(ornateStrokeFrame({ motif: 'paisley', ink: '#c9a227' })).success,
  'unknown motifs should be rejected',
);
assert(
  !frameSchema.safeParse(ornateStrokeFrame({ motif: 'khatam', ink: 'gold' })).success,
  'non-hex ornament ink should be rejected',
);

const ornateFrame = {
  ...DEFAULT_FRAME,
  strokes: [
    {
      width: 16,
      color: '#1a3a3f',
      ornament: { ...DEFAULT_PATTERN, motif: 'khatam' as const, ink: '#c9a227' },
    },
    { width: 4, color: '#c9a227', name: 'Gilt' },
  ],
};

verifyRoundTrip('ornate frame', ornateFrame);

for (const id of MOTIF_IDS) {
  verifyRoundTrip(`${id} ornament`, {
    ...DEFAULT_FRAME,
    strokes: [
      { width: 16, color: '#1a3a3f', ornament: { ...DEFAULT_PATTERN, motif: id, ink: '#c9a227' } },
    ],
  });
}

const patternedFrame = {
  ...DEFAULT_FRAME,
  strokes: [
    {
      width: 16,
      color: '#1a3a3f',
      ornament: {
        ...DEFAULT_PATTERN,
        motif: 'kufic' as const,
        ink: '#c9a227',
        corner: 'rosette' as const,
        density: 'wide' as const,
        mirror: true,
      },
    },
  ],
};
assert(
  encodeFrame(patternedFrame).includes('*qc9a227:rw1'),
  'pattern options should encode as a : suffix',
);
assert(
  encodeFrame(patternedFrame).startsWith('4.'),
  'a pattern suffix should raise the codec to v4',
);
verifyRoundTrip('patterned frame', patternedFrame);

const legacyOrnate = decodeFrame('3.24.f7f4ec.0~16-1a3a3f*kc9a227~4-c9a227!Gilt');
assert(
  JSON.stringify(legacyOrnate?.strokes[0]?.ornament) ===
    JSON.stringify({ motif: 'khatam', ink: '#c9a227', ...DEFAULT_PATTERN }),
  'v3 ornaments should decode with the default pattern options',
);
assert(
  legacyOrnate !== null &&
    encodeFrame(legacyOrnate) === '3.24.f7f4ec.0~16-1a3a3f*kc9a227~4-c9a227!Gilt',
  'v3 links should re-encode unchanged',
);
assert(
  decodeFrame('3.24.f7f4ec.0~16-1a3a3f*kc9a227:rw1')?.strokes[0]?.ornament?.corner === 'rosette',
  'the pattern suffix should decode on any version',
);

for (const suffix of [':x', ':mr', ':mrq1', ':zr1', ':mrr', ':']) {
  assert(
    decodeFrame(`4.24.f7f4ec.0~16-1a3a3f*kc9a227${suffix}`) === null,
    `malformed pattern suffix ${suffix} should decode to null`,
  );
}

assert(
  new Set(Object.values(MOTIF_CODES)).size === MOTIF_IDS.length,
  'every motif needs a unique codec code',
);

assert(
  encodeFrame(ornateFrame) === '3.24.f7f4ec.0~16-1a3a3f*kc9a227~4-c9a227!Gilt',
  'ornamented frames should encode as codec v3 with a * suffix',
);
assert(
  encodeFrame(DEFAULT_FRAME) === '1.24.f7f4ec.0~16-1a3a3f~4-c9a227~2-1a3a3f',
  'plain frames should stay on codec v1',
);

for (const broken of [
  '3.24.f7f4ec.0~16-1a3a3f*zc9a227',
  '3.24.f7f4ec.0~16-1a3a3f*k',
  '3.24.f7f4ec.0~16-1a3a3f*',
  '3.24.f7f4ec.0~16-1a3a3f*kgg0000',
]) {
  assert(decodeFrame(broken) === null, `malformed ornament ${broken} should decode to null`);
}

const starName = {
  ...DEFAULT_FRAME,
  strokes: [{ width: 4, color: '#1a3a3f', name: 'a*b' }],
};
verifyRoundTrip('star in name', starName);
assert(
  decodeFrame(encodeFrame(starName))?.strokes[0]?.name === 'a*b',
  'a * inside a name must not be read as an ornament',
);

assert(
  decodeFrame('x.24.f7f4ec.0~16-1a3a3f') === null,
  'non-numeric codec versions should be rejected',
);

const matCss = frameMatCss(previewGeometry);
assert(matCss.boxShadow === undefined, 'mat CSS must not paint rings as box-shadows');
assert(
  matCss.margin === previewGeometry.totalThickness,
  'mat CSS must inset by stroke thickness so the ring SVG fits composedSize',
);

assert(
  strokeSpecLine({
    width: 24,
    color: '#1a3a3f',
    ornament: { ...DEFAULT_PATTERN, motif: 'kufic', ink: '#c9a227' },
  }) === '24 px · Kufic key',
  'ornamented strokes should name their pattern',
);
assert(
  strokeSpecLine({
    width: 24,
    color: '#1a3a3f00',
    ornament: { ...DEFAULT_PATTERN, motif: 'kufic', ink: '#c9a227' },
  }) === '24 px · Kufic key',
  'a transparent-ground ornament is a pattern, not a gap',
);

for (const preset of PRESETS) {
  verifyRoundTrip(`preset ${preset.id}`, preset.frame);
}
assert(
  PRESETS.some((preset) => preset.frame.strokes.some((stroke) => stroke.ornament)),
  'at least one preset should carry an ornament',
);

const customKufic = {
  ...DEFAULT_PATTERN,
  motif: 'kufic' as const,
  ink: '#c9a227',
  corner: 'rosette' as const,
  density: 'wide' as const,
  mirror: true,
};
const switched = withMotif(customKufic, 'khatam', '#c9a227');
assert(
  switched?.motif === 'khatam' &&
    switched.corner === 'rosette' &&
    switched.density === 'wide' &&
    switched.mirror === true,
  'switching motif must keep corner, density and mirror',
);
assert(
  withMotif(customKufic, null, '#c9a227') === undefined,
  'clearing the motif drops the ornament',
);
const fresh = withMotif(undefined, 'khatam', '#c9a227');
assert(
  JSON.stringify(fresh) === JSON.stringify({ ...DEFAULT_PATTERN, motif: 'khatam', ink: '#c9a227' }),
  'a first motif must start from the default pattern',
);

const previewBase = {
  ...DEFAULT_FRAME,
  strokes: [
    { width: 16, color: '#1a3a3f' },
    { width: 4, color: '#c9a227', ornament: customKufic },
  ],
};
assert(withMotifPreview(previewBase, null) === previewBase, 'no preview returns the same frame');
assert(
  withMotifPreview(previewBase, { index: 9, motif: 'khatam' }) === previewBase,
  'an out-of-range preview is ignored',
);
assert(
  withMotifPreview(previewBase, { index: 0, motif: 'khatam' }).strokes[0]?.ornament?.ink ===
    '#c9a227',
  'previewing on a plain stroke uses the default ink',
);
assert(
  withMotifPreview(previewBase, { index: 1, motif: null }).strokes[1]?.ornament === undefined,
  'previewing None removes the ornament',
);
const previewed = withMotifPreview(previewBase, { index: 1, motif: 'khatam' }).strokes[1]?.ornament;
assert(
  previewed?.motif === 'khatam' && previewed.density === 'wide' && previewed.mirror === true,
  'a preview keeps the stroke pattern options',
);
assert(
  previewBase.strokes[1]?.ornament?.motif === 'kufic',
  'a preview must not mutate the committed frame',
);

console.log('frame verify: ok');
