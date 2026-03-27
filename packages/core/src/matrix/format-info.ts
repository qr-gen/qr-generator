import type { ErrorCorrectionLevel } from '../types';

const EC_LEVEL_BITS: Record<ErrorCorrectionLevel, number> = {
  L: 0b01,
  M: 0b00,
  Q: 0b11,
  H: 0b10,
};

const FORMAT_MASK = 0x5412; // XOR mask for format info

/**
 * BCH(15,5) encoding for format information.
 * Generator polynomial: x^10 + x^8 + x^5 + x^4 + x^2 + x + 1 = 0x537
 */
function bch15_5(data: number): number {
  let d = data << 10;
  const gen = 0x537;
  for (let i = 4; i >= 0; i--) {
    if (d & (1 << (i + 10))) {
      d ^= gen << i;
    }
  }
  return ((data << 10) | d) ^ FORMAT_MASK;
}

/**
 * Get the 15-bit format info for a given EC level and mask pattern.
 * Returns array of 15 bits (MSB first).
 */
export function getFormatBits(ec: ErrorCorrectionLevel, mask: number): number[] {
  const data = (EC_LEVEL_BITS[ec] << 3) | mask;
  const encoded = bch15_5(data);
  const bits: number[] = [];
  for (let i = 14; i >= 0; i--) {
    bits.push((encoded >> i) & 1);
  }
  return bits;
}

/**
 * Place format info bits in the matrix.
 * Format info is placed in two copies around the finder patterns.
 */
export function placeFormatInfo(
  matrix: number[][],
  ec: ErrorCorrectionLevel,
  mask: number,
  moduleTypes?: number[][],
): void {
  const bits = getFormatBits(ec, mask);
  const size = matrix.length;

  // Copy 1: around top-left finder
  const hPositions = [
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5],
    [8, 7], [8, 8],
    [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
  ];

  for (let i = 0; i < 15; i++) {
    matrix[hPositions[i][0]][hPositions[i][1]] = bits[i];
    if (moduleTypes) moduleTypes[hPositions[i][0]][hPositions[i][1]] = 4; // MODULE_TYPE.FORMAT_INFO
  }

  // Copy 2: around top-right and bottom-left finders
  const vPositions = [
    [size - 1, 8], [size - 2, 8], [size - 3, 8], [size - 4, 8],
    [size - 5, 8], [size - 6, 8], [size - 7, 8],
    [8, size - 8], [8, size - 7], [8, size - 6], [8, size - 5],
    [8, size - 4], [8, size - 3], [8, size - 2], [8, size - 1],
  ];

  for (let i = 0; i < 15; i++) {
    matrix[vPositions[i][0]][vPositions[i][1]] = bits[i];
    if (moduleTypes) moduleTypes[vPositions[i][0]][vPositions[i][1]] = 4; // MODULE_TYPE.FORMAT_INFO
  }

  // Dark module (always dark, required by spec)
  matrix[size - 8][8] = 1;
  if (moduleTypes) moduleTypes[size - 8][8] = 6; // MODULE_TYPE.DARK_MODULE
}

/**
 * Reserve format info areas (without writing values yet).
 */
export function reserveFormatAreas(reserved: boolean[][], size: number, moduleTypes?: number[][]): void {
  // Around top-left finder
  for (let i = 0; i < 8; i++) {
    reserved[8][i] = true;
    reserved[i][8] = true;
    if (moduleTypes) {
      moduleTypes[8][i] = 4; // MODULE_TYPE.FORMAT_INFO
      moduleTypes[i][8] = 4; // MODULE_TYPE.FORMAT_INFO
    }
  }
  reserved[8][8] = true;
  reserved[8][7] = true; // col 7 of row 8
  if (moduleTypes) {
    moduleTypes[8][8] = 4; // MODULE_TYPE.FORMAT_INFO
    moduleTypes[8][7] = 4; // MODULE_TYPE.FORMAT_INFO
  }

  // Around top-right finder
  for (let i = size - 8; i < size; i++) {
    reserved[8][i] = true;
    if (moduleTypes) moduleTypes[8][i] = 4; // MODULE_TYPE.FORMAT_INFO
  }

  // Around bottom-left finder
  for (let i = size - 7; i < size; i++) {
    reserved[i][8] = true;
    if (moduleTypes) moduleTypes[i][8] = 4; // MODULE_TYPE.FORMAT_INFO
  }

  // Dark module
  reserved[size - 8][8] = true;
  if (moduleTypes) moduleTypes[size - 8][8] = 6; // MODULE_TYPE.DARK_MODULE
}
