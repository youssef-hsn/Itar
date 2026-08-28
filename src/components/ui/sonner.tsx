import type { ComponentProps } from 'react';
import { Toaster as Sonner } from 'sonner';

export type ToasterProps = ComponentProps<typeof Sonner>;

export const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    theme="light"
    className="toaster group"
    position="bottom-right"
    style={
      {
        '--normal-bg': 'var(--color-popover)',
        '--normal-text': 'var(--color-popover-foreground)',
        '--normal-border': 'var(--color-border)',
      } as React.CSSProperties
    }
    {...props}
  />
);
