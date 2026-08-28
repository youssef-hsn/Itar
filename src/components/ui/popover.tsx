import { Popover as BasePopover } from '@base-ui/react/popover';
import type { ComponentProps } from 'react';
import { cn } from '#/lib/utils.ts';

export const Popover = BasePopover.Root;
export const PopoverTrigger = BasePopover.Trigger;
export const PopoverPortal = BasePopover.Portal;
export const PopoverPositioner = BasePopover.Positioner;
export const PopoverClose = BasePopover.Close;
export const PopoverTitle = BasePopover.Title;
export const PopoverDescription = BasePopover.Description;

export type PopoverContentProps = {
  anchor?: BasePopover.Positioner.Props['anchor'];
  side?: BasePopover.Positioner.Props['side'];
  align?: BasePopover.Positioner.Props['align'];
  sideOffset?: BasePopover.Positioner.Props['sideOffset'];
  alignOffset?: BasePopover.Positioner.Props['alignOffset'];
  collisionPadding?: BasePopover.Positioner.Props['collisionPadding'];
  collisionAvoidance?: BasePopover.Positioner.Props['collisionAvoidance'];
  positionMethod?: BasePopover.Positioner.Props['positionMethod'];
  initialFocus?: BasePopover.Popup.Props['initialFocus'];
  finalFocus?: BasePopover.Popup.Props['finalFocus'];
} & ComponentProps<typeof BasePopover.Popup>;

export const PopoverContent = ({
  className,
  anchor,
  side = 'bottom',
  align = 'center',
  sideOffset = 4,
  alignOffset = 0,
  collisionPadding = 8,
  collisionAvoidance,
  positionMethod,
  initialFocus,
  finalFocus,
  children,
  ...props
}: PopoverContentProps) => {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner
        anchor={anchor}
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        collisionAvoidance={collisionAvoidance}
        positionMethod={positionMethod}
      >
        <BasePopover.Popup
          initialFocus={initialFocus}
          finalFocus={finalFocus}
          className={cn(
            'z-[var(--z-dropdown)] w-[min(20rem,calc(100vw-1rem))] rounded-md border border-border',
            'bg-popover p-4 text-popover-foreground shadow-[var(--shadow-popover)]',
            'outline-none',
            className,
          )}
          {...props}
        >
          {children}
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
};
