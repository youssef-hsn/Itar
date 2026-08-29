import { Menu as BaseMenu } from '@base-ui/react/menu';
import { Check } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '#/lib/utils.ts';

export const DropdownMenu = BaseMenu.Root;
export const DropdownMenuTrigger = BaseMenu.Trigger;
export const DropdownMenuPortal = BaseMenu.Portal;
export const DropdownMenuPositioner = BaseMenu.Positioner;
export const DropdownMenuGroup = BaseMenu.Group;
export const DropdownMenuRadioGroup = BaseMenu.RadioGroup;

export type DropdownMenuContentProps = {
  anchor?: BaseMenu.Positioner.Props['anchor'];
  side?: BaseMenu.Positioner.Props['side'];
  align?: BaseMenu.Positioner.Props['align'];
  sideOffset?: BaseMenu.Positioner.Props['sideOffset'];
  alignOffset?: BaseMenu.Positioner.Props['alignOffset'];
  collisionPadding?: BaseMenu.Positioner.Props['collisionPadding'];
} & ComponentProps<typeof BaseMenu.Popup>;

export const DropdownMenuContent = ({
  className,
  anchor,
  side = 'bottom',
  align = 'end',
  sideOffset = 4,
  alignOffset = 0,
  collisionPadding = 8,
  children,
  ...props
}: DropdownMenuContentProps) => {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner
        anchor={anchor}
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        className="z-[var(--z-dropdown)]"
      >
        <BaseMenu.Popup
          className={cn(
            'min-w-[8rem] overflow-hidden rounded-md border border-border',
            'bg-popover p-1 text-popover-foreground shadow-[var(--shadow-popover)]',
            'outline-none',
            className,
          )}
          {...props}
        >
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
};

export type DropdownMenuItemProps = ComponentProps<typeof BaseMenu.Item>;

export const DropdownMenuItem = ({ className, ...props }: DropdownMenuItemProps) => {
  return (
    <BaseMenu.Item
      className={cn(
        'relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 type-label outline-none',
        'transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]',
        'data-[highlighted]:bg-muted data-[highlighted]:text-foreground',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
        className,
      )}
      {...props}
    />
  );
};

export type DropdownMenuRadioItemProps = ComponentProps<typeof BaseMenu.RadioItem>;

export const DropdownMenuRadioItem = ({
  className,
  children,
  closeOnClick = true,
  ...props
}: DropdownMenuRadioItemProps) => {
  return (
    <BaseMenu.RadioItem
      closeOnClick={closeOnClick}
      className={cn(
        'relative flex cursor-pointer select-none items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 type-label outline-none',
        'transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]',
        'data-[highlighted]:bg-muted data-[highlighted]:text-foreground',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
        className,
      )}
      {...props}
    >
      <BaseMenu.RadioItemIndicator className="absolute left-2 flex size-3.5 items-center justify-center">
        <Check className="size-4" />
      </BaseMenu.RadioItemIndicator>
      {children}
    </BaseMenu.RadioItem>
  );
};

export type DropdownMenuSeparatorProps = ComponentProps<typeof BaseMenu.Separator>;

export const DropdownMenuSeparator = ({ className, ...props }: DropdownMenuSeparatorProps) => {
  return <BaseMenu.Separator className={cn('-mx-1 my-1 h-px bg-border', className)} {...props} />;
};

export type DropdownMenuLabelProps = ComponentProps<typeof BaseMenu.GroupLabel>;

export const DropdownMenuLabel = ({ className, ...props }: DropdownMenuLabelProps) => {
  return (
    <BaseMenu.GroupLabel
      className={cn('px-2 py-1.5 type-label font-medium text-foreground', className)}
      {...props}
    />
  );
};
