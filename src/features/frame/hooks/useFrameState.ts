import { useQueryState } from 'nuqs';
import { useCallback } from 'react';
import { frameParser } from '../frame.parser.ts';
import { type Frame, PRESETS, type Stroke } from '../frame.schema.ts';

const MAX_STROKES = 8;

export function useFrameState() {
  const [frame, setFrame] = useQueryState('f', frameParser.withDefault(PRESETS[0].frame));

  const updateFrame = useCallback(
    (updater: (current: Frame) => Frame) => {
      setFrame((current) => updater(current ?? PRESETS[0].frame));
    },
    [setFrame],
  );

  const addStroke = useCallback(
    (stroke: Stroke) => {
      updateFrame((current) => {
        if (current.strokes.length >= MAX_STROKES) {
          return current;
        }
        return { ...current, strokes: [...current.strokes, stroke] };
      });
    },
    [updateFrame],
  );

  const removeStroke = useCallback(
    (index: number) => {
      updateFrame((current) => ({
        ...current,
        strokes: current.strokes.filter((_, i) => i !== index),
      }));
    },
    [updateFrame],
  );

  const reorderStroke = useCallback(
    (fromIndex: number, toIndex: number) => {
      updateFrame((current) => {
        const strokes = [...current.strokes];
        if (
          fromIndex < 0 ||
          fromIndex >= strokes.length ||
          toIndex < 0 ||
          toIndex >= strokes.length ||
          fromIndex === toIndex
        ) {
          return current;
        }
        const [moved] = strokes.splice(fromIndex, 1);
        strokes.splice(toIndex, 0, moved);
        return { ...current, strokes };
      });
    },
    [updateFrame],
  );

  const updateStroke = useCallback(
    (index: number, patch: Partial<Stroke>) => {
      updateFrame((current) => ({
        ...current,
        strokes: current.strokes.map((stroke, i) =>
          i === index ? { ...stroke, ...patch } : stroke,
        ),
      }));
    },
    [updateFrame],
  );

  const setPadding = useCallback(
    (padding: number) => {
      updateFrame((current) => ({ ...current, padding }));
    },
    [updateFrame],
  );

  const setMatColor = useCallback(
    (matColor: string) => {
      updateFrame((current) => ({ ...current, matColor }));
    },
    [updateFrame],
  );

  const setRadius = useCallback(
    (radius: number) => {
      updateFrame((current) => ({ ...current, radius }));
    },
    [updateFrame],
  );

  const applyPreset = useCallback(
    (presetId: string) => {
      const preset = PRESETS.find((entry) => entry.id === presetId);
      if (preset) {
        setFrame(preset.frame);
      }
    },
    [setFrame],
  );

  return {
    frame,
    setFrame,
    addStroke,
    removeStroke,
    reorderStroke,
    updateStroke,
    setPadding,
    setMatColor,
    setRadius,
    applyPreset,
    maxStrokesReached: frame.strokes.length >= MAX_STROKES,
  };
}
