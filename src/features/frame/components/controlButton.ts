import { cn } from '#/lib/utils.ts';

const controlBase = cn(
  'inline-flex shrink-0 items-center justify-center rounded-sm border border-border bg-background',
  'transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]',
  'hover:bg-muted',
  'focus-visible:ring-ring',
  'disabled:pointer-events-none disabled:opacity-40',
);

export const iconButtonClass = cn(
  controlBase,
  'size-11 text-muted-foreground hover:text-foreground',
);

export const labelButtonClass = cn(controlBase, 'min-h-11 gap-2 px-3 type-label text-foreground');

export const dragHandleClass = cn(
  'flex w-11 shrink-0 touch-none items-center justify-center self-stretch',
  'border-border border-r text-muted-foreground',
  'transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]',
  'cursor-grab hover:bg-muted hover:text-foreground active:cursor-grabbing',
  'focus-visible:ring-ring',
);
