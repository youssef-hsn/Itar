import { type Frame, frameSchema, type MotifId, type Ornament } from './frame.schema.ts';

const CODEC_VERSION_PLAIN = 1;
const CODEC_VERSION_NAMED = 2;
export const CODEC_VERSION_ORNATE = 3;

export const MOTIF_CODES: Record<MotifId, string> = {
  khatam: 'k',
  interlace: 'b',
  kufic: 'q',
  mihrab: 'm',
  chevron: 'v',
  chain: 'o',
  hexagram: 'h',
  dentil: 'd',
};

const MOTIF_BY_CODE = new Map(
  Object.entries(MOTIF_CODES).map(([motif, code]) => [code, motif as MotifId]),
);

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

function encodeOrnament(ornament: Ornament): string {
  return `*${MOTIF_CODES[ornament.motif]}${encodeColor(ornament.ink)}`;
}

function decodeOrnament(raw: string): Ornament | null {
  const motif = MOTIF_BY_CODE.get(raw.slice(0, 1));
  const ink = decodeColor(raw.slice(1));
  if (motif == null || ink === null) {
    return null;
  }
  return { motif, ink };
}

function encodeStrokes(strokes: Frame['strokes']): string {
  return strokes
    .map((stroke) => {
      const ornament = stroke.ornament ? encodeOrnament(stroke.ornament) : '';
      const body = `${stroke.width}-${encodeColor(stroke.color)}${ornament}`;
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
    const head = bang < 0 ? segment : segment.slice(0, bang);
    const nameRaw = bang < 0 ? null : segment.slice(bang + 1);
    const star = head.indexOf('*');
    const body = star < 0 ? head : head.slice(0, star);
    const ornament = star < 0 ? null : decodeOrnament(head.slice(star + 1));

    if (star >= 0 && ornament === null) {
      return null;
    }

    const dash = body.indexOf('-');
    if (dash <= 0) {
      return null;
    }

    const width = Number.parseInt(body.slice(0, dash), 10);
    const color = decodeColor(body.slice(dash + 1));

    if (!Number.isInteger(width) || color === null) {
      return null;
    }

    const name = nameRaw === null ? null : decodeName(nameRaw);
    if (nameRaw !== null && name === null) {
      return null;
    }

    strokes.push({
      width,
      color,
      ...(name === null ? {} : { name }),
      ...(ornament === null ? {} : { ornament }),
    });
  }

  return strokes;
}

export function encodeFrame(frame: Frame): string {
  const version = frame.strokes.some((stroke) => stroke.ornament)
    ? CODEC_VERSION_ORNATE
    : frame.strokes.some((stroke) => stroke.name)
      ? CODEC_VERSION_NAMED
      : CODEC_VERSION_PLAIN;
  const matColor = encodeColor(frame.matColor);
  const strokes = encodeStrokes(frame.strokes);
  const radiusToken = `${frame.radius}${frame.roundImage ? 'i' : ''}`;
  return `${version}.${frame.padding}.${matColor}.${radiusToken}~${strokes}`;
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
    !Number.isInteger(version) ||
    version < CODEC_VERSION_PLAIN ||
    version > CODEC_VERSION_ORNATE ||
    !Number.isInteger(padding) ||
    matColor === null
  ) {
    return null;
  }

  const tilde = radiusAndStrokes.indexOf('~');
  if (tilde < 0) {
    return null;
  }

  const radiusToken = radiusAndStrokes.slice(0, tilde);
  const roundImage = radiusToken.endsWith('i');
  const radiusRaw = roundImage ? radiusToken.slice(0, -1) : radiusToken;
  const radius = Number.parseInt(radiusRaw, 10);
  const strokesRaw = radiusAndStrokes.slice(tilde + 1);
  const strokes = decodeStrokes(strokesRaw);

  if (!Number.isInteger(radius) || strokes === null) {
    return null;
  }

  const parsed = frameSchema.safeParse({
    padding,
    matColor,
    radius,
    roundImage,
    strokes,
  });

  return parsed.success ? parsed.data : null;
}
