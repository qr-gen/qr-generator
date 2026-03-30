import { describe, it, expect } from 'vitest';
import { calculatePixelDimensions, calculateSvgDimensions } from '../src/utils/dpi';
import { renderSVG } from '../src/svg/renderer';
import { rasterizeMatrix } from '../src/raster/rasterize';
import { generateQR } from '@qr-kit/core';

const qr = generateQR({ data: 'TEST' });
const { matrix, moduleTypes } = qr;

describe('DPI utilities', () => {
  describe('calculatePixelDimensions', () => {
    it('returns base dimensions when no dpi or physicalSize', () => {
      const result = calculatePixelDimensions(256, {});
      expect(result).toEqual({ width: 256, height: 256 });
    });

    it('scales by dpi/72 when dpi is set', () => {
      const result = calculatePixelDimensions(256, { dpi: 300 });
      // 256 * (300/72) = 1066.67 -> ceil = 1067
      expect(result.width).toBe(1067);
      expect(result.height).toBe(1067);
    });

    it('treats dpi: 72 as no-op', () => {
      const result = calculatePixelDimensions(256, { dpi: 72 });
      expect(result).toEqual({ width: 256, height: 256 });
    });

    it('calculates from physicalSize in mm', () => {
      // 25mm at 300dpi -> ceil(25/25.4*300) = ceil(295.27) = 296
      const result = calculatePixelDimensions(256, {
        dpi: 300,
        physicalSize: { width: 25, height: 25, unit: 'mm' },
      });
      expect(result.width).toBe(296);
      expect(result.height).toBe(296);
    });

    it('calculates from physicalSize in inches', () => {
      // 1in at 300dpi -> 300
      const result = calculatePixelDimensions(256, {
        dpi: 300,
        physicalSize: { width: 1, height: 1, unit: 'in' },
      });
      expect(result.width).toBe(300);
      expect(result.height).toBe(300);
    });

    it('uses dpi with physicalSize when both provided', () => {
      // 25mm at 600dpi -> ceil(25/25.4*600) = ceil(590.55) = 591
      const result = calculatePixelDimensions(256, {
        dpi: 600,
        physicalSize: { width: 25, height: 25, unit: 'mm' },
      });
      expect(result.width).toBe(591);
    });

    it('defaults dpi to 150 when physicalSize given without dpi', () => {
      // 25mm at 150dpi -> ceil(25/25.4*150) = ceil(147.64) = 148
      const result = calculatePixelDimensions(256, {
        physicalSize: { width: 25, height: 25, unit: 'mm' },
      });
      expect(result.width).toBe(148);
    });

    it('throws on dpi <= 0', () => {
      expect(() => calculatePixelDimensions(256, { dpi: 0 })).toThrow();
      expect(() => calculatePixelDimensions(256, { dpi: -1 })).toThrow();
    });

    it('throws on physicalSize with zero dimensions', () => {
      expect(() => calculatePixelDimensions(256, {
        physicalSize: { width: 0, height: 0, unit: 'mm' },
      })).toThrow();
    });

    it('throws on non-square physicalSize', () => {
      expect(() => calculatePixelDimensions(256, {
        physicalSize: { width: 25, height: 30, unit: 'mm' },
      })).toThrow('square');
    });

    it('throws when calculated dimensions exceed max', () => {
      expect(() => calculatePixelDimensions(256, {
        dpi: 1200,
        physicalSize: { width: 500, height: 500, unit: 'mm' },
      })).toThrow('exceeds maximum');
    });
  });

  describe('calculateSvgDimensions', () => {
    it('returns unitless dimensions when no physicalSize', () => {
      const result = calculateSvgDimensions(300, {});
      expect(result).toEqual({ width: '300', height: '300' });
    });

    it('returns mm dimensions when physicalSize unit is mm', () => {
      const result = calculateSvgDimensions(300, {
        physicalSize: { width: 25, height: 25, unit: 'mm' },
      });
      expect(result).toEqual({ width: '25mm', height: '25mm' });
    });

    it('returns in dimensions when physicalSize unit is in', () => {
      const result = calculateSvgDimensions(300, {
        physicalSize: { width: 2, height: 2, unit: 'in' },
      });
      expect(result).toEqual({ width: '2in', height: '2in' });
    });

    it('ignores dpi when no physicalSize (SVG is vector)', () => {
      const result = calculateSvgDimensions(300, { dpi: 300 });
      expect(result).toEqual({ width: '300', height: '300' });
    });
  });

  describe('SVG integration', () => {
    it('adds physical units to SVG width/height when physicalSize set', () => {
      const svg = renderSVG(matrix, {
        size: 300,
        physicalSize: { width: 25, height: 25, unit: 'mm' },
        moduleTypes,
        skipValidation: true,
      });
      expect(svg).toContain('width="25mm"');
      expect(svg).toContain('height="25mm"');
    });

    it('preserves viewBox when physicalSize set', () => {
      const svg = renderSVG(matrix, {
        size: 300,
        physicalSize: { width: 25, height: 25, unit: 'mm' },
        moduleTypes,
        skipValidation: true,
      });
      expect(svg).toContain('viewBox="0 0');
    });

    it('does not change SVG when only dpi is set (SVG is vector)', () => {
      const svgDefault = renderSVG(matrix, { size: 300, moduleTypes, skipValidation: true });
      const svgDpi = renderSVG(matrix, { size: 300, dpi: 300, moduleTypes, skipValidation: true });
      expect(svgDefault).toBe(svgDpi);
    });
  });

  describe('Raster integration', () => {
    it('produces larger pixel buffer at higher dpi', () => {
      const bufferDefault = rasterizeMatrix(matrix, { size: 100, moduleTypes, skipValidation: true });
      const bufferDpi = rasterizeMatrix(matrix, { size: 100, dpi: 300, moduleTypes, skipValidation: true });
      expect(bufferDpi.width).toBeGreaterThan(bufferDefault.width);
      expect(bufferDpi.height).toBeGreaterThan(bufferDefault.height);
    });

    it('produces correct pixel count for physicalSize', () => {
      // 25mm at 300dpi -> 296px
      const buffer = rasterizeMatrix(matrix, {
        size: 100, // ignored when physicalSize is set
        dpi: 300,
        physicalSize: { width: 25, height: 25, unit: 'mm' },
        moduleTypes,
        skipValidation: true,
      });
      expect(buffer.width).toBe(296);
      expect(buffer.height).toBe(296);
    });

    it('produces same buffer at dpi: 72 as default', () => {
      const bufferDefault = rasterizeMatrix(matrix, { size: 100, moduleTypes, skipValidation: true });
      const buffer72 = rasterizeMatrix(matrix, { size: 100, dpi: 72, moduleTypes, skipValidation: true });
      expect(buffer72.width).toBe(bufferDefault.width);
      expect(buffer72.height).toBe(bufferDefault.height);
    });
  });
});
