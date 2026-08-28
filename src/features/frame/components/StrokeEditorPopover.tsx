import { ArrowDown, ArrowUp, Trash2, X } from 'lucide-react';
import type { RefObject } from 'react';
import { Button } from '#/components/ui/button.tsx';
import { cn } from '#/lib/utils.ts';
import { MAX_STROKE_NAME_LENGTH, type Stroke } from '../frame.schema.ts';
import { ColorField } from './ColorField.tsx';
import { NumberField } from './NumberField.tsx';
import { TextField } from './TextField.tsx';

export const STROKE_NAME_FIELD_ID = 'stroke-name-field';

type StrokeEditorPopoverProps = {
  popoverRef: RefObject<HTMLDivElement | null>;
  position: { top: number; left: number } | null;
  stroke: Stroke | null;
  label: string;
  onUpdate: (patch: Partial<Stroke>) => void;
  onMoveOutward: () => void;
  onMoveInward: () => void;
  onRemove: () => void;
  onClose: () => void;
  canMoveOutward: boolean;
  canMoveInward: boolean;
  canRemove: boolean;
  className?: string;
};

export const StrokeEditorPopover = ({
  popoverRef,
  position,
  stroke,
  label,
  onUpdate,
  onMoveOutward,
  onMoveInward,
  onRemove,
  onClose,
  canMoveOutward,
  canMoveInward,
  canRemove,
  className,
}: StrokeEditorPopoverProps) => {
  return (
    <div
      ref={popoverRef}
      popover="auto"
      role="dialog"
      aria-label={`Edit ${label}`}
      style={{
        position: 'fixed',
        inset: 'auto',
        margin: 0,
        top: position?.top ?? 0,
        left: position?.left ?? 0,
        visibility: position ? 'visible' : 'hidden',
      }}
      className={cn(
        'w-[min(20rem,calc(100vw-1rem))] flex-col gap-4 rounded-md border border-border bg-white p-4',
        'shadow-[0_8px_24px_oklch(0.2_0.02_195/0.12)]',
        'open:flex',
        className,
      )}
    >
      {stroke && (
        <>
          <div className="flex items-center justify-between gap-2">
            <h3 className="type-label text-foreground">{label}</h3>
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close stroke editor"
            >
              <X className="size-4" aria-hidden="true" />
            </Button>
          </div>

          <TextField
            id={STROKE_NAME_FIELD_ID}
            label="Name"
            value={stroke.name ?? ''}
            placeholder={label}
            maxLength={MAX_STROKE_NAME_LENGTH}
            onChange={(next) => onUpdate({ name: next.trim() === '' ? undefined : next })}
          />

          <NumberField
            label="Width"
            value={stroke.width}
            onChange={(width) => onUpdate({ width })}
            min={0}
            max={200}
          />

          <ColorField
            label="Color"
            value={stroke.color}
            onChange={(color) => onUpdate({ color })}
          />

          <div className="flex flex-col gap-2 border-border border-t pt-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onMoveOutward}
                disabled={!canMoveOutward}
                className="flex-1"
              >
                <ArrowUp className="size-4" aria-hidden="true" />
                Move outward
              </Button>
              <Button
                variant="outline"
                onClick={onMoveInward}
                disabled={!canMoveInward}
                className="flex-1"
              >
                <ArrowDown className="size-4" aria-hidden="true" />
                Move inward
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={onRemove}
              disabled={!canRemove}
              className="justify-center"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Remove stroke
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
