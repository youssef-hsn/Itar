import { cn } from '#/lib/utils.ts';
import { ColorField } from './ColorField.tsx';
import { NumberField } from './NumberField.tsx';

type MatControlsProps = {
  padding: number;
  matColor: string;
  onPaddingChange: (padding: number) => void;
  onMatColorChange: (matColor: string) => void;
  className?: string;
};

export const MatControls = ({
  padding,
  matColor,
  onPaddingChange,
  onMatColorChange,
  className,
}: MatControlsProps) => {
  return (
    <section className={cn('flex flex-col gap-4', className)} aria-labelledby="mat-heading">
      <h2 id="mat-heading" className="type-label text-foreground">
        Mat
      </h2>
      <NumberField label="Padding" value={padding} onChange={onPaddingChange} min={0} max={400} />
      <ColorField label="Mat colour" value={matColor} onChange={onMatColorChange} />
    </section>
  );
};
