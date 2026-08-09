import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type { Stroke } from '../frame.schema.ts';
import { dragHandleClass } from './controlButton.ts';
import { StrokeSlab } from './StrokeSlab.tsx';

type SortableStrokeSlabProps = {
  id: string;
  stroke: Stroke;
  label: string;
  isEditing: boolean;
  onOpen: (anchor: HTMLElement) => void;
  buttonRef: (node: HTMLButtonElement | null) => void;
};

export const SortableStrokeSlab = ({
  id,
  stroke,
  label,
  isEditing,
  onOpen,
  buttonRef,
}: SortableStrokeSlabProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <StrokeSlab
      stroke={stroke}
      label={label}
      isEditing={isEditing}
      onOpen={onOpen}
      buttonRef={buttonRef}
      slabRef={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      isDragging={isDragging}
      handle={
        <button
          type="button"
          ref={setActivatorNodeRef}
          className={dragHandleClass}
          aria-label={`Reorder ${label}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" aria-hidden="true" />
        </button>
      }
    />
  );
};
