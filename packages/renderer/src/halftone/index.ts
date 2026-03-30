import { getFlexibleModules, type ExcludeRegion } from '@qr-kit/core';
import { decodeImageFromDataURI } from './image-decoder.js';
import { toGrayscaleGrid } from './grayscale.js';
import { optimizeHalftone, type HalftoneResult } from './optimizer.js';

export type { HalftoneResult } from './optimizer.js';

export interface HalftoneImageData {
  /** RGBA pixel data, 4 bytes per pixel, row-major order */
  data: Uint8Array;
  width: number;
  height: number;
}

export interface HalftoneConfig {
  /**
   * Target image. Accepts either:
   * - A PNG base64 data URI string (`data:image/png;base64,...`)
   * - Raw RGBA pixel data (`{ data, width, height }`) for any image format
   *   decoded externally (e.g. via canvas in the browser)
   */
  image: string | HalftoneImageData;
  /** How aggressively to match the image, 0-1. Default: 0.7 */
  strength?: number;
  /** Grayscale threshold for binary conversion, 0-255. Default: 128 */
  threshold?: number;
}

/**
 * Apply halftone effect to a QR matrix: flip data modules to visually
 * approximate a target image while preserving scannability.
 *
 * @param matrix - QR matrix from generateQR
 * @param moduleTypes - Module type map from generateQR
 * @param config - Halftone configuration
 * @param logoRegion - Optional logo clear zone to exclude from halftone
 * @returns Modified matrix with halftone effect applied
 */
export function applyHalftone(
  matrix: number[][],
  moduleTypes: number[][],
  config: HalftoneConfig,
  logoRegion?: ExcludeRegion,
): HalftoneResult {
  const strength = config.strength ?? 0.7;
  const threshold = config.threshold ?? 128;

  // 1. Decode target image — supports PNG data URI or raw RGBA pixel data
  const image = typeof config.image === 'string'
    ? decodeImageFromDataURI(config.image)
    : { pixels: config.image.data, width: config.image.width, height: config.image.height };

  // 2. Convert to binary grid at QR matrix resolution
  const gridSize = matrix.length;
  const targetGrid = toGrayscaleGrid(
    image.pixels,
    image.width,
    image.height,
    gridSize,
    threshold,
  );

  // 3. Identify flexible modules
  const flexible = getFlexibleModules(moduleTypes, logoRegion);

  // 4. Run optimizer
  return optimizeHalftone(matrix, flexible, targetGrid, strength);
}
