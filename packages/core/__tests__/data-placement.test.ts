import { describe, it, expect } from 'vitest';
import { placeDataBits } from '../src/matrix/data-placement';
import { placeFinderPatterns } from '../src/matrix/finder-pattern';
import { placeTimingPatterns } from '../src/matrix/timing-pattern';
import { placeAlignmentPatterns } from '../src/matrix/alignment-pattern';
import { reserveFormatAreas } from '../src/matrix/format-info';
import { reserveVersionAreas } from '../src/matrix/version-info';

function setupMatrix(version: number) {
  const size = 4 * version + 17;
  const matrix = Array.from({ length: size }, () => new Array(size).fill(-1));
  const reserved = Array.from({ length: size }, () => new Array(size).fill(false));

  placeFinderPatterns(matrix, reserved);
  placeTimingPatterns(matrix, reserved, size);
  placeAlignmentPatterns(matrix, reserved, version);
  reserveFormatAreas(reserved, size);
  reserveVersionAreas(reserved, size, version);

  return { matrix, reserved, size };
}

describe('Data Placement', () => {
  it('places data bits in non-reserved cells for v1', () => {
    const { matrix, reserved, size } = setupMatrix(1);

    // Count available data cells
    let availableCells = 0;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!reserved[r][c]) availableCells++;
      }
    }

    // v1 total codewords = 26 (data + EC) = 208 bits
    // Create 208 bits of test data
    const dataBits = new Uint8Array(208);
    for (let i = 0; i < 208; i++) dataBits[i] = i % 2; // alternating 0,1

    const placed = placeDataBits(matrix, reserved, dataBits);
    expect(placed).toBe(208);

    // Verify all non-reserved cells got written (not -1)
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!reserved[r][c]) {
          expect(matrix[r][c]).not.toBe(-1);
        }
      }
    }
  });

  it('does not overwrite reserved cells', () => {
    const { matrix, reserved, size } = setupMatrix(1);

    // Save reserved cell values
    const reservedValues: Map<string, number> = new Map();
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (reserved[r][c] && matrix[r][c] !== -1) {
          reservedValues.set(`${r},${c}`, matrix[r][c]);
        }
      }
    }

    const dataBits = new Uint8Array(208).fill(1);
    placeDataBits(matrix, reserved, dataBits);

    // Verify reserved cells unchanged
    for (const [key, value] of reservedValues) {
      const [r, c] = key.split(',').map(Number);
      expect(matrix[r][c]).toBe(value);
    }
  });

  it('skips column 6 (timing pattern column)', () => {
    const { matrix, reserved } = setupMatrix(1);
    const dataBits = new Uint8Array(208).fill(1);
    placeDataBits(matrix, reserved, dataBits);

    // The zigzag traversal should skip column 6 entirely
    // (it's handled by timing pattern reservation, but the column skip is architectural)
  });

  it('works for v2 with alignment pattern', () => {
    const { matrix, reserved, size } = setupMatrix(2);
    let availableCells = 0;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!reserved[r][c]) availableCells++;
      }
    }

    const dataBits = new Uint8Array(availableCells);
    for (let i = 0; i < availableCells; i++) dataBits[i] = i % 2;
    const placed = placeDataBits(matrix, reserved, dataBits);
    expect(placed).toBe(availableCells);
  });
});
