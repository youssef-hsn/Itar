import { AlertTriangle, Plus } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '#/lib/utils.ts';
import type { Stroke } from '../frame.schema.ts';
import { useAnchoredPopover } from '../hooks/useAnchoredPopover.ts';
import { strokeDisplayName } from '../strokeLabel.ts';
import { labelButtonClass } from './controlButton.ts';
import { STROKE_NAME_FIELD_ID, StrokeEditorPopover } from './StrokeEditorPopover.tsx';
import { StrokeSlab } from './StrokeSlab.tsx';

type StrokeStackProps = {
  strokes: Stroke[];
  onUpdate: (index: number, patch: Partial<Stroke>) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
  maxStrokesReached: boolean;
  className?: string;
};

const toModelIndex = (displayIndex: number, length: number) => length - 1 - displayIndex;

export const StrokeStack = ({
  strokes,
  onUpdate,
  onReorder,
  onRemove,
  onAdd,
  maxStrokesReached,
  className,
}: StrokeStackProps) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const slabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const pendingFocusRef = useRef(false);

  const { popoverRef, isOpen, position, open, close, setAnchor, reposition } = useAnchoredPopover(
    `#${STROKE_NAME_FIELD_ID}`,
  );

  const displayStrokes = [...strokes].reverse();
  slabRefs.current.length = strokes.length;

  useEffect(() => {
    if (!isOpen) {
      setEditingIndex(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (editingIndex !== null && editingIndex >= strokes.length) {
      close();
    }
  }, [close, editingIndex, strokes.length]);

  useLayoutEffect(() => {
    if (editingIndex === null) {
      return;
    }
    setAnchor(slabRefs.current[editingIndex] ?? null);
    reposition();
  }, [editingIndex, reposition, setAnchor]);

  useLayoutEffect(() => {
    if (!pendingFocusRef.current) {
      return;
    }
    pendingFocusRef.current = false;
    slabRefs.current[strokes.length - 1]?.focus();
  }, [strokes.length]);

  const handleOpen = useCallback(
    (modelIndex: number, anchor: HTMLElement) => {
      setEditingIndex(modelIndex);
      open(anchor);
    },
    [open],
  );

  const handleAdd = useCallback(() => {
    if (maxStrokesReached) {
      return;
    }
    pendingFocusRef.current = true;
    onAdd();
  }, [maxStrokesReached, onAdd]);

  const handleMove = useCallback(
    (direction: 1 | -1) => {
      if (editingIndex === null) {
        return;
      }
      const target = editingIndex + direction;
      if (target < 0 || target >= strokes.length) {
        return;
      }
      onReorder(editingIndex, target);
      setEditingIndex(target);
    },
    [editingIndex, onReorder, strokes.length],
  );

  const handleRemove = useCallback(() => {
    if (editingIndex === null) {
      return;
    }
    setAnchor(null);
    close();
    onRemove(editingIndex);
    addButtonRef.current?.focus();
  }, [close, editingIndex, onRemove, setAnchor]);

  const editingStroke = editingIndex === null ? null : (strokes[editingIndex] ?? null);
  const editingLabel =
    editingIndex === null || editingStroke === null
      ? 'stroke'
      : strokeDisplayName(editingStroke, toModelIndex(editingIndex, strokes.length) + 1);

  return (
    <section className={cn('flex flex-col gap-4', className)} aria-labelledby="strokes-heading">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <h2 id="strokes-heading" className="type-label text-foreground">
            Strokes
          </h2>
          <p className="type-caption text-muted-foreground">Outermost first</p>
        </div>
        <button
          type="button"
          ref={addButtonRef}
          onClick={handleAdd}
          disabled={maxStrokesReached}
          className={labelButtonClass}
          aria-describedby={maxStrokesReached ? 'max-strokes-notice' : undefined}
        >
          <Plus className="size-4" aria-hidden="true" />
          Add stroke
        </button>
      </div>

      <ol
        className="m-0 flex list-none flex-col gap-2 p-0"
        aria-label="Frame strokes, outermost first"
      >
        {displayStrokes.map((stroke, displayIndex) => {
          const modelIndex = toModelIndex(displayIndex, strokes.length);
          const label = strokeDisplayName(stroke, displayIndex + 1);

          return (
            <li key={modelIndex} className="list-none">
              <StrokeSlab
                stroke={stroke}
                label={label}
                isEditing={editingIndex === modelIndex}
                onOpen={(anchor) => handleOpen(modelIndex, anchor)}
                buttonRef={(node) => {
                  slabRefs.current[modelIndex] = node;
                }}
              />
            </li>
          );
        })}
      </ol>

      {maxStrokesReached && (
        <div
          id="max-strokes-notice"
          role="status"
          aria-live="polite"
          className="flex items-start gap-2 rounded-sm bg-muted px-3 py-2"
        >
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="type-label text-muted-foreground">
            Maximum of 8 strokes reached. Remove one to add another.
          </p>
        </div>
      )}

      <StrokeEditorPopover
        popoverRef={popoverRef}
        position={position}
        stroke={editingStroke}
        label={editingLabel}
        onUpdate={(patch) => {
          if (editingIndex !== null) {
            onUpdate(editingIndex, patch);
          }
        }}
        onMoveOutward={() => handleMove(1)}
        onMoveInward={() => handleMove(-1)}
        onRemove={handleRemove}
        onClose={close}
        canMoveOutward={editingIndex !== null && editingIndex < strokes.length - 1}
        canMoveInward={editingIndex !== null && editingIndex > 0}
        canRemove={strokes.length > 1}
      />
    </section>
  );
};
