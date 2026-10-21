import { type MouseEvent, useEffect, useRef, useState } from 'react';
import { FramedBox } from '#/features/frame/components/FramedBox.tsx';
import { ScaleToFit } from '#/features/frame/components/ScaleToFit.tsx';
import { encodeFrame } from '#/features/frame/frame.codec.ts';
import { frameGeometry } from '#/features/frame/frame.geometry.ts';
import type { Preset } from '#/features/frame/frame.schema.ts';
import { cn } from '#/lib/utils.ts';
import type { PreviewSource } from '../hooks/usePresetPreview.ts';

const SAMPLE_SIZE = { width: 320, height: 240 };

type PresetCardProps = {
  preset: Preset;
  preview: PreviewSource;
  onSelect: (preset: Preset, event: MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
};

export const PresetCard = ({ preset, preview, onSelect, className }: PresetCardProps) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [boxSize, setBoxSize] = useState({ width: 260, height: 200 });

  const imageSize = preview?.size ?? SAMPLE_SIZE;
  const geometry = frameGeometry(preset.frame, imageSize);
  const { composedSize } = geometry;
  const scale = Math.min(
    1,
    boxSize.width / composedSize.width,
    boxSize.height / composedSize.height,
  );

  useEffect(() => {
    const box = boxRef.current;
    if (!box) {
      return;
    }

    const updateSize = () => {
      const { width, height } = box.getBoundingClientRect();
      if (width === 0 || height === 0) {
        return;
      }
      setBoxSize({ width, height });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const href = `/editor?f=${encodeURIComponent(encodeFrame(preset.frame))}`;
  const specLine = preset.frame.strokes.map((stroke) => `${stroke.width}px`).join(' · ');

  return (
    <a
      href={href}
      onClick={(event) => onSelect(preset, event)}
      className={cn(
        'flex min-w-0 flex-col items-center gap-3 rounded-md border border-border p-4',
        'transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]',
        'hover:border-primary hover:bg-muted',
        className,
      )}
    >
      <div
        ref={boxRef}
        className="flex aspect-[13/10] w-full max-w-full items-center justify-center"
      >
        <ScaleToFit width={composedSize.width} height={composedSize.height} scale={scale}>
          <FramedBox geometry={geometry}>
            {preview ? (
              <img
                src={preview.url}
                alt={`Framed with the ${preset.name} preset`}
                width={imageSize.width}
                height={imageSize.height}
                className="block max-w-none"
                style={{
                  borderRadius: geometry.roundImage ? geometry.radius : undefined,
                }}
              />
            ) : (
              <div
                className="block bg-muted"
                style={{
                  width: imageSize.width,
                  height: imageSize.height,
                }}
                aria-hidden="true"
              />
            )}
          </FramedBox>
        </ScaleToFit>
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="type-label text-foreground-strong">{preset.name}</span>
        <span className="type-caption tabular-nums text-muted-foreground">{specLine}</span>
      </div>
    </a>
  );
};
