import { PixelBuffer } from './pixel-buffer.js';
import type { RenderOptions, GradientConfig } from '../types.js';
import { parseHexColor } from '../utils/color.js';
import { renderRasterModule } from './shapes.js';
import { getGradientColor } from './gradient.js';
import { computeLogoBounds, isModuleInLogoBounds } from '../svg/logo.js';
import { validateRenderOptions } from '../validation/validate.js';

/**
 * Rasterize a QR matrix into a PixelBuffer.
 *
 * Mirrors the SVG renderer logic: background fill, then render each dark module,
 * skipping modules that fall within the logo clear zone.
 */
export function rasterizeMatrix(
  matrix: number[][],
  options: RenderOptions,
): PixelBuffer {
  const {
    size,
    fgColor = '#000000',
    bgColor = '#ffffff',
    shape = 'square',
    margin = 4,
    logo,
    skipValidation = false,
    finderShape,
    finderColor,
    moduleTypes,
  } = options;

  // Run validation unless explicitly skipped
  if (!skipValidation) {
    const result = validateRenderOptions(options);
    const errors = result.issues.filter(i => i.severity === 'error');
    if (errors.length > 0) {
      throw new Error(
        `QR validation failed: ${errors.map(e => e.message).join('; ')}`,
      );
    }
  }

  const matrixSize = matrix.length;
  const totalModules = matrixSize + margin * 2;
  const moduleSize = size / totalModules;

  const buffer = new PixelBuffer(size, size);

  // Fill background
  const [bgR, bgG, bgB] = parseHexColor(bgColor);
  buffer.fillRect(0, 0, size, size, bgR, bgG, bgB, 255);

  // Compute logo bounds if logo is present
  const logoBounds = logo
    ? computeLogoBounds(logo, size, logo.padding ?? moduleSize * 2)
    : null;

  // Determine if fgColor is a gradient
  const isGradient = typeof fgColor !== 'string';

  // Parse solid foreground color once if not gradient
  let fgR = 0;
  let fgG = 0;
  let fgB = 0;
  if (!isGradient) {
    [fgR, fgG, fgB] = parseHexColor(fgColor as string);
  }

  // Resolve finder color
  const isFinderGradient = finderColor && typeof finderColor !== 'string';
  let finderR = 0, finderG = 0, finderB = 0;
  if (finderColor && typeof finderColor === 'string' && moduleTypes) {
    [finderR, finderG, finderB] = parseHexColor(finderColor);
  }

  // Render each dark module
  for (let row = 0; row < matrixSize; row++) {
    for (let col = 0; col < matrixSize; col++) {
      if (matrix[row][col] !== 1) continue;

      const x = (col + margin) * moduleSize;
      const y = (row + margin) * moduleSize;

      // Skip modules in logo clear zone
      if (logoBounds && isModuleInLogoBounds(x, y, moduleSize, logoBounds)) {
        continue;
      }

      // Determine if this is a finder module
      const isFinder = moduleTypes && (
        moduleTypes[row][col] === 1 || moduleTypes[row][col] === 7
      );
      const moduleShape = (isFinder && finderShape) ? finderShape : shape;

      if (isFinder && finderColor && moduleTypes) {
        if (isFinderGradient) {
          renderGradientModule(buffer, x, y, moduleSize, moduleShape, size, size, finderColor as GradientConfig);
        } else {
          renderRasterModule(buffer, x, y, moduleSize, moduleShape, finderR, finderG, finderB, 255);
        }
      } else if (isGradient) {
        // For gradient colors, iterate over each pixel in the module area
        // and compute the gradient color based on that pixel's position
        // relative to the full QR code dimensions.
        const gradientConfig = fgColor as GradientConfig;
        renderGradientModule(buffer, x, y, moduleSize, moduleShape, size, size, gradientConfig);
      } else {
        // Solid color: use renderRasterModule
        renderRasterModule(buffer, x, y, moduleSize, moduleShape, fgR, fgG, fgB, 255);
      }
    }
  }

  return buffer;
}

/**
 * Render a single module with gradient coloring.
 *
 * First renders the module shape in white (as a mask), then overwrites
 * each non-background pixel with the gradient color at that position.
 *
 * Instead of a mask approach, we directly compute which pixels belong to
 * the shape and set them to the gradient color.
 */
function renderGradientModule(
  buffer: PixelBuffer,
  x: number,
  y: number,
  moduleSize: number,
  shape: string,
  width: number,
  height: number,
  config: GradientConfig,
): void {
  const x0 = Math.max(0, Math.floor(x));
  const y0 = Math.max(0, Math.floor(y));
  const x1 = Math.min(buffer.width, Math.floor(x + moduleSize));
  const y1 = Math.min(buffer.height, Math.floor(y + moduleSize));

  for (let py = y0; py < y1; py++) {
    for (let px = x0; px < x1; px++) {
      if (isPixelInShape(px, py, x, y, moduleSize, shape)) {
        const [r, g, b, a] = getGradientColor(px, py, width, height, config);
        buffer.setPixel(px, py, r, g, b, a);
      }
    }
  }
}

/**
 * Determine if a pixel at (px, py) falls within the module shape
 * whose top-left is at (mx, my) with the given size.
 */
function isPixelInShape(
  px: number,
  py: number,
  mx: number,
  my: number,
  size: number,
  shape: string,
): boolean {
  switch (shape) {
    case 'square':
      return true; // all pixels in bounding box are in the shape

    case 'dots': {
      const cx = mx + size / 2;
      const cy = my + size / 2;
      const radius = size * 0.45;
      const dx = px - cx;
      const dy = py - cy;
      return dx * dx + dy * dy <= radius * radius;
    }

    case 'rounded': {
      const cr = size * 0.3;
      const clampedCr = Math.min(cr, Math.floor(size / 2));
      if (clampedCr <= 0) return true;

      // Check if pixel is in the rounded rect
      // Inner horizontal strip
      if (py >= my + clampedCr && py < my + size - clampedCr) return true;
      // Top/bottom strips between corners
      if (px >= mx + clampedCr && px < mx + size - clampedCr) return true;

      // Check four corner circles
      const corners = [
        { cx: mx + clampedCr, cy: my + clampedCr },
        { cx: mx + size - 1 - clampedCr, cy: my + clampedCr },
        { cx: mx + clampedCr, cy: my + size - 1 - clampedCr },
        { cx: mx + size - 1 - clampedCr, cy: my + size - 1 - clampedCr },
      ];
      const r2 = clampedCr * clampedCr;
      for (const corner of corners) {
        const dx = px - corner.cx;
        const dy = py - corner.cy;
        if (dx * dx + dy * dy <= r2) return true;
      }
      return false;
    }

    default:
      return true;
  }
}
