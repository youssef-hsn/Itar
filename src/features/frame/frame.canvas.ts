import { frameGeometry } from './frame.geometry.ts';
import type { Frame } from './frame.schema.ts';

export const MAX_BITMAP_EDGE = 8192;

function parseAlpha(color: string): number {
  if (color.length === 9) {
    return Number.parseInt(color.slice(7, 9), 16) / 255;
  }
  return 1;
}

function traceRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.arcTo(x + width, y, x + width, y + r, r);
  ctx.lineTo(x + width, y + height - r);
  ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
  ctx.lineTo(x + r, y + height);
  ctx.arcTo(x, y + height, x, y + height - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

export function renderFrame(bitmap: ImageBitmap, frame: Frame): HTMLCanvasElement {
  const imageSize = { width: bitmap.width, height: bitmap.height };
  const geometry = frameGeometry(frame, imageSize);
  const canvas = document.createElement('canvas');
  canvas.width = geometry.composedSize.width;
  canvas.height = geometry.composedSize.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }

  const { matBox, totalThickness, matPadding, radius, matColor, rings } = geometry;
  const matX = totalThickness;
  const matY = totalThickness;
  const matW = matBox.width;
  const matH = matBox.height;

  for (const ring of rings) {
    if (parseAlpha(ring.color) === 0) {
      continue;
    }

    ctx.beginPath();
    traceRoundedRect(
      ctx,
      matX - ring.outerInset,
      matY - ring.outerInset,
      matW + ring.outerInset * 2,
      matH + ring.outerInset * 2,
      radius + ring.outerInset,
    );
    traceRoundedRect(
      ctx,
      matX - ring.innerInset,
      matY - ring.innerInset,
      matW + ring.innerInset * 2,
      matH + ring.innerInset * 2,
      radius + ring.innerInset,
    );
    ctx.fillStyle = ring.color;
    ctx.fill('evenodd');
  }

  ctx.beginPath();
  traceRoundedRect(ctx, matX, matY, matW, matH, radius);
  ctx.fillStyle = matColor;
  ctx.fill();

  ctx.drawImage(bitmap, matX + matPadding, matY + matPadding, imageSize.width, imageSize.height);

  return canvas;
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
