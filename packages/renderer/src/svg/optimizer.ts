export interface MergedRect {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
}

interface ActiveRect {
  xStart: number;
  xEnd: number;
  yStart: number;
  height: number;
  fill: string;
}

/**
 * Merge adjacent square modules into larger rectangles using a scanline algorithm.
 *
 * This reduces SVG element count by 30-80% for typical QR codes.
 *
 * @param matrix - QR matrix (1 = dark, 0 = light)
 * @param moduleTypes - Optional module type map for color grouping
 * @param margin - Number of margin modules around the QR code
 * @param moduleSize - Size of each module in pixels
 * @param colorMap - Optional map from module type to fill color string
 * @returns Array of merged rectangles
 */
export function mergeModules(
  matrix: number[][],
  moduleTypes: number[][] | undefined,
  margin: number,
  moduleSize: number,
  colorMap?: Record<number, string>,
): MergedRect[] {
  const rows = matrix.length;
  if (rows === 0) return [];
  const cols = matrix[0].length;

  const DEFAULT_FILL = 'default';
  const results: MergedRect[] = [];

  // Active rectangles from the previous row
  // Key: `${xStart}-${xEnd}-${fill}` for quick lookup
  let activeRects: ActiveRect[] = [];

  for (let row = 0; row < rows; row++) {
    // Find horizontal runs in this row
    const runs: Array<{ xStart: number; xEnd: number; fill: string }> = [];
    let col = 0;
    while (col < cols) {
      if (matrix[row][col] === 1) {
        const moduleType = moduleTypes ? moduleTypes[row][col] : 0;
        const fill = colorMap && colorMap[moduleType] !== undefined
          ? colorMap[moduleType]
          : DEFAULT_FILL;

        const runStart = col;
        col++;

        // Extend run while same color and dark
        while (col < cols && matrix[row][col] === 1) {
          const nextType = moduleTypes ? moduleTypes[row][col] : 0;
          const nextFill = colorMap && colorMap[nextType] !== undefined
            ? colorMap[nextType]
            : DEFAULT_FILL;
          if (nextFill !== fill) break;
          col++;
        }

        runs.push({ xStart: runStart, xEnd: col, fill });
      } else {
        col++;
      }
    }

    // Match runs to active rects or start new ones
    const newActiveRects: ActiveRect[] = [];
    const matchedActive = new Set<number>();

    for (const run of runs) {
      // Find matching active rect: same xStart, xEnd, fill
      let matched = false;
      for (let i = 0; i < activeRects.length; i++) {
        if (matchedActive.has(i)) continue;
        const active = activeRects[i];
        if (
          active.xStart === run.xStart &&
          active.xEnd === run.xEnd &&
          active.fill === run.fill
        ) {
          // Extend downward
          active.height++;
          newActiveRects.push(active);
          matchedActive.add(i);
          matched = true;
          break;
        }
      }

      if (!matched) {
        // Start new rect
        newActiveRects.push({
          xStart: run.xStart,
          xEnd: run.xEnd,
          yStart: row,
          height: 1,
          fill: run.fill,
        });
      }
    }

    // Flush unmatched active rects to results
    for (let i = 0; i < activeRects.length; i++) {
      if (!matchedActive.has(i)) {
        const rect = activeRects[i];
        results.push({
          x: (rect.xStart + margin) * moduleSize,
          y: (rect.yStart + margin) * moduleSize,
          width: (rect.xEnd - rect.xStart) * moduleSize,
          height: rect.height * moduleSize,
          fill: rect.fill,
        });
      }
    }

    activeRects = newActiveRects;
  }

  // Flush remaining active rects
  for (const rect of activeRects) {
    results.push({
      x: (rect.xStart + margin) * moduleSize,
      y: (rect.yStart + margin) * moduleSize,
      width: (rect.xEnd - rect.xStart) * moduleSize,
      height: rect.height * moduleSize,
      fill: rect.fill,
    });
  }

  return results;
}

/**
 * Convert merged rectangles into SVG path elements grouped by fill color.
 */
export function mergedRectsToSvg(
  rects: MergedRect[],
  fillMap: Record<string, string>,
): string {
  // Group rects by fill
  const groups: Record<string, MergedRect[]> = {};
  for (const rect of rects) {
    const fill = fillMap[rect.fill] ?? fillMap['default'] ?? '#000000';
    if (!groups[fill]) groups[fill] = [];
    groups[fill].push(rect);
  }

  const parts: string[] = [];
  for (const [fill, groupRects] of Object.entries(groups)) {
    // Build a single <path> with all rectangles as subpaths
    const d = groupRects
      .map(r => `M${r.x} ${r.y}h${r.width}v${r.height}h${-r.width}Z`)
      .join('');
    parts.push(`<path d="${d}" fill="${fill}"/>`);
  }

  return parts.join('');
}
