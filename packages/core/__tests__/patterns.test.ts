import { describe, it, expect } from 'vitest';
import { placeFinderPatterns } from '../src/matrix/finder-pattern';
import { placeTimingPatterns } from '../src/matrix/timing-pattern';
import { placeAlignmentPatterns } from '../src/matrix/alignment-pattern';

function createMatrix(size: number): number[][] {
  return Array.from({ length: size }, () => new Array(size).fill(-1));
}

function createReserved(size: number): boolean[][] {
  return Array.from({ length: size }, () => new Array(size).fill(false));
}

describe('Finder Patterns', () => {
  it('places 3 finder patterns on v1 (21x21)', () => {
    const matrix = createMatrix(21);
    const reserved = createReserved(21);
    placeFinderPatterns(matrix, reserved);

    // Top-left finder pattern: 7x7 at (0,0)
    // Outer ring is dark, then light, then 3x3 dark center
    expect(matrix[0][0]).toBe(1); // top-left corner = dark
    expect(matrix[0][6]).toBe(1); // top-right of finder
    expect(matrix[6][0]).toBe(1); // bottom-left of finder
    expect(matrix[6][6]).toBe(1); // bottom-right of finder

    // Inner ring is light
    expect(matrix[1][1]).toBe(0);
    expect(matrix[1][5]).toBe(0);

    // Center 3x3 is dark
    expect(matrix[3][3]).toBe(1);

    // Top-right finder at (0, 14)
    expect(matrix[0][14]).toBe(1);
    expect(matrix[0][20]).toBe(1);
    expect(matrix[3][17]).toBe(1); // center

    // Bottom-left finder at (14, 0)
    expect(matrix[14][0]).toBe(1);
    expect(matrix[20][0]).toBe(1);
    expect(matrix[17][3]).toBe(1); // center

    // Separators: white border around each finder
    // Right of top-left finder
    expect(matrix[0][7]).toBe(0);
    expect(matrix[7][0]).toBe(0);
    // Left of top-right finder
    expect(matrix[0][13]).toBe(0);
    // Above bottom-left finder
    expect(matrix[13][0]).toBe(0);
  });

  it('marks all finder + separator areas as reserved', () => {
    const matrix = createMatrix(21);
    const reserved = createReserved(21);
    placeFinderPatterns(matrix, reserved);

    // Top-left 8x8 should be reserved
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        expect(reserved[r][c]).toBe(true);
      }
    }

    // Top-right 8x8
    for (let r = 0; r < 8; r++) {
      for (let c = 13; c < 21; c++) {
        expect(reserved[r][c]).toBe(true);
      }
    }

    // Bottom-left 8x8
    for (let r = 13; r < 21; r++) {
      for (let c = 0; c < 8; c++) {
        expect(reserved[r][c]).toBe(true);
      }
    }
  });
});

describe('Timing Patterns', () => {
  it('places alternating pattern on row 6 and col 6', () => {
    const size = 21;
    const matrix = createMatrix(size);
    const reserved = createReserved(size);
    // Need to reserve finder areas first
    placeFinderPatterns(matrix, reserved);
    placeTimingPatterns(matrix, reserved, size);

    // Row 6: from col 8 to col 12 (between finder separators)
    expect(matrix[6][8]).toBe(1);  // dark
    expect(matrix[6][9]).toBe(0);  // light
    expect(matrix[6][10]).toBe(1); // dark
    expect(matrix[6][11]).toBe(0); // light
    expect(matrix[6][12]).toBe(1); // dark

    // Col 6: from row 8 to row 12
    expect(matrix[8][6]).toBe(1);
    expect(matrix[9][6]).toBe(0);
    expect(matrix[10][6]).toBe(1);
    expect(matrix[11][6]).toBe(0);
    expect(matrix[12][6]).toBe(1);
  });
});

describe('Alignment Patterns', () => {
  it('v1 has no alignment patterns', () => {
    const matrix = createMatrix(21);
    const reserved = createReserved(21);
    placeAlignmentPatterns(matrix, reserved, 1);
    // No changes expected - matrix should still be all -1 (except we don't check all)
  });

  it('v2 has one alignment pattern at (18,18)', () => {
    const size = 25; // v2 = 4*2+17 = 25
    const matrix = createMatrix(size);
    const reserved = createReserved(size);
    placeFinderPatterns(matrix, reserved);
    placeAlignmentPatterns(matrix, reserved, 2);

    // Alignment pattern center at (18, 18)
    expect(matrix[18][18]).toBe(1); // center dark
    expect(matrix[17][17]).toBe(0); // ring light
    expect(matrix[16][16]).toBe(1); // outer dark
    expect(matrix[16][18]).toBe(1);
    expect(matrix[18][16]).toBe(1);
  });

  it('skips alignment patterns that overlap finder patterns', () => {
    const size = 45; // v7 = 4*7+17 = 45
    const matrix = createMatrix(size);
    const reserved = createReserved(size);
    placeFinderPatterns(matrix, reserved);
    placeAlignmentPatterns(matrix, reserved, 7);

    // v7 positions: [6, 22, 38]
    // (6,6) overlaps top-left finder - should be skipped
    // (6,38) overlaps top-right finder - should be skipped
    // (38,6) overlaps bottom-left finder - should be skipped
    // (22,22), (22,6), (6,22), (22,38), (38,22), (38,38) should be placed
    // (but (6,6), (6,38), (38,6) overlap finders)

    // Check that (22, 22) has alignment pattern
    expect(matrix[22][22]).toBe(1);
    expect(matrix[21][21]).toBe(0);
    expect(matrix[20][20]).toBe(1);
  });
});
