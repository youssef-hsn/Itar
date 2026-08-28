import { type ComponentProps, useEffect, useState } from 'react';
import { Toaster as Sonner } from 'sonner';
import { useTheme } from '#/components/theme/useTheme.ts';
import { resolveTheme } from '#/lib/theme.ts';

export type ToasterProps = ComponentProps<typeof Sonner>;

export const Toaster = ({ ...props }: ToasterProps) => {
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const prefersDark =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false;

  const resolvedTheme = mounted ? resolveTheme(theme, prefersDark) : 'light';

  return (
    <Sonner
      theme={resolvedTheme}
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
};
