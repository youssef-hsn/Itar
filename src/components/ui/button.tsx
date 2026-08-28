import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '#/lib/utils.ts';

export const buttonVariants = cva(
  cn(
    'inline-flex shrink-0 items-center justify-center gap-2 rounded-sm border whitespace-nowrap',
    'type-label',
    'transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]',
    'disabled:pointer-events-none disabled:opacity-40',
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
  ),
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary-hover',
        outline: 'border-border bg-background text-foreground hover:bg-muted',
        ghost: 'border-transparent text-foreground hover:bg-muted',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        default: 'min-h-11 px-4',
        sm: 'min-h-11 px-3',
        icon: 'size-11',
      },
    },
    defaultVariants: { variant: 'outline', size: 'default' },
  },
);

export type ButtonProps = ComponentProps<'button'> & VariantProps<typeof buttonVariants>;

export const Button = ({ className, variant, size, type = 'button', ...props }: ButtonProps) => {
  return (
    <button type={type} className={cn(buttonVariants({ variant, size, className }))} {...props} />
  );
};
