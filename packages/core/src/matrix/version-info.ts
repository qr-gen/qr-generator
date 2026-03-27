/**
 * BCH(18,6) encoding for version information (versions 7-40).
 * Generator polynomial: x^12 + x^11 + x^10 + x^9 + x^8 + x^5 + x^2 + 1 = 0x1F25
 */
function bch18_6(data: number): number {
  let d = data << 12;
  const gen = 0x1F25;
  for (let i = 5; i >= 0; i--) {
    if (d & (1 << (i + 12))) {
      d ^= gen << i;
    }
  }
  return (data << 12) | d;
}

/**
 * Get the 18-bit version info bits. Returns null for versions < 7.
 */
export function getVersionBits(version: number): number[] | null {
  if (version < 7) return null;

  const encoded = bch18_6(version);
  const bits: number[] = [];
  for (let i = 17; i >= 0; i--) {
    bits.push((encoded >> i) & 1);
  }
  return bits;
}

/**
 * Place version info bits in the matrix (only for versions >= 7).
 * Two copies: bottom-left of top-right finder, and top-right of bottom-left finder.
 */
export function placeVersionInfo(matrix: number[][], version: number, moduleTypes?: number[][]): void {
  const bits = getVersionBits(version);
  if (!bits) return;

  const size = matrix.length;

  // Version info is 18 bits arranged in a 6x3 block
  // Read from LSB to MSB
  let bitIndex = 17; // start from MSB of our array
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 3; j++) {
      const bit = bits[bitIndex--];

      // Bottom-left of top-right finder: rows 0-5, cols (size-11) to (size-9)
      matrix[i][size - 11 + j] = bit;
      if (moduleTypes) moduleTypes[i][size - 11 + j] = 5; // MODULE_TYPE.VERSION_INFO

      // Top-right of bottom-left finder: rows (size-11) to (size-9), cols 0-5
      matrix[size - 11 + j][i] = bit;
      if (moduleTypes) moduleTypes[size - 11 + j][i] = 5; // MODULE_TYPE.VERSION_INFO
    }
  }
}

/**
 * Reserve version info areas.
 */
export function reserveVersionAreas(reserved: boolean[][], size: number, version: number, moduleTypes?: number[][]): void {
  if (version < 7) return;

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 3; j++) {
      reserved[i][size - 11 + j] = true;
      reserved[size - 11 + j][i] = true;
      if (moduleTypes) {
        moduleTypes[i][size - 11 + j] = 5; // MODULE_TYPE.VERSION_INFO
        moduleTypes[size - 11 + j][i] = 5; // MODULE_TYPE.VERSION_INFO
      }
    }
  }
}
