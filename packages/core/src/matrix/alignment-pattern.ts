import { ALIGNMENT_POSITIONS } from '../tables/alignment-positions';

/**
 * Place alignment patterns for the given version.
 * Skips positions that overlap with finder patterns (checked via reserved).
 */
export function placeAlignmentPatterns(
  matrix: number[][],
  reserved: boolean[][],
  version: number,
  moduleTypes?: number[][],
): void {
  const positions = ALIGNMENT_POSITIONS[version];
  if (positions.length === 0) return;

  // Generate all center positions (cartesian product)
  for (const row of positions) {
    for (const col of positions) {
      // Skip if this position overlaps a finder pattern (already reserved)
      if (reserved[row][col]) continue;

      // Place 5x5 alignment pattern centered at (row, col)
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          const value =
            Math.abs(r) === 2 || Math.abs(c) === 2 // outer border: dark
              ? 1
              : r === 0 && c === 0 // center: dark
                ? 1
                : 0; // inner ring: light
          matrix[row + r][col + c] = value;
          reserved[row + r][col + c] = true;
          if (moduleTypes) moduleTypes[row + r][col + c] = 3; // MODULE_TYPE.ALIGNMENT
        }
      }
    }
  }
}
