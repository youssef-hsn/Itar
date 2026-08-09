import { type ChangeEvent, useEffect, useId, useState } from 'react';
import { cn } from '#/lib/utils.ts';

type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  id?: string;
  className?: string;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const NumberField = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  id,
  className,
}: NumberFieldProps) => {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const [draft, setDraft] = useState(String(value));
  const [inputFocused, setInputFocused] = useState(false);

  useEffect(() => {
    if (!inputFocused) {
      setDraft(String(value));
    }
  }, [value, inputFocused]);

  const handleSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = clamp(Number.parseInt(event.target.value, 10), min, max);
    onChange(next);
    setDraft(String(next));
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    setDraft(raw);
    if (raw === '' || raw === '-') {
      return;
    }
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isNaN(parsed)) {
      onChange(clamp(parsed, min, max));
    }
  };

  const handleInputFocus = () => {
    setInputFocused(true);
  };

  const handleInputBlur = () => {
    setInputFocused(false);
    if (draft === '' || draft === '-') {
      setDraft(String(value));
      return;
    }
    const parsed = Number.parseInt(draft, 10);
    if (Number.isNaN(parsed)) {
      setDraft(String(value));
      return;
    }
    const clamped = clamp(parsed, min, max);
    onChange(clamped);
    setDraft(String(clamped));
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={fieldId} className="type-label text-foreground">
          {label}
        </label>
        <input
          id={fieldId}
          type="number"
          min={min}
          max={max}
          step={step}
          value={draft}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className={cn(
            'type-label w-16 rounded-sm border border-border bg-background px-2 py-2 text-center text-foreground',
            'min-h-11 tabular-nums',
            'focus-visible:ring-ring',
          )}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleSliderChange}
        aria-label={label}
        className={cn(
          'h-11 w-full cursor-pointer appearance-none rounded-sm bg-muted',
          'accent-primary',
          '[&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary',
          '[&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary',
        )}
      />
    </div>
  );
};
