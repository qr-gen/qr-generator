type MaskFn = (row: number, col: number) => boolean;

const MASK_FUNCTIONS: MaskFn[] = [
  (r, c) => (r + c) % 2 === 0,
  (r, _) => r % 2 === 0,
  (_, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
  (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
];

export function getMaskFunction(index: number): MaskFn {
  return MASK_FUNCTIONS[index];
}

/**
 * Apply a mask to a matrix copy. Only flips non-reserved data modules.
 */
export function applyMask(
  matrix: number[][],
  reserved: boolean[][],
  maskIndex: number,
): number[][] {
  const size = matrix.length;
  const result = matrix.map(row => [...row]);
  const maskFn = MASK_FUNCTIONS[maskIndex];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!reserved[r][c] && maskFn(r, c)) {
        result[r][c] ^= 1;
      }
    }
  }

  return result;
}

/**
 * Compute the total penalty score for a matrix using all 4 penalty rules.
 */
export function computePenalty(matrix: number[][]): number {
  const size = matrix.length;
  let penalty = 0;

  // Rule 1: 5+ consecutive same-color modules in row or column
  // Score: 3 + (count - 5) for each run
  for (let r = 0; r < size; r++) {
    let count = 1;
    for (let c = 1; c < size; c++) {
      if (matrix[r][c] === matrix[r][c - 1]) {
        count++;
      } else {
        if (count >= 5) penalty += 3 + (count - 5);
        count = 1;
      }
    }
    if (count >= 5) penalty += 3 + (count - 5);
  }
  for (let c = 0; c < size; c++) {
    let count = 1;
    for (let r = 1; r < size; r++) {
      if (matrix[r][c] === matrix[r - 1][c]) {
        count++;
      } else {
        if (count >= 5) penalty += 3 + (count - 5);
        count = 1;
      }
    }
    if (count >= 5) penalty += 3 + (count - 5);
  }

  // Rule 2: 2x2 same-color blocks
  // Score: 3 for each 2x2 block
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      const val = matrix[r][c];
      if (
        val === matrix[r][c + 1] &&
        val === matrix[r + 1][c] &&
        val === matrix[r + 1][c + 1]
      ) {
        penalty += 3;
      }
    }
  }

  // Rule 3: Finder-like pattern (1:1:3:1:1 with 4 white on either side)
  // Patterns: 10111010000 or 00001011101
  // Score: 40 for each occurrence
  const p1 = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
  const p2 = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c <= size - 11; c++) {
      let match1 = true;
      let match2 = true;
      for (let k = 0; k < 11; k++) {
        if (matrix[r][c + k] !== p1[k]) match1 = false;
        if (matrix[r][c + k] !== p2[k]) match2 = false;
        if (!match1 && !match2) break;
      }
      if (match1) penalty += 40;
      if (match2) penalty += 40;
    }
  }
  for (let c = 0; c < size; c++) {
    for (let r = 0; r <= size - 11; r++) {
      let match1 = true;
      let match2 = true;
      for (let k = 0; k < 11; k++) {
        if (matrix[r + k][c] !== p1[k]) match1 = false;
        if (matrix[r + k][c] !== p2[k]) match2 = false;
        if (!match1 && !match2) break;
      }
      if (match1) penalty += 40;
      if (match2) penalty += 40;
    }
  }

  // Rule 4: Dark/light ratio deviation from 50%
  // Score: 10 * k, where k = floor(abs(percentage - 50) / 5)
  let darkCount = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] === 1) darkCount++;
    }
  }
  const percentage = (darkCount / (size * size)) * 100;
  const k = Math.floor(Math.abs(percentage - 50) / 5);
  penalty += k * 10;

  return penalty;
}

/**
 * Try all 8 masks and select the one with the lowest penalty.
 */
export function selectBestMask(
  matrix: number[][],
  reserved: boolean[][],
): { maskIndex: number; maskedMatrix: number[][] } {
  let bestMask = 0;
  let bestPenalty = Infinity;
  let bestMatrix = matrix;

  for (let i = 0; i < 8; i++) {
    const masked = applyMask(matrix, reserved, i);
    const penalty = computePenalty(masked);
    if (penalty < bestPenalty) {
      bestPenalty = penalty;
      bestMask = i;
      bestMatrix = masked;
    }
  }

  return { maskIndex: bestMask, maskedMatrix: bestMatrix };
}
