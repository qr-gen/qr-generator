import { describe, it, expect } from 'vitest';
import { renderBMP } from '../src/bmp/renderer.js';
import type { RenderOptions } from '../src/types.js';

/** Read a 4-byte little-endian unsigned integer from a buffer at the given offset. */
function readU32LE(buf: Uint8Array, offset: number): number {
  return (
    buf[offset] |
    (buf[offset + 1] << 8) |
    (buf[offset + 2] << 16) |
    (buf[offset + 3] << 24)
  ) >>> 0;
}

const matrix: number[][] = [
  [1, 0, 1],
  [0, 1, 0],
  [1, 0, 1],
];

const defaultOptions: RenderOptions = {
  size: 33,
  skipValidation: true,
};

describe('renderBMP', () => {
  it('returns a Uint8Array', () => {
    const result = renderBMP(matrix, defaultOptions);
    expect(result).toBeInstanceOf(Uint8Array);
  });

  it('output starts with "BM" signature', () => {
    const result = renderBMP(matrix, defaultOptions);
    expect(result[0]).toBe(66); // 'B'
    expect(result[1]).toBe(77); // 'M'
  });

  it('default options (black on white) produce valid BMP', () => {
    const result = renderBMP(matrix, { size: 33, skipValidation: true });
    // Verify basic BMP structure
    expect(result[0]).toBe(66);
    expect(result[1]).toBe(77);
    const fileSize = readU32LE(result, 2);
    expect(fileSize).toBe(result.length);
    const pixelOffset = readU32LE(result, 10);
    expect(pixelOffset).toBe(54);
  });

  it('custom fgColor produces valid BMP', () => {
    const result = renderBMP(matrix, {
      ...defaultOptions,
      fgColor: '#ff0000',
    });
    expect(result[0]).toBe(66);
    expect(result[1]).toBe(77);
    const fileSize = readU32LE(result, 2);
    expect(fileSize).toBe(result.length);
  });

  it('all 3 shapes produce different output', () => {
    const square = renderBMP(matrix, { ...defaultOptions, shape: 'square' });
    const dots = renderBMP(matrix, { ...defaultOptions, shape: 'dots' });
    const rounded = renderBMP(matrix, { ...defaultOptions, shape: 'rounded' });

    // Each should be valid BMP
    expect(square[0]).toBe(66);
    expect(dots[0]).toBe(66);
    expect(rounded[0]).toBe(66);

    // All should have the same dimensions but different pixel data
    // Compare the pixel data portions (from offset 54 onwards)
    const squareData = square.slice(54);
    const dotsData = dots.slice(54);
    const roundedData = rounded.slice(54);

    // At least one byte should differ between each pair
    let squareDotsDiffer = false;
    let squareRoundedDiffer = false;
    for (let i = 0; i < squareData.length; i++) {
      if (squareData[i] !== dotsData[i]) squareDotsDiffer = true;
      if (squareData[i] !== roundedData[i]) squareRoundedDiffer = true;
      if (squareDotsDiffer && squareRoundedDiffer) break;
    }
    expect(squareDotsDiffer).toBe(true);
    expect(squareRoundedDiffer).toBe(true);
  });

  it('gradient fgColor produces valid BMP', () => {
    const result = renderBMP(matrix, {
      ...defaultOptions,
      fgColor: {
        type: 'linear',
        colors: ['#ff0000', '#0000ff'],
        angle: 45,
      },
    });
    expect(result[0]).toBe(66);
    expect(result[1]).toBe(77);
    const fileSize = readU32LE(result, 2);
    expect(fileSize).toBe(result.length);
  });

  it('size parameter respected (width/height in header match)', () => {
    const size = 50;
    const result = renderBMP(matrix, { ...defaultOptions, size });
    const width = readU32LE(result, 18);
    const height = readU32LE(result, 22);
    expect(width).toBe(size);
    expect(height).toBe(size);
  });

  it('validation runs by default', () => {
    // Using invalid options that should fail validation
    // fgColor and bgColor both the same should trigger contrast error
    expect(() => {
      renderBMP(matrix, {
        size: 33,
        fgColor: '#ffffff',
        bgColor: '#ffffff',
      });
    }).toThrow();
  });

  it('skipValidation bypasses validation', () => {
    // Same invalid options but with skipValidation = true
    const result = renderBMP(matrix, {
      size: 33,
      fgColor: '#ffffff',
      bgColor: '#ffffff',
      skipValidation: true,
    });
    expect(result[0]).toBe(66);
    expect(result[1]).toBe(77);
  });

  it('with logo config, output is still valid BMP', () => {
    const result = renderBMP(matrix, {
      ...defaultOptions,
      logo: {
        src: 'data:image/png;base64,iVBORw0KGgo=',
        width: 5,
        height: 5,
      },
    });
    expect(result[0]).toBe(66);
    expect(result[1]).toBe(77);
    const fileSize = readU32LE(result, 2);
    expect(fileSize).toBe(result.length);
  });
});
