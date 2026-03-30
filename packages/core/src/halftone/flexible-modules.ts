import { MODULE_TYPE } from '../types.js';

export interface ExcludeRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Identify which modules in a QR matrix can be flipped without corrupting
 * structural patterns (finders, timing, alignment, format/version info).
 *
 * Only DATA modules (type 0) are considered flexible. An optional exclude
 * region can be provided to mark additional modules as non-flexible (e.g.,
 * a logo clear zone).
 *
 * @param moduleTypes - 2D array from QRCode.moduleTypes
 * @param excludeRegion - Optional region to exclude from flexibility
 * @returns 2D boolean array where true = module can be flipped
 */
export function getFlexibleModules(
  moduleTypes: number[][],
  excludeRegion?: ExcludeRegion,
): boolean[][] {
  const size = moduleTypes.length;
  const flexible: boolean[][] = [];

  for (let r = 0; r < size; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < size; c++) {
      let isFlex = moduleTypes[r][c] === MODULE_TYPE.DATA;

      if (isFlex && excludeRegion) {
        const { x, y, width, height } = excludeRegion;
        if (c >= x && c < x + width && r >= y && r < y + height) {
          isFlex = false;
        }
      }

      row.push(isFlex);
    }
    flexible.push(row);
  }

  return flexible;
}
