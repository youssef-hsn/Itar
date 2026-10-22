import { Check } from 'lucide-react';
import { type KeyboardEvent, type ReactNode, useId, useRef } from 'react';
import { Button } from '#/components/ui/button.tsx';
import { cn } from '#/lib/utils.ts';

type Option<T> = {
  value: T;
  label: string;
  preview?: ReactNode;
};

type OptionRadioGroupProps<T extends string | null> = {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  columns: 3 | 4;
};

const NEXT_KEYS: Record<string, number> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

const COLUMN_CLASSES = {
  3: 'grid-cols-3',
  4: 'grid-cols-4',
};

export const OptionRadioGroup = <T extends string | null>({
  label,
  options,
  value,
  onChange,
  columns,
}: OptionRadioGroupProps<T>) => {
  const labelId = useId();
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = options.findIndex((option) => option.value === value);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = NEXT_KEYS[event.key];
    if (step == null) {
      return;
    }
    event.preventDefault();
    const next = (Math.max(selectedIndex, 0) + step + options.length) % options.length;
    const nextOption = options[next];
    if (nextOption == null) {
      return;
    }
    onChange(nextOption.value);
    optionRefs.current[next]?.focus();
  };

  return (
    <div className="flex flex-col gap-2">
      <span id={labelId} className="type-label text-foreground">
        {label}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        onKeyDown={handleKeyDown}
        className={cn('grid gap-2', COLUMN_CLASSES[columns])}
      >
        {options.map((option, index) => {
          const isChecked = option.value === value;
          return (
            <Button
              key={option.value ?? 'none'}
              ref={(node) => {
                optionRefs.current[index] = node;
              }}
              role="radio"
              aria-checked={isChecked}
              tabIndex={isChecked ? 0 : -1}
              variant="outline"
              onClick={() => onChange(option.value)}
              className={cn(
                'relative h-auto flex-col gap-1 px-2 py-2 type-caption',
                isChecked ? 'border-primary text-foreground' : 'text-muted-foreground',
              )}
            >
              {option.preview}
              {option.label}
              {isChecked && (
                <Check className="absolute top-1 right-1 size-3 text-primary" aria-hidden="true" />
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
