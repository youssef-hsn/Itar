import { frameGeometry } from './frame.geometry.ts';
import { framePaint } from './frame.paint.ts';
import { roundedRectPath } from './frame.path.ts';
import type { Frame } from './frame.schema.ts';

export const MAX_BITMAP_EDGE = 8192;
export const EXPORT_DOWNSCALE_NOTICE = 'Export was scaled down to fit the 8192px limit.';

export type RenderFrameResult = {
  canvas: HTMLCanvasElement;
  downscaled: boolean;
};

export function renderFrame(bitmap: ImageBitmap, frame: Frame): RenderFrameResult {
  const imageSize = { width: bitmap.width, height: bitmap.height };
  const geometry = frameGeometry(frame, imageSize);
  const { composedSize } = geometry;
  const longestEdge = Math.max(composedSize.width, composedSize.height);
  const scale = longestEdge > MAX_BITMAP_EDGE ? MAX_BITMAP_EDGE / longestEdge : 1;
  const downscaled = scale < 1;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(composedSize.width * scale);
  canvas.height = Math.round(composedSize.height * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }

  if (downscaled) {
    ctx.scale(scale, scale);
  }

  for (const op of framePaint(geometry)) {
    ctx.save();
    if (op.clip != null) {
      ctx.clip(new Path2D(op.clip), 'evenodd');
    }
    ctx.fillStyle = op.fill;
    ctx.fill(new Path2D(op.d), op.fillRule);
    ctx.restore();
  }

  const { totalThickness, matPadding, radius, roundImage } = geometry;
  const imageX = totalThickness + matPadding;
  const imageY = totalThickness + matPadding;

  if (roundImage) {
    ctx.save();
    ctx.clip(
      new Path2D(roundedRectPath(imageX, imageY, imageSize.width, imageSize.height, radius)),
    );
  }
  ctx.drawImage(bitmap, imageX, imageY, imageSize.width, imageSize.height);
  if (roundImage) {
    ctx.restore();
  }

  return { canvas, downscaled };
}

export function exportPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }
      reject(new Error('PNG export failed'));
    }, 'image/png');
  });
}
