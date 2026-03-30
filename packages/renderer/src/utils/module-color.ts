import { MODULE_TYPE } from '@qr-kit/core';
import type { RenderOptions, ColorConfig } from '../types';

/**
 * Resolve the color for a module based on its type and render options.
 *
 * Fallback chains:
 * - FINDER:       finderOuterColor → finderColor → fgColor
 * - FINDER_INNER: finderInnerColor → finderColor → fgColor
 * - ALIGNMENT:    alignmentColor → fgColor
 * - TIMING:       timingColor → fgColor
 * - All others:   fgColor
 */
export function getModuleColor(
  moduleType: number,
  options: RenderOptions,
): ColorConfig {
  const fgColor = options.fgColor ?? '#000000';

  switch (moduleType) {
    case MODULE_TYPE.FINDER:
      return options.finderOuterColor ?? options.finderColor ?? fgColor;
    case MODULE_TYPE.FINDER_INNER:
      return options.finderInnerColor ?? options.finderColor ?? fgColor;
    case MODULE_TYPE.ALIGNMENT:
      return options.alignmentColor ?? fgColor;
    case MODULE_TYPE.TIMING:
      return options.timingColor ?? fgColor;
    default:
      return fgColor;
  }
}
