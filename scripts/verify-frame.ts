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

console.log('frame verify: ok');
