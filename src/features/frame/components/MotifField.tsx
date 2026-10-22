import { MOTIF_IDS, type MotifId } from '../frame.schema.ts';
import { MOTIFS } from '../ornament/motif.ts';
import { MotifTile } from './MotifTile.tsx';
import { OptionRadioGroup } from './OptionRadioGroup.tsx';

type MotifFieldProps = {
  value: MotifId | null;
  ground: string;
  ink: string;
  onChange: (motif: MotifId | null) => void;
};

const TILE_SIZE = 28;

export const MotifField = ({ value, ground, ink, onChange }: MotifFieldProps) => {
  const options = [
    {
      value: null,
      label: 'None',
      preview: (
        <span
          className="block rounded-sm border border-border"
          style={{ width: TILE_SIZE, height: TILE_SIZE, backgroundColor: ground }}
        />
      ),
    },
    ...MOTIF_IDS.map((motifId) => ({
      value: motifId,
      label: MOTIFS[motifId].label,
      preview: <MotifTile motif={MOTIFS[motifId]} ground={ground} ink={ink} size={TILE_SIZE} />,
    })),
  ];

  return (
    <OptionRadioGroup<MotifId | null>
      label="Pattern"
      options={options}
      value={value}
      onChange={onChange}
      columns={3}
    />
  );
};
