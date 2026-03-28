/** Error correction levels per ISO/IEC 18004 */
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

/** Encoding modes */
export type EncodingMode = 'numeric' | 'alphanumeric' | 'byte'; // | 'kanji' (future — requires Shift-JIS table)

/** Mode indicator bits (4-bit) */
export const MODE_INDICATOR: Record<EncodingMode, number> = {
  numeric: 0b0001,
  alphanumeric: 0b0010,
  byte: 0b0100,
  // kanji: 0b1000, (future)
} as const;

/** Character count indicator bit lengths by version group */
export const CHAR_COUNT_BITS: Record<EncodingMode, [number, number, number]> = {
  numeric: [10, 12, 14],
  alphanumeric: [9, 11, 13],
  byte: [8, 16, 16],
  // kanji: [8, 10, 12], (future)
} as const;

/** Returns the version group index: 0 (v1-9), 1 (v10-26), 2 (v27-40) */
export function getVersionGroup(version: number): 0 | 1 | 2 {
  if (version <= 9) return 0;
  if (version <= 26) return 1;
  return 2;
}

/** Module type constants for the module type map */
export const MODULE_TYPE = {
  DATA: 0,
  FINDER: 1,
  TIMING: 2,
  ALIGNMENT: 3,
  FORMAT_INFO: 4,
  VERSION_INFO: 5,
  DARK_MODULE: 6,
  SEPARATOR: 7,
  FINDER_INNER: 8,
} as const;

export type ModuleType = typeof MODULE_TYPE[keyof typeof MODULE_TYPE];

/** Input options for the QR generation engine */
export interface GenerateQROptions {
  data: string;
  version?: number;
  errorCorrection?: ErrorCorrectionLevel;
  minVersion?: number;
}

/** Output from the QR generation engine */
export interface QRCode {
  matrix: number[][];
  version: number;
  errorCorrection: ErrorCorrectionLevel;
  mode: EncodingMode;
  size: number;
  moduleTypes: number[][];
}
