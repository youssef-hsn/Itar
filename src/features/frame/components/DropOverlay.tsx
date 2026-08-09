import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { frameCss } from '../frame.css.ts';
import { frameGeometry } from '../frame.geometry.ts';
import type { Frame } from '../frame.schema.ts';
import type { DragState } from '../hooks/useImageDrop.ts';

type DropOverlayProps = {
  dragState: DragState;
  rejectedMime: string | null;
};

const OVERLAY_FRAME: Frame = {
  padding: 12,
  matColor: '#ffffff',
  radius: 6,
  strokes: [
    { width: 2, color: '#1a3a3f' },
    { width: 1, color: '#c9a227' },
    { width: 2, color: '#1a3a3f' },
  ],
};

const PANEL_CONTENT = { width: 280, height: 120 };

function rejectMessage(mime: string | null): string {
  if (mime === 'image/svg+xml') {
    return "Itar frames images — SVG isn't supported (it can't export cleanly). Try PNG, JPEG, WebP, AVIF or GIF.";
  }

  const label = mime || 'this file type';
  return `Itar frames images — ${label} isn't supported. Try PNG, JPEG, WebP, AVIF or GIF.`;
}

export const DropOverlay = ({ dragState, rejectedMime }: DropOverlayProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (dragState === 'idle') {
      setVisible(false);
      return;
    }

    setVisible(false);
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [dragState]);

  if (dragState === 'idle') {
    return null;
  }

  const isAccept = dragState === 'accept';
  const panelGeometry = frameGeometry(OVERLAY_FRAME, PANEL_CONTENT);
  const panelFrameStyle = frameCss(panelGeometry);
  const motionStyle = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'scale(1)' : 'scale(0.98)',
    transition:
      'opacity var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out)',
  };
  const scrimStyle = isAccept
    ? undefined
    : {
        backgroundColor: 'color-mix(in oklch, var(--status-danger) 16%, var(--ink-900) 84% / 0.45)',
      };
  const rejectPanelStyle = isAccept
    ? panelFrameStyle
    : {
        ...panelFrameStyle,
        backgroundColor: 'color-mix(in oklch, var(--status-danger) 6%, var(--white) 94%)',
      };

  return (
    <div
      className={
        isAccept
          ? 'pointer-events-none fixed inset-0 flex items-center justify-center bg-ink-900/40 p-6'
          : 'pointer-events-none fixed inset-0 flex items-center justify-center p-6'
      }
      style={{ zIndex: 'var(--z-overlay, 40)', ...motionStyle, ...scrimStyle }}
      aria-hidden="true"
    >
      <div
        className="w-full max-w-sm"
        style={{
          ...rejectPanelStyle,
          ...motionStyle,
        }}
      >
        <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
          {isAccept ? (
            <>
              <p className="type-title text-foreground">Itar editor</p>
              <p className="type-body text-muted-foreground">Drop to frame it</p>
            </>
          ) : (
            <>
              <AlertTriangle
                className="size-8"
                style={{ color: 'var(--status-danger)' }}
                aria-hidden="true"
                strokeWidth={1.75}
              />
              <p className="type-title text-foreground">Unsupported file</p>
              <p className="type-body text-muted-foreground">{rejectMessage(rejectedMime)}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
