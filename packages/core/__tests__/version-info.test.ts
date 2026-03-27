import { describe, it, expect } from 'vitest';
import { getVersionBits, placeVersionInfo } from '../src/matrix/version-info';

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
});
