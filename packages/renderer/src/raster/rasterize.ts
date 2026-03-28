import { PixelBuffer } from './pixel-buffer.js';
import type { RenderOptions, GradientConfig } from '../types.js';
import { parseHexColor } from '../utils/color.js';
import { renderRasterModule } from './shapes.js';
import { getGradientColor } from './gradient.js';
import { computeLogoBounds, isModuleInLogoBounds } from '../svg/logo.js';
import { validateRenderOptions } from '../validation/validate.js';
import { computeFrameLayout } from '../svg/frame.js';

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
  const frame = options.frame;
  const fgColorStr = typeof fgColor === 'string' ? fgColor : '#000000';

  // Compute frame layout
  const frameLayout = frame ? computeFrameLayout(size, frame, fgColorStr) : null;
  const effectiveQRSize = frameLayout ? frameLayout.qrSize : size;
  const qrOffsetX = frameLayout ? frameLayout.qrX : 0;
  const qrOffsetY = frameLayout ? frameLayout.qrY : 0;

  const totalModules = matrixSize + margin * 2;
  const moduleSize = effectiveQRSize / totalModules;

  const buffer = new PixelBuffer(size, size);
  const isTransparentBg = bgColor === 'transparent';

  // Fill background
  let bgR = 255, bgG = 255, bgB = 255;
  const bgAlpha = Math.round((options.bgOpacity ?? 1) * 255);
  if (!isTransparentBg) {
    [bgR, bgG, bgB] = parseHexColor(bgColor);
    // Fill entire canvas, then frame border will draw on top
    buffer.fillRect(0, 0, size, size, bgR, bgG, bgB, bgAlpha);
  }

  // Draw frame border in raster (label omitted in raster mode)
  if (frame) {
    const thickness = frame.thickness ?? Math.round(size / 30);
    const [frameR, frameG, frameB] = frame.color ? parseHexColor(frame.color) : parseHexColor(fgColorStr);
    // Top border
    buffer.fillRect(0, 0, size, thickness, frameR, frameG, frameB, 255);
    // Bottom border
    buffer.fillRect(0, size - thickness, size, thickness, frameR, frameG, frameB, 255);
    // Left border
    buffer.fillRect(0, 0, thickness, size, frameR, frameG, frameB, 255);
    // Right border
    buffer.fillRect(size - thickness, 0, thickness, size, frameR, frameG, frameB, 255);
  }

  // Compute logo bounds if logo is present
  const logoBounds = logo
    ? computeLogoBounds(logo, effectiveQRSize, logo.padding ?? moduleSize * 2)
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

  // Resolve finder outer/inner colors with fallback chain
  const resolvedFinderOuterColor = options.finderOuterColor ?? finderColor;
  const resolvedFinderInnerColor = options.finderInnerColor ?? finderColor;

  const isFinderOuterGradient = resolvedFinderOuterColor && typeof resolvedFinderOuterColor !== 'string';
  const isFinderInnerGradient = resolvedFinderInnerColor && typeof resolvedFinderInnerColor !== 'string';

  let finderOuterR = fgR, finderOuterG = fgG, finderOuterB = fgB;
  if (resolvedFinderOuterColor && typeof resolvedFinderOuterColor === 'string' && moduleTypes) {
    [finderOuterR, finderOuterG, finderOuterB] = parseHexColor(resolvedFinderOuterColor);
  }

  let finderInnerR = fgR, finderInnerG = fgG, finderInnerB = fgB;
  if (resolvedFinderInnerColor && typeof resolvedFinderInnerColor === 'string' && moduleTypes) {
    [finderInnerR, finderInnerG, finderInnerB] = parseHexColor(resolvedFinderInnerColor);
  }

  // Resolve finder outer/inner shapes
  const finderOuterShapeResolved = options.finderOuterShape ?? finderShape;
  const finderInnerShapeResolved = options.finderInnerShape ?? finderShape;

  // Circle finder patterns: render as concentric circles
  const useCircleFinders = finderShape === 'circle' && moduleTypes;
  if (useCircleFinders) {
    const finderCenters = [
      { row: 3, col: 3 },
      { row: 3, col: matrixSize - 4 },
      { row: matrixSize - 4, col: 3 },
    ];

    for (const { row, col } of finderCenters) {
      const cx = qrOffsetX + (col + margin) * moduleSize + moduleSize / 2;
      const cy = qrOffsetY + (row + margin) * moduleSize + moduleSize / 2;
      const gapR = isTransparentBg ? 255 : bgR;
      const gapG = isTransparentBg ? 255 : bgG;
      const gapB = isTransparentBg ? 255 : bgB;
      buffer.fillCircle(cx, cy, 3.5 * moduleSize, finderOuterR, finderOuterG, finderOuterB, 255);  // outer
      buffer.fillCircle(cx, cy, 2.5 * moduleSize, gapR, gapG, gapB, 255);  // gap
      buffer.fillCircle(cx, cy, 1.5 * moduleSize, finderInnerR, finderInnerG, finderInnerB, 255);  // inner
    }
  }

  // Module scale: shrink modules within their grid cell (finders exempt)
  const scale = options.moduleScale ?? 1;

  // Render each dark module
  for (let row = 0; row < matrixSize; row++) {
    for (let col = 0; col < matrixSize; col++) {
      if (matrix[row][col] !== 1) continue;

      const x = qrOffsetX + (col + margin) * moduleSize;
      const y = qrOffsetY + (row + margin) * moduleSize;

      // Skip modules in logo clear zone
      if (logoBounds && isModuleInLogoBounds(x, y, moduleSize, logoBounds)) {
        continue;
      }

      // Determine if this is a finder module (FINDER=1, SEPARATOR=7, FINDER_INNER=8)
      const isFinder = moduleTypes && (
        moduleTypes[row][col] === 1 || moduleTypes[row][col] === 7 || moduleTypes[row][col] === 8
      );

      // Skip individual finder modules when using circle finders
      if (useCircleFinders && isFinder) {
        continue;
      }

      // Apply scale (finders are NOT scaled)
      const adjustedSize = isFinder ? moduleSize : moduleSize * scale;
      const offsetX = isFinder ? x : x + (moduleSize - adjustedSize) / 2;
      const offsetY = isFinder ? y : y + (moduleSize - adjustedSize) / 2;

      // Determine shape and color based on module type (inner vs outer finder)
      const isFinderInnerModule = moduleTypes && moduleTypes[row][col] === 8;
      let moduleShape = shape;

      if (isFinder) {
        if (isFinderInnerModule) {
          const innerShape = finderInnerShapeResolved;
          moduleShape = (innerShape && innerShape !== 'circle') ? innerShape : shape;
        } else {
          const outerShape = finderOuterShapeResolved;
          moduleShape = (outerShape && outerShape !== 'circle') ? outerShape : shape;
        }
      }

      if (isFinder && moduleTypes) {
        if (isFinderInnerModule) {
          // Inner finder module
          if (resolvedFinderInnerColor) {
            if (isFinderInnerGradient) {
              renderGradientModule(buffer, offsetX, offsetY, adjustedSize, moduleShape, size, size, resolvedFinderInnerColor as GradientConfig);
            } else {
              renderRasterModule(buffer, offsetX, offsetY, adjustedSize, moduleShape, finderInnerR, finderInnerG, finderInnerB, 255);
            }
          } else if (isGradient) {
            renderGradientModule(buffer, offsetX, offsetY, adjustedSize, moduleShape, size, size, fgColor as GradientConfig);
          } else {
            renderRasterModule(buffer, offsetX, offsetY, adjustedSize, moduleShape, fgR, fgG, fgB, 255);
          }
        } else {
          // Outer finder module
          if (resolvedFinderOuterColor) {
            if (isFinderOuterGradient) {
              renderGradientModule(buffer, offsetX, offsetY, adjustedSize, moduleShape, size, size, resolvedFinderOuterColor as GradientConfig);
            } else {
              renderRasterModule(buffer, offsetX, offsetY, adjustedSize, moduleShape, finderOuterR, finderOuterG, finderOuterB, 255);
            }
          } else if (isGradient) {
            renderGradientModule(buffer, offsetX, offsetY, adjustedSize, moduleShape, size, size, fgColor as GradientConfig);
          } else {
            renderRasterModule(buffer, offsetX, offsetY, adjustedSize, moduleShape, fgR, fgG, fgB, 255);
          }
        }
      } else if (isGradient) {
        const gradientConfig = fgColor as GradientConfig;
        renderGradientModule(buffer, offsetX, offsetY, adjustedSize, moduleShape, size, size, gradientConfig);
      } else {
        renderRasterModule(buffer, offsetX, offsetY, adjustedSize, moduleShape, fgR, fgG, fgB, 255);
      }
    }
  }

  // Apply rounded border mask
  const borderRadius = options.borderRadius ?? 0;
  if (borderRadius > 0) {
    applyRoundedMask(buffer, borderRadius);
  }

  return buffer;
}

/**
 * Set pixels outside the rounded rect to fully transparent.
 */
function applyRoundedMask(buffer: PixelBuffer, radius: number): void {
  const w = buffer.width;
  const h = buffer.height;
  const r = Math.min(radius, Math.floor(Math.min(w, h) / 2));

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // Only check corner regions
      let inCorner = false;
      let cx = 0, cy = 0;

      if (x < r && y < r) {
        // Top-left corner
        cx = r; cy = r; inCorner = true;
      } else if (x >= w - r && y < r) {
        // Top-right corner
        cx = w - r; cy = r; inCorner = true;
      } else if (x < r && y >= h - r) {
        // Bottom-left corner
        cx = r; cy = h - r; inCorner = true;
      } else if (x >= w - r && y >= h - r) {
        // Bottom-right corner
        cx = w - r; cy = h - r; inCorner = true;
      }

      if (inCorner) {
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy > r * r) {
          buffer.setPixel(x, y, 0, 0, 0, 0);
        }
      }
    }
  }
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

    case 'diamond': {
      const cx = mx + size / 2;
      const cy = my + size / 2;
      const half = size * 0.45;
      return Math.abs(px - cx) + Math.abs(py - cy) <= half;
    }

    default:
      return true;
  }
}
