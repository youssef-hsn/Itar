import { type CSSProperties, useEffect, useState } from 'react';
import { cn } from '#/lib/utils.ts';
import { decodeFrame } from '../frame.codec.ts';
import { frameCss } from '../frame.css.ts';
import { frameGeometry } from '../frame.geometry.ts';
import { DEFAULT_FRAME, type Frame } from '../frame.schema.ts';

const SPECIMEN_PATH = '/specimen.jpg';
const FALLBACK_SIZE = { width: 640, height: 480 };
const BOX_SIZE = { width: 400, height: 320 };

const SPECIMEN_ALT =
  'Landscape specimen photograph of a framed subject with wide mat and stacked Arabic border strokes';

type SpecimenStatus = 'pending' | 'loaded' | 'failed';

function computeScale(composedSize: { width: number; height: number }) {
  return Math.min(1, BOX_SIZE.width / composedSize.width, BOX_SIZE.height / composedSize.height);
}

export const HeroSpecimen = ({ className }: { className?: string }) => {
  const [frame, setFrame] = useState<Frame>(DEFAULT_FRAME);
  const [specimenStatus, setSpecimenStatus] = useState<SpecimenStatus>('pending');
  const [imageSize, setImageSize] = useState(FALLBACK_SIZE);

  useEffect(() => {
    const encoded = new URLSearchParams(window.location.search).get('f');
    if (!encoded) {
      return;
    }

    const decoded = decodeFrame(encoded);
    if (decoded) {
      setFrame(decoded);
    }
  }, []);

  useEffect(() => {
    const probe = new Image();
    probe.onload = () => {
      setSpecimenStatus('loaded');
      setImageSize({ width: probe.naturalWidth, height: probe.naturalHeight });
    };
    probe.onerror = () => setSpecimenStatus('failed');
    probe.src = SPECIMEN_PATH;
  }, []);

  const geometry = frameGeometry(frame, imageSize);
  const { composedSize } = geometry;
  const frameStyle = frameCss(geometry);
  const scale = computeScale(composedSize);

  return (
    <figure
      className={cn('mx-auto flex shrink-0 items-center justify-center', className)}
      aria-label="Example framed specimen"
    >
      <div
        className="relative flex items-center justify-center"
        style={{ width: BOX_SIZE.width, height: BOX_SIZE.height }}
      >
        <div
          style={{
            width: composedSize.width * scale,
            height: composedSize.height * scale,
          }}
        >
          <div
            style={
              {
                width: composedSize.width,
                height: composedSize.height,
                '--s': scale,
                transform: 'scale(var(--s))',
                transformOrigin: 'top left',
              } as CSSProperties
            }
          >
            <div style={frameStyle} className="inline-block">
              {specimenStatus === 'loaded' ? (
                <img
                  src={SPECIMEN_PATH}
                  alt={SPECIMEN_ALT}
                  width={imageSize.width}
                  height={imageSize.height}
                  className="block max-w-none"
                />
              ) : (
                <div
                  className="block"
                  style={{
                    width: imageSize.width,
                    height: imageSize.height,
                    backgroundColor: frame.matColor,
                  }}
                  aria-hidden="true"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
};
