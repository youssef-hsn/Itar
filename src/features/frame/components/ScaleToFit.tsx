import type { ReactNode } from 'react';

type ScaleToFitProps = {
  width: number;
  height: number;
  scale: number;
  className?: string;
  children: ReactNode;
};

export const ScaleToFit = ({ width, height, scale, className, children }: ScaleToFitProps) => (
  <div
    className={className}
    style={{ width: width * scale, height: height * scale, overflow: 'hidden' }}
  >
    <div
      style={{
        width,
        height,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      }}
    >
      {children}
    </div>
  </div>
);
