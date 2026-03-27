import type { RenderOptions } from '../types.js';
import { rasterizeMatrix } from '../raster/rasterize.js';
import { encodePNG } from './encoder.js';

/**
 * Render a QR matrix as a PNG image.
 * Returns raw PNG bytes as Uint8Array.
 */
export function renderPNG(matrix: number[][], options: RenderOptions): Uint8Array {
  const buffer = rasterizeMatrix(matrix, options);
  return encodePNG(buffer);
}
