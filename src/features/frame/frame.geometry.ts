import type { Frame } from './frame.schema.ts';

export type Size = {
  width: number;
  height: number;
};

export type RingInset = {
  innerInset: number;
  outerInset: number;
  width: number;
  color: string;
};

export type FrameGeometry = {
  imageSize: Size;
  matPadding: number;
  matColor: string;
  radius: number;
  matBox: Size;
  rings: RingInset[];
  composedSize: Size;
  totalThickness: number;
};

export function frameGeometry(frame: Frame, imageSize: Size): FrameGeometry {
  const matBox: Size = {
    width: imageSize.width + frame.padding * 2,
    height: imageSize.height + frame.padding * 2,
  };

  const rings: RingInset[] = [];
  let cumulative = 0;

  for (const stroke of frame.strokes) {
    const innerInset = cumulative;
    cumulative += stroke.width;
    rings.push({
      innerInset,
      outerInset: cumulative,
      width: stroke.width,
      color: stroke.color,
    });
  }

  const totalThickness = cumulative;
  const composedSize: Size = {
    width: matBox.width + totalThickness * 2,
    height: matBox.height + totalThickness * 2,
  };

  return {
    imageSize,
    matPadding: frame.padding,
    matColor: frame.matColor,
    radius: frame.radius,
    matBox,
    rings,
    composedSize,
    totalThickness,
  };
}
