import { type ChangeEvent, useEffect, useId, useState } from 'react';
import { Input } from '#/components/ui/input.tsx';
import { Label } from '#/components/ui/label.tsx';
import { Slider } from '#/components/ui/slider.tsx';
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
    if (!Number.isNaN(parsed)) {
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
        <Label htmlFor={fieldId}>{label}</Label>
        <Input
          id={fieldId}
          type="number"
          min={min}
          max={max}
          step={step}
          value={draft}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="w-16 min-h-11 text-center tabular-nums"
        />
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([next]) => {
          if (next == null) return;
          onChange(next);
          setDraft(String(next));
        }}
        aria-label={label}
      />
    </div>
  );
};
