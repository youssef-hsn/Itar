import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import type { ComponentProps } from 'react';
import { cn } from '#/lib/utils.ts';

export const Combobox = BaseCombobox.Root;
export const ComboboxLabel = BaseCombobox.Label;
export const ComboboxTrigger = BaseCombobox.Trigger;
export const ComboboxValue = BaseCombobox.Value;
export const ComboboxIcon = BaseCombobox.Icon;
export const ComboboxItemIndicator = BaseCombobox.ItemIndicator;

export type ComboboxContentProps = {
  side?: BaseCombobox.Positioner.Props['side'];
  align?: BaseCombobox.Positioner.Props['align'];
  sideOffset?: BaseCombobox.Positioner.Props['sideOffset'];
  alignOffset?: BaseCombobox.Positioner.Props['alignOffset'];
  collisionPadding?: BaseCombobox.Positioner.Props['collisionPadding'];
} & ComponentProps<typeof BaseCombobox.Popup>;

export const ComboboxContent = ({
  className,
  side = 'bottom',
  align = 'start',
  sideOffset = 4,
  alignOffset = 0,
  collisionPadding = 8,
  children,
  ...props
}: ComboboxContentProps) => {
  return (
    <BaseCombobox.Portal>
      <BaseCombobox.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        className="z-[var(--z-dropdown)]"
      >
        <BaseCombobox.Popup
          className={cn(
            'flex max-h-[min(var(--available-height),20rem)] w-[var(--anchor-width)] flex-col gap-2',
            'rounded-md border border-border bg-popover p-2 text-popover-foreground',
            'shadow-[var(--shadow-popover)] outline-none',
            className,
          )}
          {...props}
        >
          {children}
        </BaseCombobox.Popup>
      </BaseCombobox.Positioner>
    </BaseCombobox.Portal>
  );
};

export const ComboboxInput = ({
  className,
  ...props
}: ComponentProps<typeof BaseCombobox.Input>) => {
  return (
    <BaseCombobox.Input
      className={cn(
        'type-label min-h-11 w-full rounded-sm border border-border bg-background px-3 text-foreground',
        'transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]',
        'placeholder:text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
};

export const ComboboxList = ({ className, ...props }: ComponentProps<typeof BaseCombobox.List>) => {
  return (
    <BaseCombobox.List
      className={cn('flex min-h-0 flex-col gap-1 overflow-y-auto', className)}
      {...props}
    />
  );
};

export const ComboboxItem = ({ className, ...props }: ComponentProps<typeof BaseCombobox.Item>) => {
  return (
    <BaseCombobox.Item
      className={cn(
        'type-label flex min-h-11 cursor-default items-center gap-3 rounded-sm px-2 text-foreground',
        'transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]',
        'outline-none data-[highlighted]:bg-muted',
        className,
      )}
      {...props}
    />
  );
};

export const ComboboxEmpty = ({
  className,
  ...props
}: ComponentProps<typeof BaseCombobox.Empty>) => {
  return (
    <BaseCombobox.Empty
      className={cn('type-caption px-2 text-muted-foreground empty:hidden', className)}
      {...props}
    />
  );
};
