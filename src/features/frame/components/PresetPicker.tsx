import { cn } from '#/lib/utils.ts';
import type { Preset } from '../frame.schema.ts';

type PresetPickerProps = {
  presets: Preset[];
  onApply: (presetId: string) => void;
  className?: string;
};

export const PresetPicker = ({ presets, onApply, className }: PresetPickerProps) => {
  return (
    <section className={cn('flex flex-col gap-4', className)} aria-labelledby="presets-heading">
      <h2 id="presets-heading" className="type-label text-foreground">
        Presets
      </h2>
      <fieldset className="grid grid-cols-2 gap-2 border-0 p-0">
        <legend className="sr-only">Frame presets</legend>
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onApply(preset.id)}
            className={cn(
              'min-h-11 rounded-sm border border-border bg-background px-3 py-2 text-left type-label text-foreground',
              'transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]',
              'hover:border-primary hover:bg-muted',
              'focus-visible:ring-ring',
            )}
          >
            {preset.name}
          </button>
        ))}
      </fieldset>
      <p className="type-label text-muted-foreground">
        Presets load a starting frame — every value stays editable after you apply one.
      </p>
    </section>
  );
};
