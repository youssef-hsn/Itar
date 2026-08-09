import {
  type Announcements,
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  type ScreenReaderInstructions,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { AlertTriangle, GripVertical, Plus } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { cn } from '#/lib/utils.ts';
import type { Stroke } from '../frame.schema.ts';
import { useAnchoredPopover } from '../hooks/useAnchoredPopover.ts';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.ts';
import { useStrokeIds } from '../hooks/useStrokeIds.ts';
import { strokeDisplayName } from '../strokeLabel.ts';
import { dragHandleClass, labelButtonClass } from './controlButton.ts';
import { SortableStrokeSlab } from './SortableStrokeSlab.tsx';
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

const SCREEN_READER_INSTRUCTIONS: ScreenReaderInstructions = {
  draggable:
    'Press space or enter to pick up this stroke. Use the up and down arrow keys to move it, then press space or enter to drop it. Press escape to cancel.',
};

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

  const { ids, reorderIds, removeId } = useStrokeIds(strokes.length);
  const displayIds = useMemo(() => [...ids].reverse(), [ids]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const labelForId = (id: string) => {
    const displayIndex = displayIds.indexOf(id);
    if (displayIndex < 0) {
      return 'stroke';
    }
    return strokeDisplayName(displayStrokes[displayIndex], displayIndex + 1);
  };

  const positionForId = (id: string) => displayIds.indexOf(id) + 1;

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      close();
      setActiveId(String(event.active.id));
    },
    [close],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) {
        return;
      }

      const fromDisplay = displayIds.indexOf(String(active.id));
      const toDisplay = displayIds.indexOf(String(over.id));
      if (fromDisplay < 0 || toDisplay < 0) {
        return;
      }

      const fromIndex = toModelIndex(fromDisplay, strokes.length);
      const toIndex = toModelIndex(toDisplay, strokes.length);
      reorderIds(fromIndex, toIndex);
      onReorder(fromIndex, toIndex);
    },
    [displayIds, onReorder, reorderIds, strokes.length],
  );

  const activeIndex = activeId === null ? -1 : displayIds.indexOf(activeId);
  const activeStroke = activeIndex < 0 ? null : displayStrokes[activeIndex];

  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ${labelForId(String(active.id))}.`,
    onDragOver: ({ over }) =>
      over
        ? `Now at position ${positionForId(String(over.id))} of ${strokes.length}, counting from the outside.`
        : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? `${labelForId(String(active.id))} dropped at position ${positionForId(String(over.id))} of ${strokes.length}.`
        : `${labelForId(String(active.id))} returned to its place.`,
    onDragCancel: ({ active }) =>
      `Move cancelled. ${labelForId(String(active.id))} returned to its place.`,
  };

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
      reorderIds(editingIndex, target);
      onReorder(editingIndex, target);
      setEditingIndex(target);
    },
    [editingIndex, onReorder, reorderIds, strokes.length],
  );

  const handleRemove = useCallback(() => {
    if (editingIndex === null) {
      return;
    }
    setAnchor(null);
    close();
    removeId(editingIndex);
    onRemove(editingIndex);
    addButtonRef.current?.focus();
  }, [close, editingIndex, onRemove, removeId, setAnchor]);

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

      <DndContext
        id="stroke-dnd"
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        accessibility={{ announcements, screenReaderInstructions: SCREEN_READER_INSTRUCTIONS }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <SortableContext items={displayIds} strategy={verticalListSortingStrategy}>
          <ol
            className="m-0 flex list-none flex-col gap-2 p-0"
            aria-label="Frame strokes, outermost first"
          >
            {displayStrokes.map((stroke, displayIndex) => {
              const modelIndex = toModelIndex(displayIndex, strokes.length);
              const id = displayIds[displayIndex];

              return (
                <li key={id} className="list-none">
                  <SortableStrokeSlab
                    id={id}
                    stroke={stroke}
                    label={strokeDisplayName(stroke, displayIndex + 1)}
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
        </SortableContext>

        <DragOverlay dropAnimation={prefersReducedMotion ? null : undefined}>
          {activeStroke && (
            <StrokeSlab
              stroke={activeStroke}
              label={strokeDisplayName(activeStroke, activeIndex + 1)}
              isEditing={false}
              onOpen={() => undefined}
              isOverlay
              handle={
                <span className={dragHandleClass} aria-hidden="true">
                  <GripVertical className="size-4" />
                </span>
              }
            />
          )}
        </DragOverlay>
      </DndContext>

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
