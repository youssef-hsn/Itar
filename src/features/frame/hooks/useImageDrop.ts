import { type ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { ACCEPTED_TYPES, classifyDropAsset } from '../dropAssets.ts';
import { MAX_BITMAP_EDGE } from '../frame.canvas.ts';
import { useDropTarget } from './useDropTarget.ts';

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
  const [liveRegionMessage, setLiveRegionMessage] = useState('');
  const [intake, setIntake] = useState<ImageIntakeState>({ status: 'empty' });
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

  const { dragState, rejectedMime } = useDropTarget({
    onFiles: (files) => void intakeFiles(files),
  });

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
