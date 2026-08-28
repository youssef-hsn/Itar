import { Button } from '#/components/ui/button.tsx';
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
      {/* biome-ignore lint/a11y/useSemanticElements: action group, not form fieldset */}
      <div role="group" aria-label="Frame presets" className="grid grid-cols-2 gap-2">
        {presets.map((preset) => (
          <Button
            key={preset.id}
            variant="outline"
            onClick={() => onApply(preset.id)}
            className="justify-start text-left hover:border-primary"
          >
            {preset.name}
          </Button>
        ))}
      </div>
      <p className="type-label text-muted-foreground">
        Presets load a starting frame — every value stays editable after you apply one.
      </p>
    </section>
  );
};
