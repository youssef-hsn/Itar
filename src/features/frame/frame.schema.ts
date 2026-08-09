import { z } from 'zod';

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/, 'Expected #RRGGBB or #RRGGBBAA');

export const strokeSchema = z.object({
  width: z.number().int().min(0).max(200),
  color: hexColor,
});

export const frameSchema = z.object({
  padding: z.number().int().min(0).max(400),
  matColor: hexColor,
  radius: z.number().int().min(0).max(200),
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
      strokes: [
        { width: 1, color: '#1a3a3f' },
        { width: 4, color: '#f7f4ec00' },
        { width: 1, color: '#c9a227' },
        { width: 4, color: '#f7f4ec00' },
        { width: 1, color: '#1a3a3f' },
      ],
    },
  },
];

export const DEFAULT_FRAME = PRESETS[0].frame;
