import { type ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { ACCEPTED_TYPES, classifyDropAsset } from '../dropAssets.ts';
import { MAX_BITMAP_EDGE } from '../frame.canvas.ts';

export type DragState = 'idle' | 'accept' | 'reject';

export type ImageIntakeState =
  | { status: 'empty' }
  | { status: 'decoding' }
  | { status: 'ready'; bitmap: ImageBitmap; downscaled: boolean }
  | { status: 'decode-failed'; message: string }
  | { status: 'unsupported'; mime: string };

const DECODE_FAILED_MESSAGE = "That image couldn't be opened — try PNG, JPEG, WebP, AVIF or GIF.";

const DOWNSCALE_NOTICE = 'Image was resized to fit the 8192px export limit.';

function unsupportedMessage(mime: string): string {
  if (mime === 'image/svg+xml') {
    return "Itar frames images — SVG isn't supported (it can't export cleanly). Try PNG, JPEG, WebP, AVIF or GIF.";
  }

  const label = mime || 'this file type';
  return `Itar frames images — ${label} isn't supported. Try PNG, JPEG, WebP, AVIF or GIF.`;
}

function classifyDrag(dataTransfer: DataTransfer): {
  state: DragState;
  rejectedMime: string | null;
} {
  if (!dataTransfer.types.includes('Files')) {
    return { state: 'idle', rejectedMime: null };
  }

  let hasAccept = false;
  let hasReject = false;
  let rejectedMime: string | null = null;

  for (let index = 0; index < dataTransfer.items.length; index += 1) {
    const type = dataTransfer.items[index]?.type ?? '';
    const verdict = classifyDropAsset(type);
    if (verdict === 'accept') {
      hasAccept = true;
    }
    if (verdict === 'reject') {
      hasReject = true;
      if (!rejectedMime) {
        rejectedMime = type;
      }
    }
  }

  if (hasAccept) {
    return { state: 'accept', rejectedMime: null };
  }
  if (hasReject) {
    return { state: 'reject', rejectedMime };
  }

  return { state: 'accept', rejectedMime: null };
}

async function decodeBitmap(source: Blob): Promise<{ bitmap: ImageBitmap; downscaled: boolean }> {
  const bitmap = await createImageBitmap(source, { imageOrientation: 'from-image' });
  const longestEdge = Math.max(bitmap.width, bitmap.height);

  if (longestEdge <= MAX_BITMAP_EDGE) {
    return { bitmap, downscaled: false };
  }

  const scale = MAX_BITMAP_EDGE / longestEdge;
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext('2d');

  if (!context) {
    bitmap.close();
    throw new Error('Canvas is unavailable for downscaling.');
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const scaled = await createImageBitmap(canvas);
  return { bitmap: scaled, downscaled: true };
}

export function useImageDrop() {
  const [dragState, setDragState] = useState<DragState>('idle');
  const [rejectedMime, setRejectedMime] = useState<string | null>(null);
  const [liveRegionMessage, setLiveRegionMessage] = useState('');
  const [intake, setIntake] = useState<ImageIntakeState>({ status: 'empty' });
  const depthRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const intakeGenerationRef = useRef(0);
  const intakeRef = useRef(intake);

  intakeRef.current = intake;

  const closeCurrentBitmap = useCallback(() => {
    const current = intakeRef.current;
    if (current.status === 'ready') {
      current.bitmap.close();
    }
  }, []);

  const intakeFile = useCallback(
    async (file: File) => {
      const generation = intakeGenerationRef.current + 1;
      intakeGenerationRef.current = generation;
      const isStale = () => generation !== intakeGenerationRef.current;

      const verdict = classifyDropAsset(file.type);
      if (verdict !== 'accept') {
        closeCurrentBitmap();
        if (isStale()) {
          return;
        }
        setIntake({ status: 'unsupported', mime: file.type });
        setLiveRegionMessage(unsupportedMessage(file.type));
        return;
      }

      closeCurrentBitmap();
      if (isStale()) {
        return;
      }
      setIntake({ status: 'decoding' });
      setLiveRegionMessage('Decoding image.');

      try {
        const { bitmap, downscaled } = await decodeBitmap(file);
        if (isStale()) {
          bitmap.close();
          return;
        }
        setIntake({ status: 'ready', bitmap, downscaled });
        setLiveRegionMessage(downscaled ? `Image loaded. ${DOWNSCALE_NOTICE}` : 'Image loaded.');
      } catch {
        if (isStale()) {
          return;
        }
        setIntake({ status: 'decode-failed', message: DECODE_FAILED_MESSAGE });
        setLiveRegionMessage(DECODE_FAILED_MESSAGE);
      }
    },
    [closeCurrentBitmap],
  );

  const intakeFiles = useCallback(
    async (files: FileList | readonly File[]) => {
      const first = Array.from(files)[0];
      if (first) {
        await intakeFile(first);
      }
    },
    [intakeFile],
  );

  const triggerBrowse = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const onBrowseChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files) {
        void intakeFiles(files);
      }
      event.target.value = '';
    },
    [intakeFiles],
  );

  useEffect(() => {
    const onDragEnter = (event: DragEvent) => {
      event.preventDefault();
      depthRef.current += 1;
      if (depthRef.current !== 1) {
        return;
      }
      const { state, rejectedMime: mime } = classifyDrag(event.dataTransfer ?? new DataTransfer());
      setDragState(state);
      setRejectedMime(mime);
    };

    const onDragLeave = (event: DragEvent) => {
      event.preventDefault();
      depthRef.current = Math.max(0, depthRef.current - 1);
      if (depthRef.current === 0) {
        setDragState('idle');
        setRejectedMime(null);
      }
    };

    const onDragOver = (event: DragEvent) => {
      event.preventDefault();
      const { state, rejectedMime: mime } = classifyDrag(event.dataTransfer ?? new DataTransfer());
      setDragState(state);
      setRejectedMime(mime);
    };

    const onDrop = (event: DragEvent) => {
      event.preventDefault();
      depthRef.current = 0;
      setDragState('idle');
      setRejectedMime(null);
      const files = event.dataTransfer?.files;
      if (files) {
        void intakeFiles(files);
      }
    };

    const onPaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) {
        return;
      }

      for (let index = 0; index < items.length; index += 1) {
        const item = items[index];
        if (item?.kind !== 'file') {
          continue;
        }
        const file = item.getAsFile();
        if (file) {
          event.preventDefault();
          void intakeFile(file);
          return;
        }
      }
    };

    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('drop', onDrop);
    window.addEventListener('paste', onPaste);

    return () => {
      window.removeEventListener('dragenter', onDragEnter);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('drop', onDrop);
      window.removeEventListener('paste', onPaste);
    };
  }, [intakeFile, intakeFiles]);

  useEffect(() => {
    return () => {
      closeCurrentBitmap();
    };
  }, [closeCurrentBitmap]);

  const downscaled = intake.status === 'ready' ? intake.downscaled : false;
  const downscaleNotice = downscaled ? DOWNSCALE_NOTICE : null;

  return {
    dragState,
    rejectedMime,
    liveRegionMessage,
    intake,
    bitmap: intake.status === 'ready' ? intake.bitmap : null,
    downscaled,
    downscaleNotice,
    decodeError: intake.status === 'decode-failed' ? intake.message : null,
    unsupportedMime: intake.status === 'unsupported' ? intake.mime : null,
    unsupportedMessage: intake.status === 'unsupported' ? unsupportedMessage(intake.mime) : null,
    inputRef,
    acceptAttribute: ACCEPTED_TYPES.join(','),
    triggerBrowse,
    onBrowseChange,
    intakeFile,
    intakeFiles,
  };
}
