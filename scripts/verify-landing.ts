import { readFileSync } from 'node:fs';
import { PRESETS } from '../src/features/frame/frame.schema.ts';
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

const galleryCopy = readFileSync('src/features/landing/components/PresetGallery.tsx', 'utf8');
assert(!/all four/.test(galleryCopy), 'gallery copy must not hard-code the preset count');

const whyCopy = readFileSync('src/features/landing/components/WhyItExists.astro', 'utf8').replace(
  /\s+/g,
  ' ',
);
for (const preset of PRESETS) {
  assert(whyCopy.includes(preset.name), `Why-it-exists copy should name the ${preset.name} preset`);
}

console.log('landing assertions passed');
