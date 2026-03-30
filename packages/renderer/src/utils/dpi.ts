import type { PhysicalSize } from '../types';

const MM_PER_INCH = 25.4;
const SCREEN_DPI = 72;
const DEFAULT_PRINT_DPI = 150;
const MAX_PIXEL_DIMENSION = 10000;

/**
 * Calculate pixel dimensions for raster output based on DPI and physical size options.
 *
 * Priority:
 * 1. physicalSize + dpi → exact pixel calculation
 * 2. physicalSize alone → uses default print DPI (150)
 * 3. dpi alone → scales the base size by dpi/72
 * 4. Neither → returns base size as-is
 */
export function calculatePixelDimensions(
  baseSize: number,
  options: { dpi?: number; physicalSize?: PhysicalSize },
): { width: number; height: number } {
  if (options.dpi !== undefined && options.dpi <= 0) {
    throw new Error(`DPI must be greater than 0, got ${options.dpi}.`);
  }

  if (options.physicalSize) {
    if (options.physicalSize.width <= 0 || options.physicalSize.height <= 0) {
      throw new Error('Physical size dimensions must be greater than 0.');
    }
    if (options.physicalSize.width !== options.physicalSize.height) {
      throw new Error('QR codes must be square. Physical size width and height must be equal.');
    }

    const dpi = options.dpi ?? DEFAULT_PRINT_DPI;
    const physicalWidth = options.physicalSize.width;
    let pixels: number;

    if (options.physicalSize.unit === 'mm') {
      pixels = Math.ceil(physicalWidth / MM_PER_INCH * dpi);
    } else {
      pixels = Math.ceil(physicalWidth * dpi);
    }

    if (pixels > MAX_PIXEL_DIMENSION) {
      throw new Error(`Calculated pixel dimension ${pixels} exceeds maximum of ${MAX_PIXEL_DIMENSION}. Reduce physical size or DPI.`);
    }

    return { width: pixels, height: pixels };
  }

  if (options.dpi && options.dpi !== SCREEN_DPI) {
    const scale = options.dpi / SCREEN_DPI;
    const pixels = Math.ceil(baseSize * scale);

    if (pixels > MAX_PIXEL_DIMENSION) {
      throw new Error(`Calculated pixel dimension ${pixels} exceeds maximum of ${MAX_PIXEL_DIMENSION}. Reduce size or DPI.`);
    }

    return { width: pixels, height: pixels };
  }

  return { width: baseSize, height: baseSize };
}

/**
 * Calculate SVG dimension attributes based on physical size options.
 *
 * Returns width/height strings with units for the SVG element.
 * viewBox always uses the logical coordinate system.
 */
export function calculateSvgDimensions(
  baseSize: number,
  options: { dpi?: number; physicalSize?: PhysicalSize },
): { width: string; height: string } {
  if (options.physicalSize) {
    if (options.physicalSize.width <= 0 || options.physicalSize.height <= 0) {
      throw new Error('Physical size dimensions must be greater than 0.');
    }
    const { width, unit } = options.physicalSize;
    return {
      width: `${width}${unit}`,
      height: `${width}${unit}`, // QR codes are square
    };
  }

  // Default: unitless pixel dimensions (current behavior)
  return {
    width: String(baseSize),
    height: String(baseSize),
  };
}
