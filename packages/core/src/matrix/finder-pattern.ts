/**
 * Place 3 finder patterns (7x7) and their separators (1-module white border).
 * Top-left at (0,0), top-right at (0, size-7), bottom-left at (size-7, 0).
 */

const FINDER = [
  [1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1],
];

function placeFinder(
  matrix: number[][],
  reserved: boolean[][],
  rowOffset: number,
  colOffset: number,
  moduleTypes: number[][],
): void {
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      matrix[rowOffset + r][colOffset + c] = FINDER[r][c];
      reserved[rowOffset + r][colOffset + c] = true;
      moduleTypes[rowOffset + r][colOffset + c] = 1; // MODULE_TYPE.FINDER
    }
  }
}

export function placeFinderPatterns(
  matrix: number[][],
  reserved: boolean[][],
  moduleTypes?: number[][],
): void {
  const size = matrix.length;
  const mt = moduleTypes ?? Array.from({ length: size }, () => new Array(size).fill(0));

  // Place 3 finder patterns
  placeFinder(matrix, reserved, 0, 0, mt);           // top-left
  placeFinder(matrix, reserved, 0, size - 7, mt);    // top-right
  placeFinder(matrix, reserved, size - 7, 0, mt);    // bottom-left

  // Place separators (white border) and mark as reserved
  // Top-left: right column (col 7, rows 0-7) and bottom row (row 7, cols 0-7)
  for (let i = 0; i < 8; i++) {
    // Right of top-left finder
    if (i < size) {
      matrix[i][7] = 0;
      reserved[i][7] = true;
      mt[i][7] = 7; // MODULE_TYPE.SEPARATOR
    }
    // Below top-left finder
    if (i < size) {
      matrix[7][i] = 0;
      reserved[7][i] = true;
      mt[7][i] = 7; // MODULE_TYPE.SEPARATOR
    }
    // Left of top-right finder
    matrix[i][size - 8] = 0;
    reserved[i][size - 8] = true;
    mt[i][size - 8] = 7; // MODULE_TYPE.SEPARATOR
    // Below top-right finder
    matrix[7][size - 8 + i] = 0;
    reserved[7][size - 8 + i] = true;
    mt[7][size - 8 + i] = 7; // MODULE_TYPE.SEPARATOR
    // Above bottom-left finder
    matrix[size - 8][i] = 0;
    reserved[size - 8][i] = true;
    mt[size - 8][i] = 7; // MODULE_TYPE.SEPARATOR
    // Right of bottom-left finder
    matrix[size - 8 + i][7] = 0;
    reserved[size - 8 + i][7] = true;
    mt[size - 8 + i][7] = 7; // MODULE_TYPE.SEPARATOR
  }
}
