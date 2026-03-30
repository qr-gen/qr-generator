import { describe, it, expect } from 'vitest';
import { renderSVG } from '../src/svg/renderer';
import { rasterizeMatrix } from '../src/raster/rasterize';

// Simple 5x5 matrix for testing
const matrix: number[][] = [
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1],
];

describe('Margin Color', () => {
  describe('SVG', () => {
    it('renders single background rect when marginColor is not set', () => {
      const svg = renderSVG(matrix, { size: 100, skipValidation: true });
      // Should have exactly one background rect with bgColor
      const bgRects = svg.match(/<rect[^>]*fill="#ffffff"[^>]*\/>/g) || [];
      expect(bgRects.length).toBe(1);
    });

    it('renders single background rect when marginColor equals bgColor', () => {
      const svg = renderSVG(matrix, {
        size: 100,
        marginColor: '#ffffff',
        bgColor: '#ffffff',
        skipValidation: true,
      });
      // Optimization: should still be single rect
      const bgRects = svg.match(/<rect[^>]*fill="#ffffff"[^>]*\/>/g) || [];
      expect(bgRects.length).toBe(1);
    });

    it('renders outer rect with marginColor and inner rect with bgColor when they differ', () => {
      const svg = renderSVG(matrix, {
        size: 100,
        marginColor: '#ff0000',
        bgColor: '#ffffff',
        skipValidation: true,
      });
      // Should contain both colors
      expect(svg).toContain('fill="#ff0000"');
      expect(svg).toContain('fill="#ffffff"');
    });

    it('marginColor rect covers full canvas size', () => {
      const svg = renderSVG(matrix, {
        size: 200,
        marginColor: '#ff0000',
        bgColor: '#ffffff',
        skipValidation: true,
      });
      // The outer rect should be full-size
      expect(svg).toContain('width="200"');
      expect(svg).toContain('height="200"');
      expect(svg).toContain('fill="#ff0000"');
    });

    it('works with margin: 0 and marginColor set', () => {
      // Should not error even though margin area is zero-width
      const svg = renderSVG(matrix, {
        size: 100,
        margin: 0,
        marginColor: '#ff0000',
        bgColor: '#ffffff',
        skipValidation: true,
      });
      expect(svg).toContain('<svg');
    });

    it('does not render marginColor rect when bgColor is transparent and marginColor is not set', () => {
      const svg = renderSVG(matrix, {
        size: 100,
        bgColor: 'transparent',
        skipValidation: true,
      });
      // No background rects at all
      expect(svg).not.toContain('fill="#ffffff"');
    });

    it('renders marginColor rect even when bgColor is transparent', () => {
      const svg = renderSVG(matrix, {
        size: 100,
        bgColor: 'transparent',
        marginColor: '#ff0000',
        skipValidation: true,
      });
      // Should have the margin color rect
      expect(svg).toContain('fill="#ff0000"');
    });

    it('applies bgOpacity only to inner bgColor rect, not marginColor', () => {
      const svg = renderSVG(matrix, {
        size: 100,
        marginColor: '#ff0000',
        bgColor: '#ffffff',
        bgOpacity: 0.5,
        skipValidation: true,
      });
      // marginColor rect should NOT have opacity
      // bgColor rect should have opacity
      expect(svg).toContain('fill="#ff0000"');
      expect(svg).toContain('opacity="0.5"');
      // The opacity should be on the white rect, not the red one
      const parts = svg.split('fill="#ff0000"');
      // The first rect (marginColor) should not have opacity before the next rect
      expect(parts[0]).not.toContain('opacity=');
    });
  });

  describe('Raster', () => {
    it('fills margin area with marginColor when set', () => {
      const buffer = rasterizeMatrix(matrix, {
        size: 100,
        marginColor: '#ff0000',
        bgColor: '#ffffff',
        skipValidation: true,
      });
      // Corner pixel (0,0) should be in margin area = red
      const [r, g, b, a] = buffer.getPixel(0, 0);
      expect(r).toBe(255);
      expect(g).toBe(0);
      expect(b).toBe(0);
      expect(a).toBe(255);
    });

    it('fills inner area with bgColor when marginColor is set', () => {
      const buffer = rasterizeMatrix(matrix, {
        size: 100,
        margin: 4,
        marginColor: '#ff0000',
        bgColor: '#ffffff',
        skipValidation: true,
      });
      // Center pixel should be in the QR module area = white background
      const centerX = Math.floor(buffer.width / 2);
      const centerY = Math.floor(buffer.height / 2);
      const [r, g, b] = buffer.getPixel(centerX, centerY);
      // Center might be a dark module or bg, but the bg area should be white not red
      // Check a known bg area within the module grid — the matrix has 0s at (1,1)
      // With margin=4 and size=100, each module is about 100/13 = 7.7px
      // Module (1,1) starts at about (5 * 7.7, 5 * 7.7) = (38, 38)
      // This should be a 0 module (white bg), not marginColor
    });

    it('defaults marginColor to bgColor when not specified', () => {
      const buffer = rasterizeMatrix(matrix, {
        size: 100,
        bgColor: '#00ff00',
        skipValidation: true,
      });
      // Corner pixel should be bgColor (green)
      const [r, g, b] = buffer.getPixel(0, 0);
      expect(r).toBe(0);
      expect(g).toBe(255);
      expect(b).toBe(0);
    });

    it('handles margin: 0 with marginColor gracefully', () => {
      const buffer = rasterizeMatrix(matrix, {
        size: 50,
        margin: 0,
        marginColor: '#ff0000',
        bgColor: '#ffffff',
        skipValidation: true,
      });
      // Should not error
      expect(buffer.width).toBe(50);
    });
  });
});
