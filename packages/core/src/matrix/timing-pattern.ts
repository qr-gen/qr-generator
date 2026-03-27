/**
 * Place timing patterns on row 6 and column 6.
 * Alternating dark/light starting with dark.
 * Only places in cells that are not already reserved.
 */
export function placeTimingPatterns(
  matrix: number[][],
  reserved: boolean[][],
  size: number,
  moduleTypes?: number[][],
): void {
  for (let i = 8; i < size - 8; i++) {
    const value = i % 2 === 0 ? 1 : 0;

    // Row 6 (horizontal timing)
    if (!reserved[6][i]) {
      matrix[6][i] = value;
      reserved[6][i] = true;
      if (moduleTypes) moduleTypes[6][i] = 2; // MODULE_TYPE.TIMING
    }

    // Column 6 (vertical timing)
    if (!reserved[i][6]) {
      matrix[i][6] = value;
      reserved[i][6] = true;
      if (moduleTypes) moduleTypes[i][6] = 2; // MODULE_TYPE.TIMING
    }
  }
}
