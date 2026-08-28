import type { ComponentProps } from 'react';
import { cn } from '#/lib/utils.ts';

export type LabelProps = ComponentProps<'label'>;

export const Label = ({ className, ...props }: LabelProps) => {
  // biome-ignore lint/a11y/noLabelWithoutControl: generic label primitive with props forwarded
  return <label className={cn('type-label text-foreground', className)} {...props} />;
};
