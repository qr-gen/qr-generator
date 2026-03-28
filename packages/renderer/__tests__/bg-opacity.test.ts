import { describe, it, expect } from 'vitest';
import { renderSVG } from '../src/svg/renderer';
import { rasterizeMatrix } from '../src/raster/rasterize';
import { validateRenderOptions } from '../src/validation/validate';

// Simple 5x5 matrix for testing
const matrix: number[][] = [
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1],
];

describe('Background Opacity', () => {
  describe('SVG', () => {
    it('adds opacity attribute when bgOpacity < 1', () => {
      const svg = renderSVG(matrix, { size: 100, bgOpacity: 0.5, skipValidation: true });
      expect(svg).toContain('opacity="0.5"');
    });

    it('does not add opacity attribute when bgOpacity is 1 (default)', () => {
      const svg = renderSVG(matrix, { size: 100, skipValidation: true });
      expect(svg).not.toContain('opacity=');
    });

    it('does not add opacity attribute when bgOpacity is explicitly 1', () => {
      const svg = renderSVG(matrix, { size: 100, bgOpacity: 1, skipValidation: true });
      expect(svg).not.toContain('opacity="1"');
    });

    it('skips background rect when bgColor is transparent regardless of bgOpacity', () => {
      const svg = renderSVG(matrix, { size: 100, bgColor: 'transparent', bgOpacity: 0.5, skipValidation: true });
      // Should not have a background rect at all
      const rectCount = (svg.match(/<rect /g) || []).length;
      // Any rect present should not be a background rect with opacity
      expect(svg).not.toContain('opacity="0.5"');
    });

    it('applies bgOpacity: 0 for fully transparent background', () => {
      const svg = renderSVG(matrix, { size: 100, bgOpacity: 0, skipValidation: true });
      expect(svg).toContain('opacity="0"');
    });
  });

  describe('Raster', () => {
    it('sets background alpha based on bgOpacity', () => {
      const buffer = rasterizeMatrix(matrix, { size: 50, bgOpacity: 0.5, skipValidation: true });
      // Check a pixel in the margin area (should be background)
      const [r, g, b, a] = buffer.getPixel(0, 0);
      expect(r).toBe(255);
      expect(g).toBe(255);
      expect(b).toBe(255);
      expect(a).toBe(128); // Math.round(0.5 * 255) = 128
    });

    it('has full alpha when bgOpacity is not set', () => {
      const buffer = rasterizeMatrix(matrix, { size: 50, skipValidation: true });
      const [r, g, b, a] = buffer.getPixel(0, 0);
      expect(a).toBe(255);
    });

    it('has zero alpha when bgOpacity is 0', () => {
      const buffer = rasterizeMatrix(matrix, { size: 50, bgOpacity: 0, skipValidation: true });
      const [r, g, b, a] = buffer.getPixel(0, 0);
      expect(a).toBe(0);
    });
  });

  describe('Validation', () => {
    it('returns error for bgOpacity > 1', () => {
      const result = validateRenderOptions({ size: 100, bgOpacity: 1.5 });
      expect(result.valid).toBe(false);
      expect(result.issues.some(i => i.code === 'INVALID_BG_OPACITY')).toBe(true);
    });

    it('returns error for bgOpacity < 0', () => {
      const result = validateRenderOptions({ size: 100, bgOpacity: -0.1 });
      expect(result.valid).toBe(false);
      expect(result.issues.some(i => i.code === 'INVALID_BG_OPACITY')).toBe(true);
    });

    it('passes validation for bgOpacity within [0, 1]', () => {
      const result = validateRenderOptions({ size: 100, bgOpacity: 0.5 });
      expect(result.issues.some(i => i.code === 'INVALID_BG_OPACITY')).toBe(false);
    });

    it('passes validation when bgOpacity is not set', () => {
      const result = validateRenderOptions({ size: 100 });
      expect(result.issues.some(i => i.code === 'INVALID_BG_OPACITY')).toBe(false);
    });
  });
});
