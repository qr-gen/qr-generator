import { describe, it, expect } from 'vitest';
import { getMaskFunction, computePenalty, selectBestMask, applyMask } from '../src/matrix/masking';

describe('Mask Functions', () => {
  it('mask 0: (row + col) % 2 === 0', () => {
    const fn = getMaskFunction(0);
    expect(fn(0, 0)).toBe(true);  // 0+0=0 %2=0
    expect(fn(0, 1)).toBe(false); // 0+1=1 %2=1
    expect(fn(1, 0)).toBe(false);
    expect(fn(1, 1)).toBe(true);
  });

  it('mask 1: row % 2 === 0', () => {
    const fn = getMaskFunction(1);
    expect(fn(0, 0)).toBe(true);
    expect(fn(0, 5)).toBe(true);
    expect(fn(1, 0)).toBe(false);
    expect(fn(2, 0)).toBe(true);
  });

  it('mask 2: col % 3 === 0', () => {
    const fn = getMaskFunction(2);
    expect(fn(0, 0)).toBe(true);
    expect(fn(0, 1)).toBe(false);
    expect(fn(0, 2)).toBe(false);
    expect(fn(0, 3)).toBe(true);
  });

  it('mask 3: (row + col) % 3 === 0', () => {
    const fn = getMaskFunction(3);
    expect(fn(0, 0)).toBe(true);
    expect(fn(0, 3)).toBe(true);
    expect(fn(1, 2)).toBe(true);
  });

  it('mask 4: (floor(row/2) + floor(col/3)) % 2 === 0', () => {
    const fn = getMaskFunction(4);
    expect(fn(0, 0)).toBe(true);
    expect(fn(0, 3)).toBe(false);
    expect(fn(2, 0)).toBe(false);
  });

  it('mask 5: (row*col)%2 + (row*col)%3 === 0', () => {
    const fn = getMaskFunction(5);
    expect(fn(0, 0)).toBe(true);
    expect(fn(1, 1)).toBe(false);
  });

  it('mask 6: ((row*col)%2 + (row*col)%3) % 2 === 0', () => {
    const fn = getMaskFunction(6);
    expect(fn(0, 0)).toBe(true);
  });

  it('mask 7: ((row+col)%2 + (row*col)%3) % 2 === 0', () => {
    const fn = getMaskFunction(7);
    expect(fn(0, 0)).toBe(true);
  });
});

describe('Penalty', () => {
  it('computes penalty for all-dark matrix', () => {
    const size = 5;
    const matrix = Array.from({ length: size }, () => new Array(size).fill(1));
    const penalty = computePenalty(matrix);
    // Should have high penalty (rule 4 for 100% dark ratio)
    expect(penalty).toBeGreaterThan(0);
  });

  it('rule 1: consecutive same-color modules score', () => {
    // 5+ consecutive = 3 + (count - 5) per run
    const matrix = Array.from({ length: 5 }, () => new Array(5).fill(0));
    // Make row 0 all dark
    for (let c = 0; c < 5; c++) matrix[0][c] = 1;
    const penalty = computePenalty(matrix);
    expect(penalty).toBeGreaterThan(0);
  });
});

describe('applyMask', () => {
  it('flips non-reserved dark cells where mask is true', () => {
    const matrix = [[1, 0], [0, 1]];
    const reserved = [[false, false], [false, false]];
    const result = applyMask(matrix, reserved, 0);
    // mask 0: (r+c)%2===0 -> flip (0,0) and (1,1)
    expect(result[0][0]).toBe(0); // was 1, flipped
    expect(result[0][1]).toBe(0); // was 0, not flipped (mask false)
    expect(result[1][0]).toBe(0); // was 0, not flipped (mask false)
    expect(result[1][1]).toBe(0); // was 1, flipped
  });

  it('does not flip reserved cells', () => {
    const matrix = [[1, 0], [0, 1]];
    const reserved = [[true, false], [false, true]];
    const result = applyMask(matrix, reserved, 0);
    expect(result[0][0]).toBe(1); // reserved, not flipped
    expect(result[1][1]).toBe(1); // reserved, not flipped
  });
});

describe('selectBestMask', () => {
  it('returns a mask index between 0 and 7', () => {
    const size = 21;
    const matrix = Array.from({ length: size }, () => new Array(size).fill(0));
    const reserved = Array.from({ length: size }, () => new Array(size).fill(false));
    const { maskIndex } = selectBestMask(matrix, reserved);
    expect(maskIndex).toBeGreaterThanOrEqual(0);
    expect(maskIndex).toBeLessThanOrEqual(7);
  });
});
