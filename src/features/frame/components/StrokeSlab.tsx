import type { CSSProperties, ReactNode } from 'react';
import { cn } from '#/lib/utils.ts';
import type { Stroke } from '../frame.schema.ts';
import { strokeSpecLine, strokeSwatchHeight } from '../strokeLabel.ts';

type StrokeSlabProps = {
  stroke: Stroke;
  label: string;
  isEditing: boolean;
  onOpen: (anchor: HTMLElement) => void;
  buttonRef?: (node: HTMLButtonElement | null) => void;
  handle?: ReactNode;
  slabRef?: (node: HTMLDivElement | null) => void;
  style?: CSSProperties;
  isDragging?: boolean;
  isOverlay?: boolean;
  className?: string;
};

const CHECKER =
  'repeating-conic-gradient(var(--ink-200) 0% 25%, var(--white) 0% 50%) 0 0 / 8px 8px';

const StrokeSwatch = ({ stroke }: { stroke: Stroke }) => (
  <span
    className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-border"
    style={{ background: CHECKER }}
    aria-hidden="true"
  >
    <span
      className="w-full"
      style={{ height: strokeSwatchHeight(stroke), backgroundColor: stroke.color }}
    />
  </span>
);

export const StrokeSlab = ({
  stroke,
  label,
  isEditing,
  onOpen,
  buttonRef,
  handle,
  slabRef,
  style,
  isDragging = false,
  isOverlay = false,
  className,
}: StrokeSlabProps) => {
  return (
    <div
      ref={slabRef}
      style={style}
      className={cn(
        'flex items-stretch overflow-hidden rounded-sm border bg-background',
        isEditing ? 'border-primary' : 'border-border',
        isDragging && 'opacity-40',
        isOverlay && 'shadow-[0_8px_24px_oklch(0.2_0.02_195/0.14)]',
        className,
      )}
    >
      {handle}
      <button
        type="button"
        ref={buttonRef}
        onClick={(event) => onOpen(event.currentTarget)}
        aria-haspopup="dialog"
        aria-expanded={isEditing}
        className={cn(
          'flex min-h-14 flex-1 items-center gap-3 px-3 py-2 text-left',
          'transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]',
          'hover:bg-muted focus-visible:ring-ring',
        )}
      >
        <StrokeSwatch stroke={stroke} />
        <span className="flex min-w-0 flex-col">
          <span className="type-label truncate text-foreground">{label}</span>
          <span className="type-caption tabular-nums text-muted-foreground">
            {strokeSpecLine(stroke)}
          </span>
        </span>
      </button>
    </div>
  );
};
