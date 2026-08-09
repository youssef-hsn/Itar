import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { cn } from '#/lib/utils.ts';
import { decodeFrame } from '../frame.codec.ts';
import { frameCss } from '../frame.css.ts';
import { frameGeometry } from '../frame.geometry.ts';
import { DEFAULT_FRAME, type Frame } from '../frame.schema.ts';

const SPECIMEN_PATH = '/specimen.jpg';
const SPECIMEN_SIZE = { width: 640, height: 480 };
const BOX_SIZE = { width: 400, height: 320 };

const SPECIMEN_ALT =
  'Landscape specimen photograph of a framed subject with wide mat and stacked Arabic border strokes';

export const HeroSpecimen = ({ className }: { className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState<Frame>(DEFAULT_FRAME);
  const [imageFailed, setImageFailed] = useState(false);
  const [scale, setScale] = useState(1);

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

  const geometry = frameGeometry(frame, SPECIMEN_SIZE);
  const { composedSize } = geometry;
  const frameStyle = frameCss(geometry);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const updateScale = () => {
      const next = Math.min(
        1,
        BOX_SIZE.width / composedSize.width,
        BOX_SIZE.height / composedSize.height,
      );
      setScale(next);
    };

    updateScale();
  }, [composedSize.width, composedSize.height]);

  return (
    <figure
      className={cn('mx-auto flex shrink-0 items-center justify-center', className)}
      aria-label="Example framed specimen"
    >
      <div
        ref={containerRef}
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
              {imageFailed ? (
                <div
                  className="block"
                  style={{
                    width: SPECIMEN_SIZE.width,
                    height: SPECIMEN_SIZE.height,
                    backgroundColor: frame.matColor,
                  }}
                  aria-hidden="true"
                />
              ) : (
                <img
                  src={SPECIMEN_PATH}
                  alt={SPECIMEN_ALT}
                  width={SPECIMEN_SIZE.width}
                  height={SPECIMEN_SIZE.height}
                  className="block max-w-none"
                  onError={() => setImageFailed(true)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
};
