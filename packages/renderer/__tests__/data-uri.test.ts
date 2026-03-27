import { describe, it, expect } from 'vitest';
import { renderDataURI } from '../src/data-uri/renderer';
import { base64Encode } from '../src/utils/base64';

const matrix: number[][] = [
  [1, 0, 1],
  [0, 1, 0],
  [1, 0, 1],
];

const defaultOptions = { size: 100, skipValidation: true } as const;

describe('renderDataURI', () => {
  it('SVG format starts with data:image/svg+xml;base64,', () => {
    const result = renderDataURI(matrix, defaultOptions, 'svg');
    expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
  });

  it('PNG format starts with data:image/png;base64,', () => {
    const result = renderDataURI(matrix, defaultOptions, 'png');
    expect(result).toMatch(/^data:image\/png;base64,/);
  });

  it('BMP format starts with data:image/bmp;base64,', () => {
    const result = renderDataURI(matrix, defaultOptions, 'bmp');
    expect(result).toMatch(/^data:image\/bmp;base64,/);
  });

  it('default format is png', () => {
    const result = renderDataURI(matrix, defaultOptions);
    expect(result).toMatch(/^data:image\/png;base64,/);
  });

  it('SVG data URI base64 decodes to valid SVG string', () => {
    const result = renderDataURI(matrix, defaultOptions, 'svg');
    const b64 = result.replace('data:image/svg+xml;base64,', '');
    const decoded = atob(b64);
    expect(decoded).toContain('<svg');
  });

  it('PNG data URI base64 decodes to bytes starting with PNG signature', () => {
    const result = renderDataURI(matrix, defaultOptions, 'png');
    const b64 = result.replace('data:image/png;base64,', '');
    const decoded = atob(b64);
    const bytes = Array.from(decoded, (ch) => ch.charCodeAt(0));
    // PNG signature: 137 80 78 71 13 10 26 10
    expect(bytes.slice(0, 8)).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  });

  it('BMP data URI base64 decodes to bytes starting with "BM"', () => {
    const result = renderDataURI(matrix, defaultOptions, 'bmp');
    const b64 = result.replace('data:image/bmp;base64,', '');
    const decoded = atob(b64);
    expect(decoded.charCodeAt(0)).toBe(66); // 'B'
    expect(decoded.charCodeAt(1)).toBe(77); // 'M'
  });
});
