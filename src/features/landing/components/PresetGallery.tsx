import { Image } from 'lucide-react';
import { type MouseEvent, useCallback, useRef } from 'react';
import { Button } from '#/components/ui/button.tsx';
import { DropOverlay } from '#/features/frame/components/DropOverlay.tsx';
import { ACCEPTED_TYPES } from '#/features/frame/dropAssets.ts';
import { encodeFrame } from '#/features/frame/frame.codec.ts';
import { PRESETS, type Preset } from '#/features/frame/frame.schema.ts';
import { useDropTarget } from '#/features/frame/hooks/useDropTarget.ts';
import { stashImage } from '#/features/frame/imageHandoff.ts';
import { usePresetPreview } from '../hooks/usePresetPreview.ts';
import { PresetCard } from './PresetCard.tsx';

export const PresetGallery = () => {
  const { preview, file, setFile, rejectedMime } = usePresetPreview();
  const inputRef = useRef<HTMLInputElement>(null);

  const onFiles = useCallback(
    (files: FileList | readonly File[]) => {
      const first = Array.from(files)[0];
      if (first) {
        setFile(first);
      }
    },
    [setFile],
  );

  const { dragState, rejectedMime: dragRejectedMime } = useDropTarget({ onFiles });

  const onSelect = useCallback(
    (preset: Preset, event: MouseEvent<HTMLAnchorElement>) => {
      if (!file || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) {
        return;
      }

      event.preventDefault();
      const href = `/editor?f=${encodeURIComponent(encodeFrame(preset.frame))}`;
      void stashImage(file).then(() => {
        window.location.assign(href);
      });
    },
    [file],
  );

  const status = preview
    ? 'Your photo, in all four frames. Pick one to keep going.'
    : 'Drop a photo anywhere on this page to see it in all four.';

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PRESETS.map((preset) => (
          <PresetCard key={preset.id} preset={preset} preview={preview} onSelect={onSelect} />
        ))}
      </div>

      <div className="flex flex-col items-center gap-2">
        <p aria-live="polite" className="type-label text-center text-muted-foreground">
          {rejectedMime ? `Itar frames images — ${rejectedMime} isn't supported.` : status}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          className="sr-only"
          onChange={(event) => {
            const files = event.target.files;
            if (files) {
              onFiles(files);
            }
            event.target.value = '';
          }}
        />
        <Button variant="ghost" onClick={() => inputRef.current?.click()}>
          <Image className="size-4" aria-hidden="true" />
          Or browse for one
        </Button>
      </div>

      <DropOverlay dragState={dragState} rejectedMime={dragRejectedMime} />
    </div>
  );
};
