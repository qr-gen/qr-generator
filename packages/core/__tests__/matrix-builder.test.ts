import { describe, it, expect } from 'vitest';
import { buildMatrix } from '../src/matrix/matrix-builder';
import { MODULE_TYPE } from '../src/types';

describe('Matrix Builder', () => {
  it('produces correct size for version 1 (21x21)', () => {
    const data = new Uint8Array(26); // v1: 26 total codewords
    const { matrix } = buildMatrix(data, 1, 'M');
    expect(matrix).toHaveLength(21);
    expect(matrix[0]).toHaveLength(21);
  });

  it('produces correct size for version 2 (25x25)', () => {
    const data = new Uint8Array(44); // v2: 44 total codewords
    const { matrix } = buildMatrix(data, 2, 'M');
    expect(matrix).toHaveLength(25);
    expect(matrix[0]).toHaveLength(25);
  });

  it('all cells are 0 or 1 (no unset cells)', () => {
    const data = new Uint8Array(26);
    const { matrix } = buildMatrix(data, 1, 'M');
    for (let r = 0; r < 21; r++) {
      for (let c = 0; c < 21; c++) {
        expect(matrix[r][c] === 0 || matrix[r][c] === 1).toBe(true);
      }
    }
  });

  it('finder patterns are present', () => {
    const data = new Uint8Array(26);
    const { matrix } = buildMatrix(data, 1, 'M');

    // Top-left finder center
    expect(matrix[3][3]).toBe(1);
    // Top-right finder center
    expect(matrix[3][17]).toBe(1);
    // Bottom-left finder center
    expect(matrix[17][3]).toBe(1);
  });

  it('returns mask index between 0 and 7', () => {
    const data = new Uint8Array(26);
    const { maskIndex } = buildMatrix(data, 1, 'M');
    expect(maskIndex).toBeGreaterThanOrEqual(0);
    expect(maskIndex).toBeLessThanOrEqual(7);
  });

  it('works for version 7 (needs version info)', () => {
    const data = new Uint8Array(196); // v7-M total codewords
    const { matrix } = buildMatrix(data, 7, 'M');
    expect(matrix).toHaveLength(45);
  });

  describe('moduleTypes', () => {
    it('returns moduleTypes array with same dimensions as matrix', () => {
      const data = new Uint8Array(26);
      const { matrix, moduleTypes } = buildMatrix(data, 1, 'M');
      expect(moduleTypes).toHaveLength(matrix.length);
      for (let r = 0; r < matrix.length; r++) {
        expect(moduleTypes[r]).toHaveLength(matrix[r].length);
      }
    });

    it('finder pattern positions are MODULE_TYPE.FINDER', () => {
      const data = new Uint8Array(26);
      const { moduleTypes } = buildMatrix(data, 1, 'M');
      const size = 21;
      // Top-left 7x7
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          expect(moduleTypes[r][c]).toBe(MODULE_TYPE.FINDER);
        }
      }
      // Top-right 7x7
      for (let r = 0; r < 7; r++) {
        for (let c = size - 7; c < size; c++) {
          expect(moduleTypes[r][c]).toBe(MODULE_TYPE.FINDER);
        }
      }
      // Bottom-left 7x7
      for (let r = size - 7; r < size; r++) {
        for (let c = 0; c < 7; c++) {
          expect(moduleTypes[r][c]).toBe(MODULE_TYPE.FINDER);
        }
      }
    });

    it('separator positions are MODULE_TYPE.SEPARATOR', () => {
      const data = new Uint8Array(26);
      const { moduleTypes } = buildMatrix(data, 1, 'M');
      const size = 21;
      // Right of top-left finder (col 7, rows 0-7)
      for (let i = 0; i < 8; i++) {
        expect(moduleTypes[i][7]).toBe(MODULE_TYPE.SEPARATOR);
      }
      // Below top-left finder (row 7, cols 0-6)
      for (let i = 0; i < 7; i++) {
        expect(moduleTypes[7][i]).toBe(MODULE_TYPE.SEPARATOR);
      }
      // Row 7 col 7
      expect(moduleTypes[7][7]).toBe(MODULE_TYPE.SEPARATOR);
    });

    it('timing pattern on row 6 and col 6 are MODULE_TYPE.TIMING', () => {
      const data = new Uint8Array(44);
      const { moduleTypes } = buildMatrix(data, 2, 'M');
      // Timing runs from 8 to size-9 on row 6 and col 6
      // For version 2, size=25, timing goes from 8 to 16
      // Check positions that don't overlap with format info (col 8 / row 8)
      for (let i = 9; i < 17; i++) {
        expect(moduleTypes[6][i]).toBe(MODULE_TYPE.TIMING);
        expect(moduleTypes[i][6]).toBe(MODULE_TYPE.TIMING);
      }
      // Position [6][8] overlaps with format info area (col 8 reserved)
      expect(moduleTypes[6][8]).toBe(MODULE_TYPE.FORMAT_INFO);
      // Position [8][6] overlaps with format info area (row 8 reserved)
      expect(moduleTypes[8][6]).toBe(MODULE_TYPE.FORMAT_INFO);
    });

    it('alignment positions are MODULE_TYPE.ALIGNMENT for version 2', () => {
      const data = new Uint8Array(44);
      const { moduleTypes } = buildMatrix(data, 2, 'M');
      // Version 2 has alignment at center (18,18) - 5x5 pattern
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          expect(moduleTypes[18 + r][18 + c]).toBe(MODULE_TYPE.ALIGNMENT);
        }
      }
    });

    it('format info positions are MODULE_TYPE.FORMAT_INFO', () => {
      const data = new Uint8Array(26);
      const { moduleTypes } = buildMatrix(data, 1, 'M');
      // Copy 1 around top-left: row 8 cols 0-5, col 7, col 8; col 8 rows 0-5, row 7
      expect(moduleTypes[8][0]).toBe(MODULE_TYPE.FORMAT_INFO);
      expect(moduleTypes[8][1]).toBe(MODULE_TYPE.FORMAT_INFO);
      expect(moduleTypes[8][2]).toBe(MODULE_TYPE.FORMAT_INFO);
      expect(moduleTypes[0][8]).toBe(MODULE_TYPE.FORMAT_INFO);
      expect(moduleTypes[1][8]).toBe(MODULE_TYPE.FORMAT_INFO);
    });

    it('dark module at (size-8, 8) is MODULE_TYPE.DARK_MODULE', () => {
      const data = new Uint8Array(26);
      const { moduleTypes } = buildMatrix(data, 1, 'M');
      const size = 21;
      expect(moduleTypes[size - 8][8]).toBe(MODULE_TYPE.DARK_MODULE);
    });

    it('version info positions are MODULE_TYPE.VERSION_INFO for version 7+', () => {
      const data = new Uint8Array(196);
      const { moduleTypes } = buildMatrix(data, 7, 'M');
      const size = 45;
      // Bottom-left of top-right finder: rows 0-5, cols (size-11) to (size-9)
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 3; j++) {
          expect(moduleTypes[i][size - 11 + j]).toBe(MODULE_TYPE.VERSION_INFO);
          expect(moduleTypes[size - 11 + j][i]).toBe(MODULE_TYPE.VERSION_INFO);
        }
      }
    });

    it('data module positions are MODULE_TYPE.DATA (value 0)', () => {
      const data = new Uint8Array(26);
      const { moduleTypes } = buildMatrix(data, 1, 'M');
      // Check some known data positions (bottom-right area for v1)
      // These are not finder, timing, format, or dark module areas
      // For version 1, row 20 col 20 should be data
      expect(moduleTypes[20][20]).toBe(MODULE_TYPE.DATA);
    });
  });
});
