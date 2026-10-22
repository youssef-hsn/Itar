import { ArrowDown, ArrowUp, Trash2, X } from 'lucide-react';
import { useRef } from 'react';
import { Button } from '#/components/ui/button.tsx';
import { PopoverContent } from '#/components/ui/popover.tsx';
import { Separator } from '#/components/ui/separator.tsx';
import { cn } from '#/lib/utils.ts';
import { DEFAULT_PATTERN, MAX_STROKE_NAME_LENGTH, type Stroke } from '../frame.schema.ts';
import { defaultOrnamentInk, MIN_ORNAMENT_WIDTH } from '../ornament/motif.ts';
import { ColorField } from './ColorField.tsx';
import { MotifField } from './MotifField.tsx';
import { NumberField } from './NumberField.tsx';
import { TextField } from './TextField.tsx';

type StrokeEditorPopoverProps = {
  anchor?: HTMLElement | null;
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
  finalFocus?: () => HTMLElement | null;
};

export const StrokeEditorPopover = ({
  anchor,
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
  finalFocus,
}: StrokeEditorPopoverProps) => {
  const nameFieldRef = useRef<HTMLInputElement>(null);

  if (!stroke) {
    return null;
  }

  const { ornament } = stroke;
  const ink = ornament?.ink ?? defaultOrnamentInk(stroke.color);

  return (
    <PopoverContent
      anchor={anchor}
      side="left"
      align="start"
      sideOffset={8}
      collisionPadding={{ top: 72, right: 8, bottom: 8, left: 8 }}
      role="dialog"
      aria-label={`Edit ${label}`}
      initialFocus={nameFieldRef}
      finalFocus={finalFocus}
      className={cn('flex flex-col gap-4', className)}
    >
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
        ref={nameFieldRef}
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
        label={ornament ? 'Ground color' : 'Color'}
        value={stroke.color}
        onChange={(color) => onUpdate({ color })}
      />

      <MotifField
        value={ornament?.motif ?? null}
        ground={stroke.color}
        ink={ink}
        onChange={(motif) =>
          onUpdate({
            ornament: motif == null ? undefined : { ...DEFAULT_PATTERN, ...ornament, motif, ink },
          })
        }
      />

      {ornament && (
        <ColorField
          label="Pattern color"
          value={ornament.ink}
          onChange={(nextInk) => onUpdate({ ornament: { ...ornament, ink: nextInk } })}
        />
      )}

      {ornament && stroke.width < MIN_ORNAMENT_WIDTH && (
        <p className="type-caption text-muted-foreground">
          Patterns show at {MIN_ORNAMENT_WIDTH} px and wider.
        </p>
      )}

      <Separator />

      <div className="flex flex-col gap-2">
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
          variant="destructive"
          onClick={onRemove}
          disabled={!canRemove}
          className="justify-center"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Remove stroke
        </Button>
      </div>
    </PopoverContent>
  );
};
