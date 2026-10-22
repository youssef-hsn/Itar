import { Check, ChevronsUpDown } from 'lucide-react';
import { useEffect } from 'react';
import { buttonVariants } from '#/components/ui/button.tsx';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxIcon,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from '#/components/ui/combobox.tsx';
import { cn } from '#/lib/utils.ts';
import { MOTIF_IDS, type MotifId } from '../frame.schema.ts';
import { MOTIFS } from '../ornament/motif.ts';
import { MotifTile } from './MotifTile.tsx';

type MotifOption = { value: MotifId | null; label: string };

type MotifFieldProps = {
  value: MotifId | null;
  ground: string;
  ink: string;
  onChange: (motif: MotifId | null) => void;
  onPreview: (motif: MotifId | null) => void;
  onPreviewEnd: () => void;
};

const TILE_SIZE = 28;

const MOTIF_OPTIONS: MotifOption[] = [
  { value: null, label: 'None' },
  ...MOTIF_IDS.map((motifId) => ({ value: motifId, label: MOTIFS[motifId].label })),
];

type SwatchProps = { motif: MotifId | null; ground: string; ink: string };

const Swatch = ({ motif, ground, ink }: SwatchProps) => {
  if (motif == null) {
    return (
      <span
        className="block shrink-0 rounded-sm border border-border"
        style={{ width: TILE_SIZE, height: TILE_SIZE, backgroundColor: ground }}
      />
    );
  }
  return <MotifTile motif={MOTIFS[motif]} ground={ground} ink={ink} size={TILE_SIZE} />;
};

export const MotifField = ({
  value,
  ground,
  ink,
  onChange,
  onPreview,
  onPreviewEnd,
}: MotifFieldProps) => {
  useEffect(() => onPreviewEnd, [onPreviewEnd]);

  const selected = MOTIF_OPTIONS.find((option) => option.value === value) ?? MOTIF_OPTIONS[0];

  return (
    <Combobox<MotifOption>
      items={MOTIF_OPTIONS}
      value={selected}
      onValueChange={(option) => {
        if (option == null) {
          return;
        }
        onChange(option.value);
        onPreviewEnd();
      }}
      onItemHighlighted={(option) => (option == null ? onPreviewEnd() : onPreview(option.value))}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onPreviewEnd();
        }
      }}
    >
      <div className="flex flex-col gap-2">
        <ComboboxLabel className="type-label text-foreground">Pattern</ComboboxLabel>
        <ComboboxTrigger
          className={cn(buttonVariants({ variant: 'outline' }), 'justify-start gap-3 px-2')}
        >
          <Swatch motif={value} ground={ground} ink={ink} />
          <span className="flex-1 text-left">{selected?.label}</span>
          <ComboboxIcon className="text-muted-foreground">
            <ChevronsUpDown className="size-4" aria-hidden="true" />
          </ComboboxIcon>
        </ComboboxTrigger>
      </div>
      <ComboboxContent>
        <ComboboxInput placeholder="Search patterns" />
        <ComboboxEmpty>No patterns match.</ComboboxEmpty>
        <ComboboxList>
          {(option: MotifOption) => (
            <ComboboxItem key={option.value ?? 'none'} value={option}>
              <Swatch motif={option.value} ground={ground} ink={ink} />
              <span className="flex-1">{option.label}</span>
              <ComboboxItemIndicator>
                <Check className="size-4 text-primary" aria-hidden="true" />
              </ComboboxItemIndicator>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};
