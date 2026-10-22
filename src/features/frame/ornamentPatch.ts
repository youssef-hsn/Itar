import { DEFAULT_PATTERN, type MotifId, type Ornament } from './frame.schema.ts';

export function withMotif(
  ornament: Ornament | undefined,
  motif: MotifId | null,
  ink: string,
): Ornament | undefined {
  if (motif == null) {
    return undefined;
  }
  return { ...DEFAULT_PATTERN, ...ornament, motif, ink };
}
