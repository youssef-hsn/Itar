import type { Stroke } from './frame.schema.ts';

const SWATCH_MIN_HEIGHT = 2;
const SWATCH_MAX_HEIGHT = 24;

export const strokeAlphaPercent = (stroke: Stroke): number => {
  if (stroke.color.length < 9) {
    return 100;
  }
  return Math.round((Number.parseInt(stroke.color.slice(7, 9), 16) / 255) * 100);
};

export const strokeDisplayName = (stroke: Stroke, position: number): string => {
  const trimmed = stroke.name?.trim();
  if (trimmed == null || trimmed === '') {
    return `Stroke ${position}`;
  }
  return trimmed;
};

export const strokeSpecLine = (stroke: Stroke): string => {
  const alpha = strokeAlphaPercent(stroke);
  if (alpha === 0) {
    return `${stroke.width} px · gap`;
  }
  if (alpha === 100) {
    return `${stroke.width} px`;
  }
  return `${stroke.width} px · ${alpha}%`;
};

export const strokeSwatchHeight = (stroke: Stroke): number =>
  Math.min(SWATCH_MAX_HEIGHT, Math.max(SWATCH_MIN_HEIGHT, stroke.width));
