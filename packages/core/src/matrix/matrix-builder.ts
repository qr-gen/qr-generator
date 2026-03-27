import type { ErrorCorrectionLevel } from '../types';
import { placeFinderPatterns } from './finder-pattern';
import { placeTimingPatterns } from './timing-pattern';
import { placeAlignmentPatterns } from './alignment-pattern';
import { reserveFormatAreas, placeFormatInfo } from './format-info';
import { reserveVersionAreas, placeVersionInfo } from './version-info';
import { placeDataBits } from './data-placement';
import { selectBestMask } from './masking';

export interface MatrixResult {
  matrix: number[][];
  maskIndex: number;
  moduleTypes: number[][];
}

/**
 * Build the complete QR code matrix from interleaved codewords.
 */
export function buildMatrix(
  codewords: Uint8Array,
  version: number,
  ec: ErrorCorrectionLevel,
): MatrixResult {
  const size = 4 * version + 17;

  // Initialize matrix, reserved tracking, and module types
  const matrix: number[][] = Array.from({ length: size }, () => new Array(size).fill(-1));
  const reserved: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));
  const moduleTypes: number[][] = Array.from({ length: size }, () => new Array(size).fill(0));

  // Step 1: Place function patterns
  placeFinderPatterns(matrix, reserved, moduleTypes);
  placeTimingPatterns(matrix, reserved, size, moduleTypes);
  placeAlignmentPatterns(matrix, reserved, version, moduleTypes);

  // Step 2: Reserve format and version info areas
  reserveFormatAreas(reserved, size, moduleTypes);
  reserveVersionAreas(reserved, size, version, moduleTypes);

  // Step 3: Convert codewords to bits
  const totalBits = codewords.length * 8;
  const dataBits = new Uint8Array(totalBits);
  for (let i = 0; i < codewords.length; i++) {
    for (let bit = 7; bit >= 0; bit--) {
      dataBits[i * 8 + (7 - bit)] = (codewords[i] >> bit) & 1;
    }
  }

  // Step 4: Place data bits
  placeDataBits(matrix, reserved, dataBits);

  // Step 5: Select best mask and apply
  const { maskIndex, maskedMatrix } = selectBestMask(matrix, reserved);

  // Step 6: Place format info (uses final mask)
  placeFormatInfo(maskedMatrix, ec, maskIndex, moduleTypes);

  // Step 7: Place version info (versions >= 7)
  placeVersionInfo(maskedMatrix, version, moduleTypes);

  return { matrix: maskedMatrix, maskIndex, moduleTypes };
}
