import { describe, it, expect } from 'vitest';
import { renderPNG } from '../src/png/renderer.js';
import type { RenderOptions } from '../src/types.js';

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

const matrix = [
  [1, 0, 1],
  [0, 1, 0],
  [1, 0, 1],
];

/** Read a 4-byte big-endian unsigned integer from a buffer at the given offset. */
function readU32BE(buf: Uint8Array, offset: number): number {
  return (
    ((buf[offset] << 24) |
      (buf[offset + 1] << 16) |
      (buf[offset + 2] << 8) |
      buf[offset + 3]) >>>
    0
  );
}

function defaultOptions(overrides: Partial<RenderOptions> = {}): RenderOptions {
  return { size: 100, ...overrides };
}

describe('renderPNG', () => {
  it('returns a Uint8Array', () => {
    const result = renderPNG(matrix, defaultOptions());
    expect(result).toBeInstanceOf(Uint8Array);
  });

  it('output starts with PNG signature [137, 80, 78, 71, 13, 10, 26, 10]', () => {
    const result = renderPNG(matrix, defaultOptions());
    const sig = Array.from(result.slice(0, 8));
    expect(sig).toEqual(PNG_SIGNATURE);
  });

  it('default options produce valid PNG (black on white)', () => {
    const result = renderPNG(matrix, defaultOptions());
    expect(result.length).toBeGreaterThan(8);
    const sig = Array.from(result.slice(0, 8));
    expect(sig).toEqual(PNG_SIGNATURE);
  });

  it('custom fgColor=#cc0000 produces valid PNG', () => {
    const result = renderPNG(matrix, defaultOptions({ fgColor: '#cc0000' }));
    expect(result.length).toBeGreaterThan(8);
    const sig = Array.from(result.slice(0, 8));
    expect(sig).toEqual(PNG_SIGNATURE);
  });

  it('custom bgColor=#00ff00 produces valid PNG', () => {
    const result = renderPNG(matrix, defaultOptions({ bgColor: '#00ff00' }));
    expect(result.length).toBeGreaterThan(8);
    const sig = Array.from(result.slice(0, 8));
    expect(sig).toEqual(PNG_SIGNATURE);
  });

  it('all 3 shapes (square, rounded, dots) produce different byte output', () => {
    const squareResult = renderPNG(matrix, defaultOptions({ shape: 'square' }));
    const roundedResult = renderPNG(matrix, defaultOptions({ shape: 'rounded' }));
    const dotsResult = renderPNG(matrix, defaultOptions({ shape: 'dots' }));

    // Each should be valid PNG
    for (const result of [squareResult, roundedResult, dotsResult]) {
      const sig = Array.from(result.slice(0, 8));
      expect(sig).toEqual(PNG_SIGNATURE);
    }

    // They should produce different output because the pixel data differs
    const squareStr = Array.from(squareResult).join(',');
    const roundedStr = Array.from(roundedResult).join(',');
    const dotsStr = Array.from(dotsResult).join(',');

    expect(squareStr).not.toBe(roundedStr);
    expect(squareStr).not.toBe(dotsStr);
    expect(roundedStr).not.toBe(dotsStr);
  });

  it('gradient fgColor produces valid PNG (starts with PNG signature)', () => {
    const result = renderPNG(matrix, defaultOptions({
      fgColor: { type: 'linear', colors: ['#ff0000', '#0000ff'] },
    }));
    const sig = Array.from(result.slice(0, 8));
    expect(sig).toEqual(PNG_SIGNATURE);
  });

  it('size parameter is respected — verify by parsing IHDR chunk', () => {
    const size = 256;
    const result = renderPNG(matrix, defaultOptions({ size }));

    // IHDR width is at bytes 16-19 and height at 20-23 (big-endian)
    const width = readU32BE(result, 16);
    const height = readU32BE(result, 20);

    expect(width).toBe(size);
    expect(height).toBe(size);
  });

  it('validation runs by default — low contrast (#777777 on #888888) throws', () => {
    expect(() =>
      renderPNG(matrix, defaultOptions({ fgColor: '#777777', bgColor: '#888888' })),
    ).toThrow(/validation failed/i);
  });

  it('skipValidation bypasses validation', () => {
    const result = renderPNG(matrix, defaultOptions({
      fgColor: '#777777',
      bgColor: '#888888',
      skipValidation: true,
    }));
    expect(result).toBeInstanceOf(Uint8Array);
    const sig = Array.from(result.slice(0, 8));
    expect(sig).toEqual(PNG_SIGNATURE);
  });

  it('with logo config, output is still valid PNG', () => {
    const result = renderPNG(matrix, defaultOptions({
      logo: { src: 'https://example.com/logo.png', width: 20, height: 20 },
      skipValidation: true,
    }));
    expect(result).toBeInstanceOf(Uint8Array);
    const sig = Array.from(result.slice(0, 8));
    expect(sig).toEqual(PNG_SIGNATURE);
  });
});
