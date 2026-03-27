import type { LogoConfig } from '../types';

export interface LogoBounds {
  /** Logo image x position */
  x: number;
  /** Logo image y position */
  y: number;
  /** Logo image width */
  width: number;
  /** Logo image height */
  height: number;
  /** Clear zone x (includes padding) */
  clearX: number;
  /** Clear zone y (includes padding) */
  clearY: number;
  /** Clear zone width (includes padding) */
  clearWidth: number;
  /** Clear zone height (includes padding) */
  clearHeight: number;
}

/**
 * Compute the centered logo position and clear zone bounds.
 *
 * @param logo - Logo configuration
 * @param totalSize - Total SVG size in pixels
 * @param padding - Padding around the logo for the clear zone
 */
export function computeLogoBounds(
  logo: LogoConfig,
  totalSize: number,
  padding: number,
): LogoBounds {
  const x = (totalSize - logo.width) / 2;
  const y = (totalSize - logo.height) / 2;

  return {
    x,
    y,
    width: logo.width,
    height: logo.height,
    clearX: x - padding,
    clearY: y - padding,
    clearWidth: logo.width + padding * 2,
    clearHeight: logo.height + padding * 2,
  };
}

/**
 * Check if a module's center falls within the logo clear zone.
 *
 * @param moduleX - Module x position (top-left)
 * @param moduleY - Module y position (top-left)
 * @param moduleSize - Module size in pixels
 * @param bounds - The computed logo bounds
 */
export function isModuleInLogoBounds(
  moduleX: number,
  moduleY: number,
  moduleSize: number,
  bounds: LogoBounds,
): boolean {
  const centerX = moduleX + moduleSize / 2;
  const centerY = moduleY + moduleSize / 2;

  return (
    centerX >= bounds.clearX &&
    centerX <= bounds.clearX + bounds.clearWidth &&
    centerY >= bounds.clearY &&
    centerY <= bounds.clearY + bounds.clearHeight
  );
}

/**
 * Render the SVG `<image>` element for the logo.
 */
export function renderLogoImage(
  x: number,
  y: number,
  width: number,
  height: number,
  src: string,
): string {
  return `<image href="${src}" x="${x}" y="${y}" width="${width}" height="${height}"/>`;
}

/**
 * Render a background rect to clear the area behind the logo.
 */
export function renderLogoClearZone(
  x: number,
  y: number,
  width: number,
  height: number,
  bgColor: string,
): string {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${bgColor}"/>`;
}
