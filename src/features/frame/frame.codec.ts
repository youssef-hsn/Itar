import { type Frame, frameSchema } from './frame.schema.ts';

const CODEC_VERSION = 1;

function encodeColor(color: string): string {
  return color.slice(1).toLowerCase();
}

function decodeColor(raw: string): string | null {
  if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(raw)) {
    return null;
  }
  return `#${raw.toLowerCase()}`;
}

function encodeStrokes(strokes: Frame['strokes']): string {
  return strokes.map((stroke) => `${stroke.width}-${encodeColor(stroke.color)}`).join('~');
}

function decodeStrokes(raw: string): Frame['strokes'] | null {
  if (raw.length === 0) {
    return [];
  }

  const strokes: Frame['strokes'] = [];

  for (const segment of raw.split('~')) {
    const dash = segment.indexOf('-');
    if (dash <= 0) {
      return null;
    }

    const width = Number.parseInt(segment.slice(0, dash), 10);
    const color = decodeColor(segment.slice(dash + 1));

    if (!Number.isInteger(width) || color === null) {
      return null;
    }

    strokes.push({ width, color });
  }

  return strokes;
}

export function encodeFrame(frame: Frame): string {
  const matColor = encodeColor(frame.matColor);
  const strokes = encodeStrokes(frame.strokes);
  return `${CODEC_VERSION}.${frame.padding}.${matColor}.${frame.radius}~${strokes}`;
}

export function decodeFrame(raw: string): Frame | null {
  const parts = raw.split('.');
  if (parts.length !== 4) {
    return null;
  }

  const [versionRaw, paddingRaw, matColorRaw, radiusAndStrokes] = parts;
  const version = Number.parseInt(versionRaw, 10);
  const padding = Number.parseInt(paddingRaw, 10);
  const matColor = decodeColor(matColorRaw);

  if (version !== CODEC_VERSION || !Number.isInteger(padding) || matColor === null) {
    return null;
  }

  const tilde = radiusAndStrokes.indexOf('~');
  if (tilde < 0) {
    return null;
  }

  const radius = Number.parseInt(radiusAndStrokes.slice(0, tilde), 10);
  const strokesRaw = radiusAndStrokes.slice(tilde + 1);
  const strokes = decodeStrokes(strokesRaw);

  if (!Number.isInteger(radius) || strokes === null) {
    return null;
  }

  const parsed = frameSchema.safeParse({
    padding,
    matColor,
    radius,
    strokes,
  });

  return parsed.success ? parsed.data : null;
}
