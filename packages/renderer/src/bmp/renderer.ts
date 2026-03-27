import type { RenderOptions } from '../types.js';
import { rasterizeMatrix } from '../raster/rasterize.js';
import { encodeBMP } from './encoder.js';

/**
 * Render a QR matrix as a BMP image.
 *
 * Rasterizes the matrix into a PixelBuffer using the provided options,
 * then encodes the buffer as a 24-bit BMP file.
 */
export function renderBMP(
  matrix: number[][],
  options: RenderOptions,
): Uint8Array {
  const buffer = rasterizeMatrix(matrix, options);
  return encodeBMP(buffer);
}
