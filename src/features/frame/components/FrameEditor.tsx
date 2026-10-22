import { Image } from 'lucide-react';
import { throttle } from 'nuqs';
import { NuqsAdapter } from 'nuqs/adapters/react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '#/components/ui/alert.tsx';
import { Button } from '#/components/ui/button.tsx';
import { Toaster } from '#/components/ui/sonner.tsx';
import { cn } from '#/lib/utils.ts';
import { EXPORT_DOWNSCALE_NOTICE, exportPng, renderFrame } from '../frame.canvas.ts';
import { decodeFrame } from '../frame.codec.ts';
import { type MotifId, PRESETS } from '../frame.schema.ts';
import { useFrameState } from '../hooks/useFrameState.ts';
import { useImageDrop } from '../hooks/useImageDrop.ts';
import { takeStashedImage } from '../imageHandoff.ts';
import { type MotifPreview, withMotifPreview } from '../ornamentPatch.ts';
import { DropOverlay } from './DropOverlay.tsx';
import { ExportBar } from './ExportBar.tsx';
import { FrameStage } from './FrameStage.tsx';
import { MatControls } from './MatControls.tsx';
import { PresetPicker } from './PresetPicker.tsx';
import { RadiusControls } from './RadiusControls.tsx';
import { StrokeStack } from './StrokeStack.tsx';

const INVALID_URL_MESSAGE = "That link's frame settings couldn't be read — showing the default.";
const EXPORT_FAILED_MESSAGE = 'Export failed — try again.';
const COPY_FAILED_MESSAGE = "Couldn't copy — check browser permissions.";

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
    setRoundImage,
    applyPreset,
    maxStrokesReached,
  } = useFrameState();

  const {
    dragState,
    rejectedMime,
    intake,
    bitmap,
    downscaleNotice,
    decodeError,
    unsupportedMessage,
    inputRef,
    acceptAttribute,
    triggerBrowse,
    onBrowseChange,
    intakeFile,
  } = useImageDrop();

  const [invalidUrlSettings, setInvalidUrlSettings] = useState(false);
  const [motifPreview, setMotifPreview] = useState<MotifPreview | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFailed, setExportFailed] = useState<string | null>(null);
  const [exportDownscaleNotice, setExportDownscaleNotice] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('f');
    if (encoded && decodeFrame(encoded) === null) {
      setInvalidUrlSettings(true);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    void takeStashedImage().then((file) => {
      if (!cancelled && file) {
        void intakeFile(file);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [intakeFile]);

  useEffect(() => {
    if (unsupportedMessage) {
      toast.error(unsupportedMessage);
    }
  }, [unsupportedMessage]);

  useEffect(() => {
    if (decodeError) {
      toast.error(decodeError);
    }
  }, [decodeError]);

  useEffect(() => {
    if (downscaleNotice) {
      toast.info(downscaleNotice);
    }
  }, [downscaleNotice]);

  useEffect(() => {
    if (exportFailed) {
      toast.error(exportFailed);
    }
  }, [exportFailed]);

  useEffect(() => {
    if (exportDownscaleNotice) {
      toast.info(exportDownscaleNotice);
    }
  }, [exportDownscaleNotice]);

  useEffect(() => {
    if (copyFailed) {
      toast.error(copyFailed);
    }
  }, [copyFailed]);

  const handleDownload = useCallback(async () => {
    if (!bitmap) {
      return;
    }

    setIsExporting(true);
    setExportFailed(null);
    setExportDownscaleNotice(null);

    try {
      const { canvas, downscaled } = renderFrame(bitmap, frame);
      if (downscaled) {
        setExportDownscaleNotice(EXPORT_DOWNSCALE_NOTICE);
      }
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
    setCopyFailed(null);
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      setLinkCopied(false);
      setCopyFailed(COPY_FAILED_MESSAGE);
    }
  }, []);

  const handlePreviewMotif = useCallback((index: number, motif: MotifId | null) => {
    setMotifPreview({ index, motif });
  }, []);

  const handlePreviewEnd = useCallback(() => {
    setMotifPreview(null);
  }, []);

  const handleAddStroke = useCallback(() => {
    addStroke({ width: 4, color: '#1a3a3f' });
  }, [addStroke]);

  const hasImage = bitmap !== null;
  const isDecoding = intake.status === 'decoding';

  return (
    <div className="mx-auto w-full max-w-[var(--container-max)] px-4 py-8">
      <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <FrameStage
          frame={withMotifPreview(frame, motifPreview)}
          bitmap={bitmap}
          isDecoding={isDecoding}
        />

        <aside
          className={cn(
            'flex min-w-0 flex-col gap-8 rounded-md border border-border bg-background p-6',
            'lg:sticky lg:top-20 lg:max-h-[calc(100dvh-5rem)] lg:overflow-y-auto lg:self-start',
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
            <Button variant="outline" onClick={triggerBrowse}>
              <Image className="size-4" aria-hidden="true" />
              {hasImage ? 'Replace image' : 'Browse for image'}
            </Button>
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
            onPreviewMotif={handlePreviewMotif}
            onPreviewEnd={handlePreviewEnd}
            maxStrokesReached={maxStrokesReached}
          />

          <RadiusControls
            radius={frame.radius}
            roundImage={frame.roundImage}
            onRadiusChange={setRadius}
            onRoundImageChange={setRoundImage}
          />

          <ExportBar
            hasImage={hasImage}
            isExporting={isExporting}
            linkCopied={linkCopied}
            onDownload={() => void handleDownload()}
            onCopyLink={() => void handleCopyLink()}
          />

          {invalidUrlSettings && (
            <Alert role="status">
              <AlertDescription>{INVALID_URL_MESSAGE}</AlertDescription>
            </Alert>
          )}
        </aside>
      </div>

      <DropOverlay dragState={dragState} rejectedMime={rejectedMime} />
      <Toaster style={{ zIndex: 'var(--z-toast)' }} />
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
