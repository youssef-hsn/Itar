import { useCallback, useEffect, useState } from 'react';
import { classifyDropAsset } from '#/features/frame/dropAssets.ts';
import type { Size } from '#/features/frame/frame.geometry.ts';

export type PreviewSource = { url: string; size: Size } | null;

export function usePresetPreview() {
  const [file, setFileState] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewSource>(null);
  const [rejectedMime, setRejectedMime] = useState<string | null>(null);

  const setFile = useCallback((next: File) => {
    if (classifyDropAsset(next.type) !== 'accept') {
      setRejectedMime(next.type || 'that file type');
      return;
    }
    setRejectedMime(null);
    setFileState(next);
  }, []);

  useEffect(() => {
    if (!file) {
      return;
    }

    const url = URL.createObjectURL(file);
    const probe = new Image();
    let cancelled = false;

    probe.onload = () => {
      if (!cancelled) {
        setPreview({ url, size: { width: probe.naturalWidth, height: probe.naturalHeight } });
      }
    };
    probe.onerror = () => {
      if (!cancelled) {
        setPreview(null);
        setRejectedMime(file.type || 'that file type');
      }
    };
    probe.src = url;

    return () => {
      cancelled = true;
      URL.revokeObjectURL(url);
    };
  }, [file]);

  return { preview, file, setFile, rejectedMime };
}
