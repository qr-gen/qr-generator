/**
 * Place data bits into the QR matrix using the zigzag (serpentine) pattern.
 * Starts from the bottom-right corner, moves upward in 2-column strips,
 * right-to-left. Column 6 is skipped (timing pattern).
 *
 * @returns Number of bits placed
 */
export function placeDataBits(
  matrix: number[][],
  reserved: boolean[][],
  dataBits: Uint8Array,
): number {
  const size = matrix.length;
  let bitIndex = 0;

  // Process columns from right to left in pairs
  // Start at column size-1, step by -2
  // Column 6 is the timing pattern column — shift left by 1 when we reach it
  let col = size - 1;
  while (col > 0) {
    // Skip column 6 (timing pattern)
    if (col === 6) col--;

    // Zigzag: alternate between moving up and down
    // Even passes (counting from right) go upward, odd go downward
    const isUpward = ((size - 1 - col) / 2) % 2 === 0;

    for (let count = 0; count < size; count++) {
      const row = isUpward ? size - 1 - count : count;

      // Try right column of the pair first, then left
      for (const offset of [0, -1]) {
        const c = col + offset;
        if (c < 0 || c >= size) continue;
        if (reserved[row][c]) continue;

        if (bitIndex < dataBits.length) {
          matrix[row][c] = dataBits[bitIndex];
          bitIndex++;
        } else {
          matrix[row][c] = 0; // pad with 0 if no more data
        }
      }
    }

    col -= 2;
  }

  return bitIndex;
}
