import { DEFAULT_PATTERN, type Frame, type MotifId, type Ornament } from './frame.schema.ts';
import { defaultOrnamentInk } from './ornament/motif.ts';

export type MotifPreview = { index: number; motif: MotifId | null };

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

export function withMotifPreview(frame: Frame, preview: MotifPreview | null): Frame {
  if (preview == null || frame.strokes[preview.index] == null) {
    return frame;
  }
  return {
    ...frame,
    strokes: frame.strokes.map((stroke, index) =>
      index === preview.index
        ? {
            ...stroke,
            ornament: withMotif(
              stroke.ornament,
              preview.motif,
              stroke.ornament?.ink ?? defaultOrnamentInk(stroke.color),
            ),
          }
        : stroke,
    ),
  };
}
