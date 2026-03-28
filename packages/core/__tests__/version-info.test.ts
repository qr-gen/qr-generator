import { describe, it, expect } from 'vitest';
import { getVersionBits, placeVersionInfo, reserveVersionAreas } from '../src/matrix/version-info';

describe('Version Info', () => {
  it('returns null for versions 1-6', () => {
    for (let v = 1; v <= 6; v++) {
      expect(getVersionBits(v)).toBeNull();
    }
  });

  it('returns 18-bit string for version 7', () => {
    const bits = getVersionBits(7);
    expect(bits).not.toBeNull();
    expect(bits!).toHaveLength(18);
  });

  it('version 7 bits match known value', () => {
    // Version 7: 000111 -> after BCH(18,6): 000111 110010010100
    const bits = getVersionBits(7);
    expect(bits).toEqual([0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0]);
  });

  it('all versions 7-40 produce 18-bit strings', () => {
    for (let v = 7; v <= 40; v++) {
      const bits = getVersionBits(v);
      expect(bits).toHaveLength(18);
      for (const b of bits!) {
        expect(b === 0 || b === 1).toBe(true);
      }
    }
  });

  it('does nothing for versions < 7', () => {
    const matrix = Array.from({ length: 21 }, () => new Array(21).fill(-1));
    placeVersionInfo(matrix, 1);
    // All cells should still be -1
    for (let r = 0; r < 21; r++) {
      for (let c = 0; c < 21; c++) {
        expect(matrix[r][c]).toBe(-1);
      }
    }
  });

  it('placeVersionInfo with moduleTypes marks cells as VERSION_INFO (type 5)', () => {
    const size = 45; // version 7
    const matrix = Array.from({ length: size }, () => new Array(size).fill(0));
    const moduleTypes = Array.from({ length: size }, () => new Array(size).fill(0));
    placeVersionInfo(matrix, 7, moduleTypes);
    // Check that version info areas are marked as type 5
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 3; j++) {
        expect(moduleTypes[i][size - 11 + j]).toBe(5);
        expect(moduleTypes[size - 11 + j][i]).toBe(5);
      }
    }
  });

  it('placeVersionInfo without moduleTypes still places bits', () => {
    const size = 45;
    const matrix = Array.from({ length: size }, () => new Array(size).fill(-1));
    placeVersionInfo(matrix, 7);
    // Bits should be placed (not -1 anymore) in version info area
    let placedCount = 0;
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 3; j++) {
        if (matrix[i][size - 11 + j] !== -1) placedCount++;
      }
    }
    expect(placedCount).toBe(18);
  });

  describe('reserveVersionAreas', () => {
    it('does nothing for versions < 7', () => {
      const reserved = Array.from({ length: 21 }, () => new Array(21).fill(false));
      reserveVersionAreas(reserved, 21, 6);
      for (let r = 0; r < 21; r++) {
        for (let c = 0; c < 21; c++) {
          expect(reserved[r][c]).toBe(false);
        }
      }
    });

    it('reserves areas for version >= 7', () => {
      const size = 45;
      const reserved = Array.from({ length: size }, () => new Array(size).fill(false));
      reserveVersionAreas(reserved, size, 7);
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 3; j++) {
          expect(reserved[i][size - 11 + j]).toBe(true);
          expect(reserved[size - 11 + j][i]).toBe(true);
        }
      }
    });

    it('works without moduleTypes', () => {
      const size = 45;
      const reserved = Array.from({ length: size }, () => new Array(size).fill(false));
      // Should not throw
      reserveVersionAreas(reserved, size, 7);
      expect(reserved[0][size - 11]).toBe(true);
    });

    it('sets moduleTypes when provided', () => {
      const size = 45;
      const reserved = Array.from({ length: size }, () => new Array(size).fill(false));
      const moduleTypes = Array.from({ length: size }, () => new Array(size).fill(0));
      reserveVersionAreas(reserved, size, 7, moduleTypes);
      expect(moduleTypes[0][size - 11]).toBe(5);
    });
  });
});
