import { describe, it, expect, beforeEach } from 'vitest';
import { generateQR, clearQRCache } from '../src/generate';
import { MODULE_TYPE } from '../src/types';
import { ALIGNMENT_POSITIONS } from '../src/tables/alignment-positions';

describe('structural scan verification', () => {
  beforeEach(() => { clearQRCache(); });

  describe('finder patterns', () => {
    it('has correct 7x7 finder pattern at top-left', () => {
      const { matrix, moduleTypes, size } = generateQR({ data: 'TEST' });
      // Top-left finder: rows 0-6, cols 0-6
      // Outer ring = FINDER(1), inner 3x3 = FINDER_INNER(8)
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          expect(moduleTypes[r][c]).toBe(isInner ? MODULE_TYPE.FINDER_INNER : MODULE_TYPE.FINDER);
        }
      }
      // Verify the actual pattern
      const expected = [
        [1,1,1,1,1,1,1],
        [1,0,0,0,0,0,1],
        [1,0,1,1,1,0,1],
        [1,0,1,1,1,0,1],
        [1,0,1,1,1,0,1],
        [1,0,0,0,0,0,1],
        [1,1,1,1,1,1,1],
      ];
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          expect(matrix[r][c]).toBe(expected[r][c]);
        }
      }
    });

    it('has correct finder patterns at all 3 corners', () => {
      const { moduleTypes, size } = generateQR({ data: 'TEST' });
      // Helper to check finder type at position within a 7x7 finder
      const isFinderInner = (r: number, c: number) => r >= 2 && r <= 4 && c >= 2 && c <= 4;
      // Top-right
      for (let r = 0; r < 7; r++)
        for (let c = size - 7; c < size; c++) {
          const localR = r, localC = c - (size - 7);
          expect(moduleTypes[r][c]).toBe(
            isFinderInner(localR, localC) ? MODULE_TYPE.FINDER_INNER : MODULE_TYPE.FINDER
          );
        }
      // Bottom-left
      for (let r = size - 7; r < size; r++)
        for (let c = 0; c < 7; c++) {
          const localR = r - (size - 7), localC = c;
          expect(moduleTypes[r][c]).toBe(
            isFinderInner(localR, localC) ? MODULE_TYPE.FINDER_INNER : MODULE_TYPE.FINDER
          );
        }
    });

    it('has separators around finder patterns', () => {
      const { moduleTypes, matrix } = generateQR({ data: 'TEST' });
      // Right of top-left finder: col 7, rows 0-7
      for (let r = 0; r < 8; r++) {
        expect(moduleTypes[r][7]).toBe(MODULE_TYPE.SEPARATOR);
        expect(matrix[r][7]).toBe(0); // separators are white
      }
    });
  });

  describe('timing patterns', () => {
    it('has alternating timing pattern on row 6', () => {
      const { matrix, moduleTypes, size } = generateQR({ data: 'TEST' });
      // Timing runs between separators; position 8 may be format info, so check only TIMING-typed cells
      for (let c = 8; c < size - 8; c++) {
        if (moduleTypes[6][c] === MODULE_TYPE.FORMAT_INFO) continue;
        expect(moduleTypes[6][c]).toBe(MODULE_TYPE.TIMING);
        expect(matrix[6][c]).toBe(c % 2 === 0 ? 1 : 0);
      }
    });

    it('has alternating timing pattern on col 6', () => {
      const { matrix, moduleTypes, size } = generateQR({ data: 'TEST' });
      // Timing runs between separators; position 8 may be format info, so check only TIMING-typed cells
      for (let r = 8; r < size - 8; r++) {
        if (moduleTypes[r][6] === MODULE_TYPE.FORMAT_INFO) continue;
        expect(moduleTypes[r][6]).toBe(MODULE_TYPE.TIMING);
        expect(matrix[r][6]).toBe(r % 2 === 0 ? 1 : 0);
      }
    });
  });

  describe('alignment patterns', () => {
    it('has alignment patterns for version 2+', () => {
      // Generate a QR that requires version 2+
      const result = generateQR({ data: 'A'.repeat(30) });
      if (result.version < 2) return; // skip if not needed

      const positions = ALIGNMENT_POSITIONS[result.version];
      if (positions.length === 0) return;

      let foundAlignment = false;
      for (let r = 0; r < result.size; r++) {
        for (let c = 0; c < result.size; c++) {
          if (result.moduleTypes[r][c] === MODULE_TYPE.ALIGNMENT) {
            foundAlignment = true;
            break;
          }
        }
        if (foundAlignment) break;
      }
      expect(foundAlignment).toBe(true);
    });
  });

  describe('format info', () => {
    it('has format info at designated positions', () => {
      const { moduleTypes } = generateQR({ data: 'TEST' });
      // Some known format info positions around top-left
      expect(moduleTypes[8][0]).toBe(MODULE_TYPE.FORMAT_INFO);
      expect(moduleTypes[8][1]).toBe(MODULE_TYPE.FORMAT_INFO);
      expect(moduleTypes[0][8]).toBe(MODULE_TYPE.FORMAT_INFO);
    });
  });

  describe('dark module', () => {
    it('has dark module at (size-8, 8)', () => {
      const { matrix, moduleTypes, size } = generateQR({ data: 'TEST' });
      expect(moduleTypes[size - 8][8]).toBe(MODULE_TYPE.DARK_MODULE);
      expect(matrix[size - 8][8]).toBe(1);
    });
  });

  describe('version info', () => {
    it('has version info for version 7+', () => {
      const result = generateQR({ data: 'A'.repeat(180) });
      if (result.version < 7) return;

      let foundVersionInfo = false;
      for (let r = 0; r < result.size; r++) {
        for (let c = 0; c < result.size; c++) {
          if (result.moduleTypes[r][c] === MODULE_TYPE.VERSION_INFO) {
            foundVersionInfo = true;
            break;
          }
        }
        if (foundVersionInfo) break;
      }
      expect(foundVersionInfo).toBe(true);
    });
  });

  describe('completeness', () => {
    it('all cells are initialized (no -1 values)', () => {
      const { matrix, size } = generateQR({ data: 'HELLO WORLD' });
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          expect(matrix[r][c]).toBeGreaterThanOrEqual(0);
          expect(matrix[r][c]).toBeLessThanOrEqual(1);
        }
      }
    });

    it('matrix dimensions match size field', () => {
      const result = generateQR({ data: 'TEST' });
      expect(result.matrix.length).toBe(result.size);
      expect(result.matrix[0].length).toBe(result.size);
      expect(result.moduleTypes.length).toBe(result.size);
      expect(result.moduleTypes[0].length).toBe(result.size);
    });
  });
});
