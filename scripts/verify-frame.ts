import { classifyDropAsset } from '../src/features/frame/dropAssets.ts';
import { decodeFrame, encodeFrame } from '../src/features/frame/frame.codec.ts';
import { DEFAULT_FRAME } from '../src/features/frame/frame.schema.ts';

const alphaGapFrame = {
  padding: 20,
  matColor: '#f7f4ec',
  radius: 0,
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
  decodeFrame('3.24.f7f4ec.0~16-1a3a3f') === null,
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

console.log('frame verify: ok');
