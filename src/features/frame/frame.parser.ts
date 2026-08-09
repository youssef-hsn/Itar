import { createParser } from 'nuqs';
import { decodeFrame, encodeFrame } from './frame.codec.ts';

export const frameParser = createParser({
  parse: decodeFrame,
  serialize: encodeFrame,
  eq: (a, b) => encodeFrame(a) === encodeFrame(b),
});
