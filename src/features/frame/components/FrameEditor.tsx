import { Image } from 'lucide-react';
import { throttle } from 'nuqs';
import { NuqsAdapter } from 'nuqs/adapters/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '#/lib/utils.ts';
import { exportPng, renderFrame } from '../frame.canvas.ts';
import { decodeFrame } from '../frame.codec.ts';
import { PRESETS } from '../frame.schema.ts';
import { useFrameState } from '../hooks/useFrameState.ts';
import { useImageDrop } from '../hooks/useImageDrop.ts';
import { DropOverlay } from './DropOverlay.tsx';
import { ExportBar } from './ExportBar.tsx';
import { FrameStage } from './FrameStage.tsx';
import { MatControls } from './MatControls.tsx';
import { NumberField } from './NumberField.tsx';
import { PresetPicker } from './PresetPicker.tsx';
import { StrokeStack } from './StrokeStack.tsx';

const INVALID_URL_MESSAGE = "That link's frame settings couldn't be read — showing the default.";
const EXPORT_FAILED_MESSAGE = 'Export failed — try again.';

function FrameEditorInner() {
  const {
    frame,
    addStroke,
    removeStroke,
    reorderStroke,
    updateStroke,
    setPadding,
    setMatColor,
    setRadius,
    applyPreset,
    maxStrokesReached,
  } = useFrameState();

  const {
    dragState,
    rejectedMime,
    liveRegionMessage,
    intake,
    bitmap,
    downscaleNotice,
    decodeError,
    unsupportedMessage,
    inputRef,
    acceptAttribute,
    triggerBrowse,
    onBrowseChange,
  } = useImageDrop();

  const [invalidUrlSettings, setInvalidUrlSettings] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFailed, setExportFailed] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('f');
    if (encoded && decodeFrame(encoded) === null) {
      setInvalidUrlSettings(true);
    }
  }, []);

  const handleDownload = useCallback(async () => {
    if (!bitmap) {
      return;
    }

    setIsExporting(true);
    setExportFailed(null);

    try {
      const canvas = renderFrame(bitmap, frame);
      const blob = await exportPng(canvas);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'itar-frame.png';
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      setExportFailed(EXPORT_FAILED_MESSAGE);
    } finally {
      setIsExporting(false);
    }
  }, [bitmap, frame]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      setLinkCopied(false);
    }
  }, []);

  const handleAddStroke = useCallback(() => {
    addStroke({ width: 4, color: '#1a3a3f' });
  }, [addStroke]);

  const liveMessage = useMemo(() => {
    if (exportFailed) {
      return exportFailed;
    }
    if (unsupportedMessage) {
      return unsupportedMessage;
    }
    if (decodeError) {
      return decodeError;
    }
    return liveRegionMessage;
  }, [decodeError, exportFailed, liveRegionMessage, unsupportedMessage]);

  const hasImage = bitmap !== null;
  const isDecoding = intake.status === 'decoding';

  return (
    <div className="mx-auto w-full max-w-[var(--container-max)] px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <FrameStage frame={frame} bitmap={bitmap} isDecoding={isDecoding} />

        <aside
          className={cn(
            'flex flex-col gap-8 rounded-md border border-border bg-background p-6',
            'lg:sticky lg:top-6 lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto lg:self-start',
          )}
        >
          <section className="flex flex-col gap-3" aria-labelledby="image-heading">
            <h2 id="image-heading" className="type-label text-foreground">
              Image
            </h2>
            <input
              ref={inputRef}
              type="file"
              accept={acceptAttribute}
              onChange={onBrowseChange}
              className="sr-only"
            />
            <button
              type="button"
              onClick={triggerBrowse}
              className={cn(
                'inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-border bg-background px-4 type-label text-foreground',
                'transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]',
                'hover:bg-muted',
                'focus-visible:ring-ring',
              )}
            >
              <Image className="size-4" aria-hidden="true" />
              {hasImage ? 'Replace image' : 'Browse for image'}
            </button>
            <p className="type-label text-muted-foreground">
              Drop anywhere on the page, paste from clipboard, or browse here.
            </p>
          </section>

          <PresetPicker presets={PRESETS} onApply={applyPreset} />
          <MatControls
            padding={frame.padding}
            matColor={frame.matColor}
            onPaddingChange={setPadding}
            onMatColorChange={setMatColor}
          />
          <StrokeStack
            strokes={frame.strokes}
            onUpdate={updateStroke}
            onReorder={reorderStroke}
            onRemove={removeStroke}
            onAdd={handleAddStroke}
            maxStrokesReached={maxStrokesReached}
          />

          <section className="flex flex-col gap-4" aria-labelledby="radius-heading">
            <h2 id="radius-heading" className="type-label text-foreground">
              Corner radius
            </h2>
            <NumberField
              label="Radius"
              value={frame.radius}
              onChange={setRadius}
              min={0}
              max={200}
            />
          </section>

          <ExportBar
            hasImage={hasImage}
            isExporting={isExporting}
            linkCopied={linkCopied}
            onDownload={() => void handleDownload()}
            onCopyLink={() => void handleCopyLink()}
          />

          {invalidUrlSettings && (
            <p className="type-label text-muted-foreground" role="status">
              {INVALID_URL_MESSAGE}
            </p>
          )}

          {unsupportedMessage && (
            <p className="type-label text-muted-foreground" role="status">
              {unsupportedMessage}
            </p>
          )}

          {decodeError && (
            <p className="type-label text-muted-foreground" role="status">
              {decodeError}
            </p>
          )}

          {downscaleNotice && (
            <p className="type-label text-muted-foreground" role="status">
              {downscaleNotice}
            </p>
          )}

          {exportFailed && (
            <p className="type-label text-muted-foreground" role="status">
              {exportFailed}
            </p>
          )}
        </aside>
      </div>

      <DropOverlay dragState={dragState} rejectedMime={rejectedMime} />

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </div>
    </div>
  );
}

export const FrameEditor = () => (
  <NuqsAdapter
    defaultOptions={{
      history: 'replace',
      limitUrlUpdates: throttle(300),
      clearOnDefault: true,
    }}
  >
    <FrameEditorInner />
  </NuqsAdapter>
);
