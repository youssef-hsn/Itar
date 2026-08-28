import type { CSSProperties, MouseEvent } from 'react';
import { encodeFrame } from '#/features/frame/frame.codec.ts';
import { frameCss } from '#/features/frame/frame.css.ts';
import { frameGeometry } from '#/features/frame/frame.geometry.ts';
import type { Preset } from '#/features/frame/frame.schema.ts';
import { cn } from '#/lib/utils.ts';
import type { PreviewSource } from '../hooks/usePresetPreview.ts';

const BOX_SIZE = { width: 260, height: 200 };
const SAMPLE_SIZE = { width: 320, height: 240 };

type PresetCardProps = {
  preset: Preset;
  preview: PreviewSource;
  onSelect: (preset: Preset, event: MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
};

export const PresetCard = ({ preset, preview, onSelect, className }: PresetCardProps) => {
  const imageSize = preview?.size ?? SAMPLE_SIZE;
  const geometry = frameGeometry(preset.frame, imageSize);
  const { composedSize } = geometry;
  const frameStyle = frameCss(geometry);
  const scale = Math.min(
    1,
    BOX_SIZE.width / composedSize.width,
    BOX_SIZE.height / composedSize.height,
  );

  const href = `/editor?f=${encodeURIComponent(encodeFrame(preset.frame))}`;
  const specLine = preset.frame.strokes.map((stroke) => `${stroke.width}px`).join(' · ');

  return (
    <a
      href={href}
      onClick={(event) => onSelect(preset, event)}
      className={cn(
        'flex flex-col items-center gap-3 rounded-md border border-border p-4',
        'transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]',
        'hover:border-primary hover:bg-muted',
        className,
      )}
    >
      <div
        className="flex items-center justify-center"
        style={{ width: BOX_SIZE.width, height: BOX_SIZE.height }}
      >
        <div style={{ width: composedSize.width * scale, height: composedSize.height * scale }}>
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
              {preview ? (
                <img
                  src={preview.url}
                  alt={`Framed with the ${preset.name} preset`}
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
                    backgroundColor: preset.frame.matColor,
                  }}
                  aria-hidden="true"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="type-label text-foreground-strong">{preset.name}</span>
        <span className="type-caption tabular-nums text-muted-foreground">{specLine}</span>
      </div>
    </a>
  );
};
