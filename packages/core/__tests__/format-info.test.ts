import { describe, it, expect } from 'vitest';
import { getFormatBits, placeFormatInfo } from '../src/matrix/format-info';

describe('Format Info', () => {
  it('generates 15-bit format string', () => {
    const bits = getFormatBits('M', 0);
    expect(bits).toHaveLength(15);
  });

  it('format bits for EC=M, mask=0 are known value', () => {
    // EC level M = 00, mask 0 = 000 -> data = 00000
    // After BCH(15,5) and XOR with 0x5412:
    // Known: 101010000010010
    const bits = getFormatBits('M', 0);
    expect(bits).toEqual([1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0]);
  });

  it('format bits for EC=L, mask=0', () => {
    // EC level L = 01, mask 0 = 000 -> data = 01000
    const bits = getFormatBits('L', 0);
    expect(bits).toHaveLength(15);
  });

  it('places format info in correct positions', () => {
    const size = 21;
    const matrix = Array.from({ length: size }, () => new Array(size).fill(-1));
    placeFormatInfo(matrix, 'M', 0);

    // Format info is placed around the finders
    // Bits 0-7 along the left side of top-left finder (col 8, rows 0-7 skipping row 6)
    // and along the top of bottom-left finder
    // Check that cells are written (not -1)
    expect(matrix[8][8]).not.toBe(-1);
  });

  it('all 32 EC/mask combinations produce valid 15-bit strings', () => {
    const ecLevels = ['L', 'M', 'Q', 'H'] as const;
    for (const ec of ecLevels) {
      for (let mask = 0; mask < 8; mask++) {
        const bits = getFormatBits(ec, mask);
        expect(bits).toHaveLength(15);
        // All bits should be 0 or 1
        for (const b of bits) {
          expect(b === 0 || b === 1).toBe(true);
        }
      }
    }
  });
});
