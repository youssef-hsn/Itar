import { type Frame, frameSchema } from './frame.schema.ts';

const CODEC_VERSION_PLAIN = 1;
const CODEC_VERSION_NAMED = 2;

function encodeColor(color: string): string {
  return color.slice(1).toLowerCase();
}

function decodeColor(raw: string): string | null {
  if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(raw)) {
    return null;
  }
  return `#${raw.toLowerCase()}`;
}

function encodeName(name: string): string {
  return encodeURIComponent(name).replace(
    /[.~!]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function decodeName(raw: string): string | null {
  try {
    return decodeURIComponent(raw);
  } catch {
    return null;
  }
}

function encodeStrokes(strokes: Frame['strokes']): string {
  return strokes
    .map((stroke) => {
      const body = `${stroke.width}-${encodeColor(stroke.color)}`;
      return stroke.name ? `${body}!${encodeName(stroke.name)}` : body;
    })
    .join('~');
}

function decodeStrokes(raw: string): Frame['strokes'] | null {
  if (raw.length === 0) {
    return [];
  }

  const strokes: Frame['strokes'] = [];

  for (const segment of raw.split('~')) {
    const bang = segment.indexOf('!');
    const body = bang < 0 ? segment : segment.slice(0, bang);
    const nameRaw = bang < 0 ? null : segment.slice(bang + 1);

    const dash = body.indexOf('-');
    if (dash <= 0) {
      return null;
    }

    const width = Number.parseInt(body.slice(0, dash), 10);
    const color = decodeColor(body.slice(dash + 1));

    if (!Number.isInteger(width) || color === null) {
      return null;
    }

    if (nameRaw === null) {
      strokes.push({ width, color });
      continue;
    }

    const name = decodeName(nameRaw);
    if (name === null) {
      return null;
    }

    strokes.push({ width, color, name });
  }

  return strokes;
}

export function encodeFrame(frame: Frame): string {
  const version = frame.strokes.some((stroke) => stroke.name)
    ? CODEC_VERSION_NAMED
    : CODEC_VERSION_PLAIN;
  const matColor = encodeColor(frame.matColor);
  const strokes = encodeStrokes(frame.strokes);
  return `${version}.${frame.padding}.${matColor}.${frame.radius}~${strokes}`;
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

  if (
    (version !== CODEC_VERSION_PLAIN && version !== CODEC_VERSION_NAMED) ||
    !Number.isInteger(padding) ||
    matColor === null
  ) {
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
