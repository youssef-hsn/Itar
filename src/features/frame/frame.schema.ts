import { z } from 'zod';

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/, 'Expected #RRGGBB or #RRGGBBAA');

export const MAX_STROKE_NAME_LENGTH = 24;

export const MOTIF_IDS = [
  'khatam',
  'interlace',
  'kufic',
  'mihrab',
  'chevron',
  'chain',
  'hexagram',
  'dentil',
] as const;

export type MotifId = (typeof MOTIF_IDS)[number];

export const CORNER_STYLES = ['motif', 'rosette', 'block', 'none'] as const;

export type CornerStyle = (typeof CORNER_STYLES)[number];

export const DENSITIES = ['tight', 'regular', 'wide'] as const;

export type Density = (typeof DENSITIES)[number];

export const DEFAULT_PATTERN = {
  corner: 'motif',
  density: 'regular',
  mirror: false,
} as const satisfies { corner: CornerStyle; density: Density; mirror: boolean };

export const ornamentSchema = z.object({
  motif: z.enum(MOTIF_IDS),
  ink: hexColor,
  corner: z.enum(CORNER_STYLES).default(DEFAULT_PATTERN.corner),
  density: z.enum(DENSITIES).default(DEFAULT_PATTERN.density),
  mirror: z.boolean().default(DEFAULT_PATTERN.mirror),
});

export type Ornament = z.infer<typeof ornamentSchema>;

export const strokeSchema = z.object({
  width: z.number().int().min(0).max(200),
  color: hexColor,
  name: z.string().min(1).max(MAX_STROKE_NAME_LENGTH).optional(),
  ornament: ornamentSchema.optional(),
});

export const frameSchema = z.object({
  padding: z.number().int().min(0).max(400),
  matColor: hexColor,
  radius: z.number().int().min(0).max(200),
  roundImage: z.boolean().default(false),
  strokes: z.array(strokeSchema).max(8),
});

export type Stroke = z.infer<typeof strokeSchema>;
export type Frame = z.infer<typeof frameSchema>;

export type Preset = {
  id: string;
  name: string;
  frame: Frame;
};

const doubleRule: Frame = {
  padding: 24,
  matColor: '#f7f4ec',
  radius: 0,
  roundImage: false,
  strokes: [
    { width: 16, color: '#1a3a3f' },
    { width: 4, color: '#c9a227' },
    { width: 2, color: '#1a3a3f' },
  ],
};

export const PRESETS: Preset[] = [
  { id: 'double-rule', name: 'Double Rule', frame: doubleRule },
  {
    id: 'gilded-hairline',
    name: 'Gilded Hairline',
    frame: {
      padding: 32,
      matColor: '#f7f4ec',
      radius: 0,
      roundImage: false,
      strokes: [
        { width: 12, color: '#1a3a3f' },
        { width: 1, color: '#c9a227' },
        { width: 12, color: '#1a3a3f' },
      ],
    },
  },
  {
    id: 'heavy-band',
    name: 'Heavy Band',
    frame: {
      padding: 16,
      matColor: '#f0ede8',
      radius: 0,
      roundImage: false,
      strokes: [
        { width: 32, color: '#1a3a3f' },
        { width: 3, color: '#c9a227' },
        { width: 48, color: '#1a3a3f' },
      ],
    },
  },
  {
    id: 'triple-thread',
    name: 'Triple Thread',
    frame: {
      padding: 28,
      matColor: '#f7f4ec',
      radius: 0,
      roundImage: false,
      strokes: [
        { width: 1, color: '#1a3a3f' },
        { width: 4, color: '#f7f4ec00' },
        { width: 1, color: '#c9a227' },
        { width: 4, color: '#f7f4ec00' },
        { width: 1, color: '#1a3a3f' },
      ],
    },
  },
  {
    id: 'star-band',
    name: 'Star Band',
    frame: {
      padding: 24,
      matColor: '#f7f4ec',
      radius: 0,
      roundImage: false,
      strokes: [
        { width: 3, color: '#c9a227' },
        {
          width: 28,
          color: '#1a3a3f',
          ornament: { ...DEFAULT_PATTERN, motif: 'khatam', ink: '#c9a227' },
        },
        { width: 3, color: '#c9a227' },
      ],
    },
  },
  {
    id: 'kufic-key',
    name: 'Kufic Key',
    frame: {
      padding: 28,
      matColor: '#f7f4ec',
      radius: 0,
      roundImage: false,
      strokes: [
        { width: 2, color: '#1a3a3f' },
        { width: 4, color: '#f7f4ec00' },
        {
          width: 24,
          color: '#f7f4ec',
          ornament: { ...DEFAULT_PATTERN, motif: 'kufic', ink: '#1a3a3f' },
        },
        { width: 6, color: '#1a3a3f' },
      ],
    },
  },
];

export const DEFAULT_FRAME = PRESETS[0].frame;
