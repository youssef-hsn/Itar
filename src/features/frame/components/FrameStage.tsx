import { useEffect, useRef, useState } from 'react';
import { cn } from '#/lib/utils.ts';
import { frameGeometry } from '../frame.geometry.ts';
import type { Frame } from '../frame.schema.ts';
import { FramedBox } from './FramedBox.tsx';
import { ScaleToFit } from './ScaleToFit.tsx';

const PLACEHOLDER_SIZE = { width: 480, height: 360 };

type FrameStageProps = {
  frame: Frame;
  bitmap: ImageBitmap | null;
  isDecoding?: boolean;
  className?: string;
};

export const FrameStage = ({ frame, bitmap, isDecoding = false, className }: FrameStageProps) => {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);

  const imageSize = bitmap ? { width: bitmap.width, height: bitmap.height } : PLACEHOLDER_SIZE;
  const geometry = frameGeometry(frame, imageSize);
  const { composedSize } = geometry;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const updateScale = () => {
      const { width, height } = container.getBoundingClientRect();
      if (width === 0 || height === 0) {
        return;
      }
      const next = Math.min(1, width / composedSize.width, height / composedSize.height);
      setScale(next);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(container);
    return () => observer.disconnect();
  }, [composedSize.width, composedSize.height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!bitmap || !canvas) {
      return;
    }

    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }
    context.drawImage(bitmap, 0, 0);
  }, [bitmap]);

  return (
    <section
      ref={containerRef}
      aria-label="Frame preview"
      className={cn(
        'relative flex min-h-[min(40vh,20rem)] w-full min-w-0 items-center justify-center rounded-md bg-muted/40 p-4 lg:min-h-[min(50vh,28rem)]',
        className,
      )}
    >
      <ScaleToFit width={composedSize.width} height={composedSize.height} scale={scale}>
        <FramedBox geometry={geometry}>
          {bitmap ? (
            <canvas
              ref={canvasRef}
              className="block max-w-none"
              style={{ borderRadius: geometry.roundImage ? geometry.radius : undefined }}
              aria-label="Uploaded image preview"
            />
          ) : (
            <div
              className={cn(
                'flex items-center justify-center bg-muted type-label text-muted-foreground',
                isDecoding && 'opacity-60',
              )}
              style={{
                width: imageSize.width,
                height: imageSize.height,
                borderRadius: geometry.roundImage ? geometry.radius : undefined,
              }}
              aria-hidden={isDecoding}
            >
              {isDecoding ? 'Opening image…' : 'your image'}
            </div>
          )}
        </FramedBox>
      </ScaleToFit>
    </section>
  );
};
