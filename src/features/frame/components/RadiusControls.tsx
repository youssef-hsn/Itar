import { useId } from 'react';
import { NumberField } from './NumberField.tsx';

type RadiusControlsProps = {
  radius: number;
  roundImage: boolean;
  onRadiusChange: (radius: number) => void;
  onRoundImageChange: (roundImage: boolean) => void;
};

export const RadiusControls = ({
  radius,
  roundImage,
  onRadiusChange,
  onRoundImageChange,
}: RadiusControlsProps) => {
  const id = useId();

  return (
    <section className="flex flex-col gap-4" aria-labelledby="radius-heading">
      <h2 id="radius-heading" className="type-label text-foreground">
        Corner radius
      </h2>
      <NumberField label="Radius" value={radius} onChange={onRadiusChange} min={0} max={200} />
      <label htmlFor={id} className="flex min-h-11 cursor-pointer items-center gap-3">
        <input
          id={id}
          type="checkbox"
          checked={roundImage}
          onChange={(event) => onRoundImageChange(event.target.checked)}
          className="size-5 shrink-0 accent-primary"
        />
        <span className="type-label text-foreground">Round the picture</span>
      </label>
    </section>
  );
};
