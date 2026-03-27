import type { RenderOptions } from '../types';
import { rasterizeMatrix } from '../raster/rasterize';

/**
 * Render a QR matrix directly onto an HTML Canvas element.
 * Browser-only — requires a valid HTMLCanvasElement.
 *
 * Uses the same raster pipeline as PNG/BMP rendering, supporting
 * all shapes, colors, gradients, logos, and finder customization.
 */
export function renderCanvas(
  matrix: number[][],
  options: RenderOptions,
  canvas: HTMLCanvasElement,
): void {
  const buffer = rasterizeMatrix(matrix, options);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get 2d context from canvas');
  }

  canvas.width = buffer.width;
  canvas.height = buffer.height;

  const imageData = ctx.createImageData(buffer.width, buffer.height);
  imageData.data.set(buffer.data);
  ctx.putImageData(imageData, 0, 0);
}
