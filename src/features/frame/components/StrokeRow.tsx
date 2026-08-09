import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { cn } from '#/lib/utils.ts';
import type { Stroke } from '../frame.schema.ts';
import { ColorField } from './ColorField.tsx';
import { NumberField } from './NumberField.tsx';

type StrokeRowProps = {
  stroke: Stroke;
  label: string;
  onUpdate: (patch: Partial<Stroke>) => void;
  onMoveOutward: () => void;
  onMoveInward: () => void;
  onRemove: () => void;
  canMoveOutward: boolean;
  canMoveInward: boolean;
  canRemove: boolean;
  className?: string;
};

const iconButtonClass = cn(
  'inline-flex size-11 shrink-0 items-center justify-center rounded-sm border border-border bg-background text-muted-foreground',
  'transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]',
  'hover:bg-muted hover:text-foreground',
  'focus-visible:ring-ring',
  'disabled:pointer-events-none disabled:opacity-40',
);

export const StrokeRow = ({
  stroke,
  label,
  onUpdate,
  onMoveOutward,
  onMoveInward,
  onRemove,
  canMoveOutward,
  canMoveInward,
  canRemove,
  className,
}: StrokeRowProps) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-b border-border py-4 last:border-b-0 last:pb-0',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="type-label text-foreground">{label}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveOutward}
            disabled={!canMoveOutward}
            className={iconButtonClass}
            aria-label={`Move ${label} outward`}
          >
            <ChevronUp className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onMoveInward}
            disabled={!canMoveInward}
            className={iconButtonClass}
            aria-label={`Move ${label} inward`}
          >
            <ChevronDown className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            disabled={!canRemove}
            className={iconButtonClass}
            aria-label={`Remove ${label}`}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      <NumberField
        label="Width"
        value={stroke.width}
        onChange={(width) => onUpdate({ width })}
        min={0}
        max={200}
      />
      <ColorField label="Color" value={stroke.color} onChange={(color) => onUpdate({ color })} />
    </div>
  );
};
