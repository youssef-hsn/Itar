import { Check } from 'lucide-react';
import { type KeyboardEvent, useId, useRef } from 'react';
import { Button } from '#/components/ui/button.tsx';
import { cn } from '#/lib/utils.ts';
import { MOTIF_IDS, type MotifId } from '../frame.schema.ts';
import { MOTIFS } from '../ornament/motif.ts';
import { MotifTile } from './MotifTile.tsx';

type MotifFieldProps = {
  value: MotifId | null;
  ground: string;
  ink: string;
  onChange: (motif: MotifId | null) => void;
};

const TILE_SIZE = 28;
const OPTIONS: (MotifId | null)[] = [null, ...MOTIF_IDS];

const NEXT_KEYS: Record<string, number> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

export const MotifField = ({ value, ground, ink, onChange }: MotifFieldProps) => {
  const labelId = useId();
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = OPTIONS.indexOf(value);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = NEXT_KEYS[event.key];
    if (step == null) {
      return;
    }
    event.preventDefault();
    const next = (selectedIndex + step + OPTIONS.length) % OPTIONS.length;
    onChange(OPTIONS[next] ?? null);
    optionRefs.current[next]?.focus();
  };

  return (
    <div className="flex flex-col gap-2">
      <span id={labelId} className="type-label text-foreground">
        Pattern
      </span>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        onKeyDown={handleKeyDown}
        className="grid grid-cols-3 gap-2"
      >
        {OPTIONS.map((motifId, index) => {
          const isChecked = motifId === value;
          const motif = motifId == null ? null : MOTIFS[motifId];
          return (
            <Button
              key={motifId ?? 'none'}
              ref={(node) => {
                optionRefs.current[index] = node;
              }}
              role="radio"
              aria-checked={isChecked}
              tabIndex={isChecked ? 0 : -1}
              variant="outline"
              onClick={() => onChange(motifId)}
              className={cn(
                'relative h-auto flex-col gap-1 px-2 py-2 type-caption',
                isChecked ? 'border-primary text-foreground' : 'text-muted-foreground',
              )}
            >
              {motif == null ? (
                <span
                  className="block rounded-sm border border-border"
                  style={{ width: TILE_SIZE, height: TILE_SIZE, backgroundColor: ground }}
                />
              ) : (
                <MotifTile motif={motif} ground={ground} ink={ink} size={TILE_SIZE} />
              )}
              {motif?.label ?? 'None'}
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
