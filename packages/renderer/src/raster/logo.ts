import { PixelBuffer } from './pixel-buffer.js';
import type { LogoBounds } from '../svg/logo.js';

/**
 * Render the logo clear zone (background fill) into the pixel buffer.
 * This ensures the logo area is clean of any QR modules.
 * The clear zone includes padding around the logo.
 */
export function renderRasterLogoClearZone(
  buffer: PixelBuffer,
  bounds: LogoBounds,
  bgR: number,
  bgG: number,
  bgB: number,
): void {
  buffer.fillRect(
    bounds.clearX,
    bounds.clearY,
    bounds.clearWidth,
    bounds.clearHeight,
    bgR,
    bgG,
    bgB,
    255,
  );
}

/**
 * Render a logo placeholder (background fill) in the pixel buffer.
 * Fills only the logo image area (not the full clear zone).
 *
 * The actual logo image is only supported in SVG output. In raster formats,
 * the clear zone is maintained and users can overlay logos externally.
 */
export function renderRasterLogoPlaceholder(
  buffer: PixelBuffer,
  bounds: LogoBounds,
  bgR: number,
  bgG: number,
  bgB: number,
): void {
  buffer.fillRect(
    bounds.x,
    bounds.y,
    bounds.width,
    bounds.height,
    bgR,
    bgG,
    bgB,
    255,
  );
}
