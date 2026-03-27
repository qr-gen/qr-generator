import type { RenderOptions } from '../types';
import { renderSVG } from '../svg/renderer';
import { renderPNG } from '../png/renderer';
import { renderBMP } from '../bmp/renderer';
import { base64Encode } from '../utils/base64';

export type DataURIFormat = 'svg' | 'png' | 'bmp';

const MIME_TYPES: Record<DataURIFormat, string> = {
  svg: 'image/svg+xml',
  png: 'image/png',
  bmp: 'image/bmp',
};

/**
 * Render a QR matrix as a data URI string.
 * Delegates to the appropriate renderer (SVG, PNG, or BMP) and
 * returns the result as a base64-encoded data URI.
 */
export function renderDataURI(
  matrix: number[][],
  options: RenderOptions,
  format: DataURIFormat = 'png',
): string {
  const mime = MIME_TYPES[format];
  let encoded: string;

  switch (format) {
    case 'svg': {
      const svg = renderSVG(matrix, options);
      encoded = base64Encode(svg);
      break;
    }
    case 'png': {
      const png = renderPNG(matrix, options);
      encoded = base64Encode(png);
      break;
    }
    case 'bmp': {
      const bmp = renderBMP(matrix, options);
      encoded = base64Encode(bmp);
      break;
    }
  }

  return `data:${mime};base64,${encoded}`;
}
