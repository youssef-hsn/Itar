import { useEffect, useRef, useState } from 'react';
import { classifyDropAsset } from '../dropAssets.ts';

export type DragState = 'idle' | 'accept' | 'reject';

type DragVerdict = {
  state: DragState;
  rejectedMime: string | null;
};

export function classifyDragTypes(hasFiles: boolean, itemTypes: readonly string[]): DragVerdict {
  if (!hasFiles) {
    return { state: 'idle', rejectedMime: null };
  }

  let hasAccept = false;
  let rejectedMime: string | null = null;

  for (const type of itemTypes) {
    const verdict = classifyDropAsset(type);
    if (verdict === 'accept') {
      hasAccept = true;
    }
    if (verdict === 'reject' && rejectedMime == null) {
      rejectedMime = type;
    }
  }

  if (hasAccept) {
    return { state: 'accept', rejectedMime: null };
  }
  if (rejectedMime != null) {
    return { state: 'reject', rejectedMime };
  }

  return { state: 'accept', rejectedMime: null };
}

function readDragVerdict(dataTransfer: DataTransfer | null): DragVerdict {
  if (!dataTransfer) {
    return { state: 'idle', rejectedMime: null };
  }

  const itemTypes: string[] = [];
  for (let index = 0; index < dataTransfer.items.length; index += 1) {
    itemTypes.push(dataTransfer.items[index]?.type ?? '');
  }

  return classifyDragTypes(dataTransfer.types.includes('Files'), itemTypes);
}

type DropTargetOptions = {
  onFiles: (files: FileList | readonly File[]) => void;
};

export function useDropTarget({ onFiles }: DropTargetOptions) {
  const [dragState, setDragState] = useState<DragState>('idle');
  const [rejectedMime, setRejectedMime] = useState<string | null>(null);
  const depthRef = useRef(0);
  const onFilesRef = useRef(onFiles);

  onFilesRef.current = onFiles;

  useEffect(() => {
    const applyVerdict = (dataTransfer: DataTransfer | null) => {
      const { state, rejectedMime: mime } = readDragVerdict(dataTransfer);
      setDragState(state);
      setRejectedMime(mime);
    };

    const reset = () => {
      depthRef.current = 0;
      setDragState('idle');
      setRejectedMime(null);
    };

    const onDragEnter = (event: DragEvent) => {
      event.preventDefault();
      depthRef.current += 1;
      if (depthRef.current === 1) {
        applyVerdict(event.dataTransfer);
      }
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
      applyVerdict(event.dataTransfer);
    };

    const onDrop = (event: DragEvent) => {
      event.preventDefault();
      reset();
      const files = event.dataTransfer?.files;
      if (files) {
        onFilesRef.current(files);
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
          onFilesRef.current([file]);
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
  }, []);

  return { dragState, rejectedMime };
}
