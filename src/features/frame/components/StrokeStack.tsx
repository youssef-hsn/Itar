import { AlertTriangle, Plus } from 'lucide-react';
import { cn } from '#/lib/utils.ts';
import type { Stroke } from '../frame.schema.ts';
import { StrokeRow } from './StrokeRow.tsx';

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
  const displayStrokes = [...strokes].reverse();

  return (
    <section className={cn('flex flex-col gap-4', className)} aria-labelledby="strokes-heading">
      <div className="flex items-center justify-between gap-3">
        <h2 id="strokes-heading" className="type-label text-foreground">
          Strokes
        </h2>
        <button
          type="button"
          onClick={onAdd}
          disabled={maxStrokesReached}
          className={cn(
            'inline-flex min-h-11 items-center gap-2 rounded-sm border border-border bg-background px-3 type-label text-foreground',
            'transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]',
            'hover:bg-muted',
            'focus-visible:ring-ring',
            'disabled:pointer-events-none disabled:opacity-40',
          )}
          aria-describedby={maxStrokesReached ? 'max-strokes-notice' : undefined}
        >
          <Plus className="size-4" aria-hidden="true" />
          Add stroke
        </button>
      </div>

      <ol className="list-none p-0 m-0" aria-label="Frame strokes, outermost first">
        {displayStrokes.map((stroke, displayIndex) => {
          const modelIndex = toModelIndex(displayIndex, strokes.length);
          const position = displayIndex + 1;

          return (
            <li key={modelIndex} className="list-none">
              <StrokeRow
                stroke={stroke}
                label={`Stroke ${position}`}
                onUpdate={(patch) => onUpdate(modelIndex, patch)}
                onMoveOutward={() => onReorder(modelIndex, modelIndex + 1)}
                onMoveInward={() => onReorder(modelIndex, modelIndex - 1)}
                onRemove={() => onRemove(modelIndex)}
                canMoveOutward={modelIndex < strokes.length - 1}
                canMoveInward={modelIndex > 0}
                canRemove={strokes.length > 1}
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
    </section>
  );
};
