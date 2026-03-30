/**
 * Convert RGB values to grayscale using luminance formula.
 * ITU-R BT.601: Y = 0.299R + 0.587G + 0.114B
 */
export function rgbToGray(r: number, g: number, b: number): number {
  return Math.round(0.299 * r + 0.587 * g + 0.114 * b);
}

/**
 * Convert RGBA pixel data to a binary grid at the target QR resolution.
 * Samples the source image at each grid cell's center position.
 *
 * @param pixels - RGBA pixel data (4 bytes per pixel, row-major)
 * @param imgWidth - Source image width
 * @param imgHeight - Source image height
 * @param gridSize - Target grid size (QR matrix dimension)
 * @param threshold - Grayscale threshold (0-255). Pixels below this → dark (1), otherwise light (0)
 * @returns 2D binary grid where 1 = dark, 0 = light
 */
export function toGrayscaleGrid(
  pixels: Uint8Array,
  imgWidth: number,
  imgHeight: number,
  gridSize: number,
  threshold: number,
): number[][] {
  const grid: number[][] = [];

  for (let row = 0; row < gridSize; row++) {
    const gridRow: number[] = [];
    for (let col = 0; col < gridSize; col++) {
      // Map grid cell center to source image coordinates
      const srcX = Math.min(
        Math.floor(((col + 0.5) * imgWidth) / gridSize),
        imgWidth - 1,
      );
      const srcY = Math.min(
        Math.floor(((row + 0.5) * imgHeight) / gridSize),
        imgHeight - 1,
      );

      const offset = (srcY * imgWidth + srcX) * 4;
      const r = pixels[offset];
      const g = pixels[offset + 1];
      const b = pixels[offset + 2];

      const gray = rgbToGray(r, g, b);
      gridRow.push(gray < threshold ? 1 : 0);
    }
    grid.push(gridRow);
  }

  return grid;
}
