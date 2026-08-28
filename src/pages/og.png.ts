import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { APIRoute } from 'astro';
import type { ReactNode } from 'react';
import satori from 'satori';
import sharp from 'sharp';
import { frameGeometry } from '#/features/frame/frame.geometry.ts';
import { DEFAULT_FRAME } from '#/features/frame/frame.schema.ts';

export const prerender = true;

const WIDTH = 1200;
const HEIGHT = 630;
const CARD = { width: 420, height: 300 };

const FONT_PATH = join(process.cwd(), 'src/assets/fonts/SourceSans3-Bold.ttf');

function ringStack() {
  const geometry = frameGeometry(DEFAULT_FRAME, CARD);

  return geometry.rings.reduce<Record<string, unknown>>(
    (inner, ring) => ({
      type: 'div',
      props: {
        style: {
          display: 'flex',
          padding: ring.width,
          backgroundColor: ring.color,
        },
        children: inner,
      },
    }),
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          width: CARD.width,
          height: CARD.height,
          padding: DEFAULT_FRAME.padding,
          backgroundColor: DEFAULT_FRAME.matColor,
        },
        children: null,
      },
    },
  );
}

export const GET: APIRoute = async () => {
  const fontData = await readFile(FONT_PATH);

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          width: WIDTH,
          height: HEIGHT,
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 72,
          backgroundColor: '#fbfcfc',
          fontFamily: 'Source Sans 3',
        },
        children: [
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 560 },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { fontSize: 30, color: '#1f6b78', letterSpacing: '-0.01em' },
                    children: 'Itar',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 64,
                      lineHeight: 1.1,
                      color: '#1b2b2e',
                      letterSpacing: '-0.02em',
                    },
                    children: 'Put an Arabic border on any image.',
                  },
                },
              ],
            },
          },
          ringStack(),
        ],
      },
    } as ReactNode,
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [{ name: 'Source Sans 3', data: fontData, weight: 700, style: 'normal' }],
    },
  );

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
