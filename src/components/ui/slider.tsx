import { Slider as BaseSlider } from '@base-ui/react/slider';
import type { ComponentProps } from 'react';
import { cn } from '#/lib/utils.ts';

export type SliderProps = {
  min?: number;
  max?: number;
  step?: number;
  value?: number[] | readonly number[];
  defaultValue?: number[] | readonly number[];
  onValueChange?: (value: number[]) => void;
  disabled?: boolean;
  'aria-label'?: string;
  className?: string;
} & Omit<ComponentProps<'div'>, 'value' | 'defaultValue' | 'onChange'>;

export const Slider = ({
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue,
  onValueChange,
  disabled,
  'aria-label': ariaLabel,
  className,
  ...props
}: SliderProps) => {
  return (
    <BaseSlider.Root
      min={min}
      max={max}
      step={step}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(val: number | readonly number[]) => {
        if (onValueChange) {
          onValueChange(Array.isArray(val) ? [...val] : [val]);
        }
      }}
      disabled={disabled}
      className={cn(
        'relative flex h-11 w-full touch-none items-center select-none data-[disabled]:opacity-40',
        className,
      )}
      {...props}
    >
      <BaseSlider.Control className="relative flex w-full items-center">
        <BaseSlider.Track className="relative h-2 w-full grow overflow-hidden rounded-sm bg-muted">
          <BaseSlider.Indicator className="absolute h-full bg-primary" />
        </BaseSlider.Track>
        <BaseSlider.Thumb
          aria-label={ariaLabel}
          className={cn(
            'relative block size-5 shrink-0 rounded-full bg-primary',
            'transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]',
            'after:absolute after:-inset-3 after:content-[""]',
          )}
        />
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
};
