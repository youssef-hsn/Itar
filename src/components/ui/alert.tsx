import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '#/lib/utils.ts';

export const alertVariants = cva(
  'relative flex w-full items-start gap-2 rounded-sm px-3 py-2 type-label',
  {
    variants: {
      variant: {
        default: 'bg-muted text-foreground',
        destructive: 'bg-destructive/10 text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type AlertProps = ComponentProps<'div'> & VariantProps<typeof alertVariants>;

export const Alert = ({ className, variant, role = 'alert', ...props }: AlertProps) => {
  return <div role={role} className={cn(alertVariants({ variant }), className)} {...props} />;
};

export type AlertTitleProps = ComponentProps<'h5'>;

export const AlertTitle = ({ className, ...props }: AlertTitleProps) => {
  return <h5 className={cn('type-label font-medium text-foreground', className)} {...props} />;
};

export type AlertDescriptionProps = ComponentProps<'div'>;

export const AlertDescription = ({ className, ...props }: AlertDescriptionProps) => {
  return <div className={cn('type-label text-muted-foreground', className)} {...props} />;
};
