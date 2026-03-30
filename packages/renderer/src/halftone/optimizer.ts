export interface HalftoneResult {
  /** Modified matrix with modules flipped to approximate target image */
  matrix: number[][];
  /** Number of modules flipped */
  flippedCount: number;
  /** Total flexible modules available */
  flexibleCount: number;
  /** Percentage of error correction budget used (0-1) */
  budgetUsed: number;
}

interface FlipCandidate {
  row: number;
  col: number;
  priority: number;
}

/**
 * Optimize a QR matrix to visually approximate a target binary grid.
 * Uses a budget-constrained greedy approach: flips data modules that
 * mismatch the target, prioritized by visual importance (center-weighted).
 *
 * @param matrix - Original QR matrix (0s and 1s)
 * @param flexible - Which modules can be flipped (from getFlexibleModules)
 * @param targetGrid - Binary target image at QR resolution (1=dark, 0=light)
 * @param strength - 0-1, scales the flip budget
 * @returns Modified matrix and metadata
 */
export function optimizeHalftone(
  matrix: number[][],
  flexible: boolean[][],
  targetGrid: number[][],
  strength: number,
): HalftoneResult {
  const size = matrix.length;

  // Count flexible modules
  let flexibleCount = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (flexible[r][c]) flexibleCount++;
    }
  }

  // Compute budget: 25% of flexible modules * strength
  const maxFlips = Math.floor(flexibleCount * 0.25 * strength);

  if (maxFlips === 0) {
    return {
      matrix: matrix.map((row) => [...row]),
      flippedCount: 0,
      flexibleCount,
      budgetUsed: 0,
    };
  }

  // Collect flip candidates: flexible modules that don't match the target
  const candidates: FlipCandidate[] = [];
  const center = (size - 1) / 2;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (flexible[r][c] && matrix[r][c] !== targetGrid[r][c]) {
        // Priority: center-weighted (closer to center = higher priority)
        const dx = (c - center) / center;
        const dy = (r - center) / center;
        const distFromCenter = Math.sqrt(dx * dx + dy * dy);
        // Invert: smaller distance = higher priority
        const priority = 2 - distFromCenter;
        candidates.push({ row: r, col: c, priority });
      }
    }
  }

  // Sort by priority (highest first)
  candidates.sort((a, b) => b.priority - a.priority);

  // Apply flips within budget
  const result = matrix.map((row) => [...row]);
  const flipsToApply = Math.min(maxFlips, candidates.length);

  for (let i = 0; i < flipsToApply; i++) {
    const { row, col } = candidates[i];
    result[row][col] ^= 1;
  }

  return {
    matrix: result,
    flippedCount: flipsToApply,
    flexibleCount,
    budgetUsed: maxFlips > 0 ? flipsToApply / maxFlips : 0,
  };
}
