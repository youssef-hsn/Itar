import { type ChangeEvent, useId } from 'react';
import { cn } from '#/lib/utils.ts';

type ColorFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
};

const parseColor = (value: string): { rgb: string; alpha: number } => {
  const hex = value.startsWith('#') ? value.slice(1) : value;
  const rgb = `#${hex.slice(0, 6).padEnd(6, '0')}`;
  const alphaHex = hex.length >= 8 ? hex.slice(6, 8) : 'ff';
  const alpha = Math.round((Number.parseInt(alphaHex, 16) / 255) * 100);
  return { rgb, alpha };
};

const composeColor = (rgb: string, alphaPercent: number): string => {
  const rgbHex = rgb.replace('#', '').slice(0, 6);
  if (alphaPercent >= 100) {
    return `#${rgbHex}`;
  }
  const alphaByte = Math.round((alphaPercent / 100) * 255);
  const alphaHex = alphaByte.toString(16).padStart(2, '0');
  return `#${rgbHex}${alphaHex}`;
};

const isValidHex = (input: string): boolean => /^#[0-9a-fA-F]{6}$/.test(input);

export const ColorField = ({ label, value, onChange, id, className }: ColorFieldProps) => {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const { rgb, alpha } = parseColor(value);

  const handlePickerChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(composeColor(event.target.value, alpha));
  };

  const handleHexChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    const normalized = input.startsWith('#') ? input : `#${input}`;
    if (isValidHex(normalized)) {
      onChange(composeColor(normalized, alpha));
    }
  };

  const handleAlphaChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextAlpha = Math.min(100, Math.max(0, Number.parseInt(event.target.value, 10) || 0));
    onChange(composeColor(rgb, nextAlpha));
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={fieldId} className="type-label text-foreground">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <div className="relative shrink-0">
          <span
            className="block size-11 rounded-sm border border-border"
            style={{ backgroundColor: value }}
            aria-hidden="true"
          />
          <input
            type="color"
            value={rgb}
            onChange={handlePickerChange}
            aria-label={`${label} picker`}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
          />
        </div>
        <input
          id={fieldId}
          type="text"
          value={rgb}
          onChange={handleHexChange}
          spellCheck={false}
          autoComplete="off"
          className={cn(
            'type-label min-h-11 flex-1 rounded-sm border border-border bg-background px-3 font-mono text-foreground uppercase',
            'focus-visible:ring-ring',
          )}
          aria-label={`${label} hex`}
        />
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={0}
            max={100}
            value={alpha}
            onChange={handleAlphaChange}
            aria-label={`${label} opacity`}
            className={cn(
              'type-label w-14 min-h-11 rounded-sm border border-border bg-background px-2 text-center text-foreground tabular-nums',
              'focus-visible:ring-ring',
            )}
          />
          <span className="type-label text-muted-foreground">%</span>
        </div>
      </div>
    </div>
  );
};
