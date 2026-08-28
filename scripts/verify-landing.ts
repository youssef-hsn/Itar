import { classifyDragTypes } from '../src/features/frame/hooks/useDropTarget.ts';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

assert(classifyDragTypes(false, []).state === 'idle', 'a drag with no files should be idle');
assert(classifyDragTypes(true, ['image/png']).state === 'accept', 'png should accept');
assert(classifyDragTypes(true, ['image/svg+xml']).state === 'reject', 'svg should reject');
assert(
  classifyDragTypes(true, ['image/svg+xml']).rejectedMime === 'image/svg+xml',
  'reject should report the offending mime',
);
assert(
  classifyDragTypes(true, ['image/svg+xml', 'image/png']).state === 'accept',
  'a mixed drag with one acceptable file should accept',
);
assert(
  classifyDragTypes(true, ['']).state === 'accept',
  'an unknown-type drag should optimistically accept',
);

console.log('landing assertions passed');
