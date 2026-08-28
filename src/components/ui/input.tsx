import type { ComponentProps } from 'react';
import { cn } from '#/lib/utils.ts';

export type InputProps = ComponentProps<'input'>;

export const Input = ({ className, type = 'text', ...props }: InputProps) => {
  return (
    <input
      type={type}
      className={cn(
        'type-label min-h-11 w-full rounded-sm border border-border bg-background px-3 text-foreground',
        'transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]',
        'placeholder:text-muted-foreground',
        'disabled:pointer-events-none disabled:opacity-40',
        'file:border-0 file:bg-transparent',
        className,
      )}
      {...props}
    />
  );
};
