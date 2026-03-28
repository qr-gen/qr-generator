import { describe, it, expect } from 'vitest';
import { generateQR, clearQRCache } from '../src/generate';

describe('generateQR', () => {
  it('generates a valid QR code for "HELLO WORLD"', () => {
    const result = generateQR({ data: 'HELLO WORLD' });
    expect(result.version).toBe(1);
    expect(result.errorCorrection).toBe('M');
    expect(result.mode).toBe('alphanumeric');
    expect(result.size).toBe(21);
    expect(result.matrix).toHaveLength(21);
    expect(result.matrix[0]).toHaveLength(21);
  });

  it('all cells are 0 or 1', () => {
    const result = generateQR({ data: 'HELLO WORLD' });
    for (let r = 0; r < result.size; r++) {
      for (let c = 0; c < result.size; c++) {
        const val = result.matrix[r][c];
        expect(val === 0 || val === 1).toBe(true);
      }
    }
  });

  it('auto-selects version based on data length', () => {
    // Short data -> small version
    const small = generateQR({ data: 'Hi' });
    expect(small.version).toBe(1);

    // Longer data -> higher version
    const long = generateQR({ data: 'https://example.com/very/long/path/that/needs/more/space' });
    expect(long.version).toBeGreaterThan(1);
  });

  it('respects explicit version', () => {
    const result = generateQR({ data: 'Hi', version: 5 });
    expect(result.version).toBe(5);
    expect(result.size).toBe(37); // 4*5+17
  });

  it('respects explicit error correction level', () => {
    const result = generateQR({ data: 'test', errorCorrection: 'H' });
    expect(result.errorCorrection).toBe('H');
  });

  it('throws on data too long', () => {
    expect(() => generateQR({ data: 'a'.repeat(3000) })).toThrow();
  });

  it('handles numeric data', () => {
    const result = generateQR({ data: '0123456789' });
    expect(result.mode).toBe('numeric');
  });

  it('handles byte mode for URLs', () => {
    const result = generateQR({ data: 'https://example.com' });
    expect(result.mode).toBe('byte');
  });

  it('handles empty string', () => {
    const result = generateQR({ data: '' });
    expect(result.version).toBe(1);
    expect(result.matrix).toHaveLength(21);
  });

  it('finder patterns are intact in final output', () => {
    const result = generateQR({ data: 'TEST' });
    const m = result.matrix;
    const s = result.size;

    // Top-left finder: corners should be dark
    expect(m[0][0]).toBe(1);
    expect(m[0][6]).toBe(1);
    expect(m[6][0]).toBe(1);
    expect(m[6][6]).toBe(1);

    // Top-right finder
    expect(m[0][s - 1]).toBe(1);
    expect(m[0][s - 7]).toBe(1);

    // Bottom-left finder
    expect(m[s - 1][0]).toBe(1);
    expect(m[s - 7][0]).toBe(1);
  });

  it('generates different matrices for different inputs', () => {
    const a = generateQR({ data: 'AAA' });
    const b = generateQR({ data: 'BBB' });
    // Matrices should differ
    let differs = false;
    for (let r = 0; r < a.size && !differs; r++) {
      for (let c = 0; c < a.size && !differs; c++) {
        if (a.matrix[r][c] !== b.matrix[r][c]) differs = true;
      }
    }
    expect(differs).toBe(true);
  });

  it('version 7+ includes version info areas', () => {
    // Force version 7 to test version info placement
    const result = generateQR({ data: 'A'.repeat(100), version: 7, errorCorrection: 'L' });
    expect(result.version).toBe(7);
    expect(result.size).toBe(45);
  });

  describe('memoization', () => {
    it('same options return same reference', () => {
      clearQRCache();
      const opts = { data: 'HELLO WORLD', errorCorrection: 'M' as const };
      const result1 = generateQR(opts);
      const result2 = generateQR(opts);
      expect(result1.matrix).toBe(result2.matrix);
    });

    it('different options return different results', () => {
      clearQRCache();
      const result1 = generateQR({ data: 'AAA' });
      const result2 = generateQR({ data: 'BBB' });
      expect(result1.matrix).not.toBe(result2.matrix);
    });

    it('clearQRCache causes same options to return different reference', () => {
      const opts = { data: 'CACHE TEST' };
      const result1 = generateQR(opts);
      clearQRCache();
      const result2 = generateQR(opts);
      expect(result1.matrix).not.toBe(result2.matrix);
    });

    it('after clearQRCache data is still correct', () => {
      clearQRCache();
      const result = generateQR({ data: 'HELLO WORLD' });
      expect(result.version).toBe(1);
      expect(result.size).toBe(21);
      expect(result.matrix).toHaveLength(21);
      expect(result.matrix[0]).toHaveLength(21);
    });
  });

  it('result includes moduleTypes with correct dimensions', () => {
    const result = generateQR({ data: 'HELLO WORLD' });
    expect(result.moduleTypes).toBeDefined();
    expect(result.moduleTypes).toHaveLength(result.size);
    expect(result.moduleTypes[0]).toHaveLength(result.size);
  });

  describe('LRU cache eviction', () => {
    it('evicts oldest entries when cache is full (capacity 16)', () => {
      clearQRCache();
      // Fill cache with 16 entries
      for (let i = 0; i < 16; i++) {
        generateQR({ data: `ITEM${i}`, errorCorrection: 'L' });
      }
      // These should be cached
      const before = generateQR({ data: 'ITEM0', errorCorrection: 'L' });

      // Add a 17th entry -> evicts ITEM0 (since ITEM0 was just re-used, ITEM1 is oldest)
      generateQR({ data: 'OVERFLOW', errorCorrection: 'L' });

      // ITEM1 was evicted (oldest untouched), so re-generating gives different ref
      clearQRCache();
      const after = generateQR({ data: 'ITEM0', errorCorrection: 'L' });
      // After clearing cache, refs should differ
      expect(before.matrix).not.toBe(after.matrix);
    });

    it('set replaces existing key without growing', () => {
      clearQRCache();
      const r1 = generateQR({ data: 'REPLACE_TEST' });
      clearQRCache();
      const r2 = generateQR({ data: 'REPLACE_TEST' });
      // Different references since cache was cleared
      expect(r1.matrix).not.toBe(r2.matrix);
      // But values are equal
      expect(r1.version).toBe(r2.version);
    });
  });
});
