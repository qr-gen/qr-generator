import { describe, it, expect } from 'vitest';
import { optimizeHalftone } from '../src/halftone/optimizer.js';
import { generateQR } from '@qr-kit/core';
import { getFlexibleModules } from '@qr-kit/core';

function makeAllDarkTarget(size: number): number[][] {
  return Array.from({ length: size }, () => Array(size).fill(1));
}

function makeAllLightTarget(size: number): number[][] {
  return Array.from({ length: size }, () => Array(size).fill(0));
}

function makeCheckerTarget(size: number): number[][] {
  return Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (_, c) => (r + c) % 2),
  );
}

describe('optimizeHalftone', () => {
  const qr = generateQR({ data: 'HELLO WORLD', errorCorrection: 'H' });
  const flexible = getFlexibleModules(qr.moduleTypes);

  it('returns a matrix of the same dimensions', () => {
    const target = makeAllDarkTarget(qr.size);
    const result = optimizeHalftone(qr.matrix, flexible, target, 0.7);
    expect(result.matrix.length).toBe(qr.size);
    expect(result.matrix[0].length).toBe(qr.size);
  });

  it('never flips non-flexible modules', () => {
    const target = makeAllDarkTarget(qr.size);
    const result = optimizeHalftone(qr.matrix, flexible, target, 1.0);

    for (let r = 0; r < qr.size; r++) {
      for (let c = 0; c < qr.size; c++) {
        if (!flexible[r][c]) {
          expect(result.matrix[r][c]).toBe(qr.matrix[r][c]);
        }
      }
    }
  });

  it('strength=0 produces zero flips', () => {
    const target = makeAllDarkTarget(qr.size);
    const result = optimizeHalftone(qr.matrix, flexible, target, 0);
    expect(result.flippedCount).toBe(0);
    expect(result.budgetUsed).toBe(0);

    // Matrix should be unchanged
    for (let r = 0; r < qr.size; r++) {
      for (let c = 0; c < qr.size; c++) {
        expect(result.matrix[r][c]).toBe(qr.matrix[r][c]);
      }
    }
  });

  it('respects the error budget (never exceeds 25% of flexible modules)', () => {
    const target = makeCheckerTarget(qr.size);
    const result = optimizeHalftone(qr.matrix, flexible, target, 1.0);

    let flexibleCount = 0;
    for (let r = 0; r < qr.size; r++) {
      for (let c = 0; c < qr.size; c++) {
        if (flexible[r][c]) flexibleCount++;
      }
    }

    const maxFlips = Math.floor(flexibleCount * 0.25);
    expect(result.flippedCount).toBeLessThanOrEqual(maxFlips);
  });

  it('budgetUsed is between 0 and 1', () => {
    const target = makeAllDarkTarget(qr.size);
    const result = optimizeHalftone(qr.matrix, flexible, target, 0.5);
    expect(result.budgetUsed).toBeGreaterThanOrEqual(0);
    expect(result.budgetUsed).toBeLessThanOrEqual(1);
  });

  it('flippedCount matches actual differences in matrix', () => {
    const target = makeCheckerTarget(qr.size);
    const result = optimizeHalftone(qr.matrix, flexible, target, 0.7);

    let diffs = 0;
    for (let r = 0; r < qr.size; r++) {
      for (let c = 0; c < qr.size; c++) {
        if (result.matrix[r][c] !== qr.matrix[r][c]) diffs++;
      }
    }
    expect(result.flippedCount).toBe(diffs);
  });

  it('flexibleCount is reported correctly', () => {
    const target = makeAllLightTarget(qr.size);
    const result = optimizeHalftone(qr.matrix, flexible, target, 0.5);

    let expectedFlex = 0;
    for (let r = 0; r < qr.size; r++) {
      for (let c = 0; c < qr.size; c++) {
        if (flexible[r][c]) expectedFlex++;
      }
    }
    expect(result.flexibleCount).toBe(expectedFlex);
  });

  it('only flips modules that mismatch the target', () => {
    const target = makeAllDarkTarget(qr.size);
    const result = optimizeHalftone(qr.matrix, flexible, target, 1.0);

    for (let r = 0; r < qr.size; r++) {
      for (let c = 0; c < qr.size; c++) {
        if (result.matrix[r][c] !== qr.matrix[r][c]) {
          // This module was flipped — it should have mismatched the target
          expect(qr.matrix[r][c]).not.toBe(target[r][c]);
        }
      }
    }
  });

  it('higher strength produces more or equal flips', () => {
    const target = makeCheckerTarget(qr.size);
    const low = optimizeHalftone(qr.matrix, flexible, target, 0.3);
    const high = optimizeHalftone(qr.matrix, flexible, target, 0.9);
    expect(high.flippedCount).toBeGreaterThanOrEqual(low.flippedCount);
  });

  it('does not modify the input matrix', () => {
    const originalMatrix = qr.matrix.map((row) => [...row]);
    const target = makeAllDarkTarget(qr.size);
    optimizeHalftone(qr.matrix, flexible, target, 1.0);

    for (let r = 0; r < qr.size; r++) {
      for (let c = 0; c < qr.size; c++) {
        expect(qr.matrix[r][c]).toBe(originalMatrix[r][c]);
      }
    }
  });
});
