import { describe, it, expect } from 'vitest';
import { renderSVG } from '../src/svg/renderer';
import { rasterizeMatrix } from '../src/raster/rasterize';

const matrix: number[][] = [
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1],
];

describe('Rounded Outer Border', () => {
  describe('SVG', () => {
    it('adds rx/ry to background rect when borderRadius > 0', () => {
      const svg = renderSVG(matrix, { size: 100, borderRadius: 10, skipValidation: true });
      expect(svg).toContain('rx="10"');
      expect(svg).toContain('ry="10"');
    });

    it('adds clipPath when borderRadius > 0', () => {
      const svg = renderSVG(matrix, { size: 100, borderRadius: 10, skipValidation: true });
      expect(svg).toContain('<clipPath');
      expect(svg).toContain('clip-path=');
    });

    it('does not add clipPath when borderRadius is 0', () => {
      const svg = renderSVG(matrix, { size: 100, borderRadius: 0, skipValidation: true });
      expect(svg).not.toContain('<clipPath');
    });

    it('does not add clipPath when borderRadius is not set', () => {
      const svg = renderSVG(matrix, { size: 100, skipValidation: true });
      expect(svg).not.toContain('<clipPath');
      expect(svg).not.toContain('rx=');
    });

    it('combines with bgOpacity correctly', () => {
      const svg = renderSVG(matrix, { size: 100, borderRadius: 10, bgOpacity: 0.5, skipValidation: true });
      expect(svg).toContain('rx="10"');
      expect(svg).toContain('opacity="0.5"');
    });
  });

  describe('Raster', () => {
    it('corner pixels are transparent when borderRadius is applied', () => {
      const buffer = rasterizeMatrix(matrix, { size: 100, borderRadius: 20, skipValidation: true });
      // Top-left corner (0,0) should be transparent
      const [, , , a] = buffer.getPixel(0, 0);
      expect(a).toBe(0);
    });

    it('center pixels are opaque when borderRadius is applied', () => {
      const buffer = rasterizeMatrix(matrix, { size: 100, borderRadius: 20, skipValidation: true });
      // Center pixel should be opaque
      const [, , , a] = buffer.getPixel(50, 50);
      expect(a).toBeGreaterThan(0);
    });

    it('no masking when borderRadius is not set', () => {
      const buffer = rasterizeMatrix(matrix, { size: 100, skipValidation: true });
      // Corner should be opaque (white background)
      const [, , , a] = buffer.getPixel(0, 0);
      expect(a).toBe(255);
    });
  });
});
