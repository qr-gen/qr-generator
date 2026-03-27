import { describe, it, expect } from 'vitest';
import { getGradientColor } from '../src/raster/gradient.js';
import { GradientConfig } from '../src/types.js';

describe('getGradientColor', () => {
  describe('linear gradient 0° (top to bottom)', () => {
    const config: GradientConfig = {
      type: 'linear',
      colors: ['#000000', '#ffffff'],
      angle: 0,
    };
    const size = 100;

    it('first pixel row gets color1 (black)', () => {
      const [r, g, b, a] = getGradientColor(50, 0, size, size, config);
      expect(r).toBe(0);
      expect(g).toBe(0);
      expect(b).toBe(0);
      expect(a).toBe(255);
    });

    it('last pixel row gets color2 (white)', () => {
      const [r, g, b, a] = getGradientColor(50, 99, size, size, config);
      expect(r).toBeGreaterThanOrEqual(252);
      expect(g).toBeGreaterThanOrEqual(252);
      expect(b).toBeGreaterThanOrEqual(252);
      expect(a).toBe(255);
    });

    it('middle row gets interpolated (mid-gray)', () => {
      const [r, g, b, a] = getGradientColor(50, 50, size, size, config);
      // ~128 (half-way between 0 and 255)
      expect(r).toBeGreaterThanOrEqual(123);
      expect(r).toBeLessThanOrEqual(133);
      expect(g).toBeGreaterThanOrEqual(123);
      expect(g).toBeLessThanOrEqual(133);
      expect(b).toBeGreaterThanOrEqual(123);
      expect(b).toBeLessThanOrEqual(133);
      expect(a).toBe(255);
    });
  });

  describe('linear gradient 90° (left to right)', () => {
    const config: GradientConfig = {
      type: 'linear',
      colors: ['#ff0000', '#0000ff'],
      angle: 90,
    };
    const size = 100;

    it('left column gets color1 (red)', () => {
      const [r, g, b, a] = getGradientColor(0, 50, size, size, config);
      expect(r).toBe(255);
      expect(g).toBe(0);
      expect(b).toBe(0);
      expect(a).toBe(255);
    });

    it('right column gets color2 (blue)', () => {
      const [r, g, b, a] = getGradientColor(99, 50, size, size, config);
      expect(r).toBeLessThanOrEqual(3);
      expect(g).toBe(0);
      expect(b).toBeGreaterThanOrEqual(252);
      expect(a).toBe(255);
    });
  });

  describe('linear gradient with 45° angle', () => {
    const config: GradientConfig = {
      type: 'linear',
      colors: ['#000000', '#ffffff'],
      angle: 45,
    };
    const size = 100;

    it('top-left corner gets color near start (dark)', () => {
      const [r] = getGradientColor(0, 0, size, size, config);
      expect(r).toBeLessThanOrEqual(5);
    });

    it('bottom-right corner gets color near end (light)', () => {
      const [r] = getGradientColor(99, 99, size, size, config);
      expect(r).toBeGreaterThanOrEqual(250);
    });

    it('center gets mid-range color', () => {
      const [r] = getGradientColor(50, 50, size, size, config);
      expect(r).toBeGreaterThanOrEqual(120);
      expect(r).toBeLessThanOrEqual(136);
    });

    it('top-right and bottom-left corners are similar (perpendicular to gradient axis)', () => {
      const [rTR] = getGradientColor(99, 0, size, size, config);
      const [rBL] = getGradientColor(0, 99, size, size, config);
      expect(Math.abs(rTR - rBL)).toBeLessThanOrEqual(5);
    });
  });

  describe('radial gradient', () => {
    const config: GradientConfig = {
      type: 'radial',
      colors: ['#ff0000', '#0000ff'],
    };
    const size = 100;

    it('center pixel gets color1 (red)', () => {
      // Use odd size so center pixel is exactly at the center point
      const oddSize = 101;
      const cx = Math.floor(oddSize / 2); // 50
      const cy = Math.floor(oddSize / 2); // 50
      const [r, g, b, a] = getGradientColor(cx, cy, oddSize, oddSize, config);
      expect(r).toBe(255);
      expect(g).toBe(0);
      expect(b).toBe(0);
      expect(a).toBe(255);
    });

    it('corner pixels get color2 (blue)', () => {
      const [r, g, b, a] = getGradientColor(0, 0, size, size, config);
      expect(r).toBeLessThanOrEqual(5);
      expect(g).toBe(0);
      expect(b).toBeGreaterThanOrEqual(250);
      expect(a).toBe(255);
    });
  });

  describe('multi-stop gradient (3 colors)', () => {
    const config: GradientConfig = {
      type: 'linear',
      colors: ['#ff0000', '#00ff00', '#0000ff'],
      angle: 0,
    };
    const size = 100;

    it('start (0%) gets first color (red)', () => {
      const [r, g, b] = getGradientColor(50, 0, size, size, config);
      expect(r).toBe(255);
      expect(g).toBe(0);
      expect(b).toBe(0);
    });

    it('middle (50%) gets second color (green)', () => {
      const [r, g, b] = getGradientColor(50, 50, size, size, config);
      // At 50% we should be very close to the middle stop (#00ff00)
      expect(r).toBeLessThanOrEqual(5);
      expect(g).toBeGreaterThanOrEqual(250);
      expect(b).toBeLessThanOrEqual(5);
    });

    it('end (100%) gets third color (blue)', () => {
      const [r, g, b] = getGradientColor(50, 99, size, size, config);
      expect(r).toBeLessThanOrEqual(5);
      expect(g).toBeLessThanOrEqual(5);
      expect(b).toBeGreaterThanOrEqual(250);
    });
  });

  describe('return type', () => {
    it('returns RGBA tuple with a=255', () => {
      const config: GradientConfig = {
        type: 'linear',
        colors: ['#123456', '#abcdef'],
        angle: 0,
      };
      const result = getGradientColor(0, 0, 10, 10, config);
      expect(result).toHaveLength(4);
      expect(result[3]).toBe(255);
      // All values should be integers in 0-255 range
      for (const val of result) {
        expect(Number.isInteger(val)).toBe(true);
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(255);
      }
    });
  });
});
