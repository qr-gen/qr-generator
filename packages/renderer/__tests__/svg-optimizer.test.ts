import { describe, it, expect } from 'vitest';
import { mergeModules, type MergedRect } from '../src/svg/optimizer';
import { renderSVG } from '../src/svg/renderer';
import { generateQR } from '@qr-kit/core';

describe('SVG optimizer - mergeModules', () => {
  it('merges a full row of same-color modules into one rect', () => {
    const matrix = [
      [1, 1, 1, 1, 1],
    ];
    const result = mergeModules(matrix, undefined, 0, 10);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ x: 0, y: 0, width: 50, height: 10, fill: 'default' });
  });

  it('merges a rectangular block of same-color modules', () => {
    const matrix = [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ];
    const result = mergeModules(matrix, undefined, 0, 10);
    expect(result).toHaveLength(1);
    expect(result[0].width).toBe(30);
    expect(result[0].height).toBe(30);
  });

  it('does not merge across empty (false/0) modules', () => {
    const matrix = [
      [1, 0, 1],
    ];
    const result = mergeModules(matrix, undefined, 0, 10);
    expect(result).toHaveLength(2);
  });

  it('handles checkerboard pattern as individual rects', () => {
    const matrix = [
      [1, 0, 1],
      [0, 1, 0],
      [1, 0, 1],
    ];
    const result = mergeModules(matrix, undefined, 0, 10);
    expect(result).toHaveLength(5); // 5 individual dark modules
  });

  it('handles empty matrix', () => {
    const matrix = [
      [0, 0, 0],
      [0, 0, 0],
    ];
    const result = mergeModules(matrix, undefined, 0, 10);
    expect(result).toHaveLength(0);
  });

  it('handles single module', () => {
    const matrix = [[1]];
    const result = mergeModules(matrix, undefined, 0, 10);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ x: 0, y: 0, width: 10, height: 10, fill: 'default' });
  });

  it('merges vertical strips correctly', () => {
    const matrix = [
      [1, 0],
      [1, 0],
      [1, 0],
    ];
    const result = mergeModules(matrix, undefined, 0, 10);
    expect(result).toHaveLength(1);
    expect(result[0].width).toBe(10);
    expect(result[0].height).toBe(30);
  });

  it('handles L-shape as 2 rects', () => {
    const matrix = [
      [1, 1, 1],
      [1, 0, 0],
      [1, 0, 0],
    ];
    const result = mergeModules(matrix, undefined, 0, 10);
    // Should be 2 rects: top row (3-wide) + left column remaining (1-wide, 2-tall)
    expect(result).toHaveLength(2);
  });

  it('applies margin offset to coordinates', () => {
    const matrix = [[1]];
    const result = mergeModules(matrix, undefined, 4, 10);
    // With margin=4, module at (0,0) should start at (40, 40)
    expect(result[0].x).toBe(40);
    expect(result[0].y).toBe(40);
  });

  it('does not merge across color boundaries when moduleTypes differ', () => {
    const matrix = [
      [1, 1, 1],
    ];
    // moduleTypes: first two are TIMING (2), last is DATA (0)
    const moduleTypes = [
      [2, 2, 0],
    ];
    const colorMap: Record<number, string> = { 2: 'timing-color', 0: 'default' };
    const result = mergeModules(matrix, moduleTypes, 0, 10, colorMap);
    expect(result).toHaveLength(2);
    expect(result[0].fill).toBe('timing-color');
    expect(result[1].fill).toBe('default');
  });
});

describe('SVG optimizer integration', () => {
  const qr = generateQR({ data: 'HELLO WORLD' });
  const { matrix, moduleTypes } = qr;

  it('produces fewer SVG elements when optimizeSvg is true', () => {
    const svgDefault = renderSVG(matrix, {
      size: 300,
      shape: 'square',
      moduleTypes,
      skipValidation: true,
    });
    const svgOptimized = renderSVG(matrix, {
      size: 300,
      shape: 'square',
      moduleTypes,
      optimizeSvg: true,
      skipValidation: true,
    });
    const defaultRects = (svgDefault.match(/<rect /g) || []).length;
    const optimizedPaths = (svgOptimized.match(/<path /g) || []).length;
    const optimizedRects = (svgOptimized.match(/<rect /g) || []).length;
    // Optimized should use path elements instead of rects for modules
    // The background rect remains, but module count should drop
    expect(optimizedPaths + optimizedRects).toBeLessThan(defaultRects);
  });

  it('does not optimize when optimizeSvg is false (default)', () => {
    const svgDefault = renderSVG(matrix, {
      size: 300,
      shape: 'square',
      moduleTypes,
      skipValidation: true,
    });
    const svgExplicitFalse = renderSVG(matrix, {
      size: 300,
      shape: 'square',
      moduleTypes,
      optimizeSvg: false,
      skipValidation: true,
    });
    expect(svgDefault).toBe(svgExplicitFalse);
  });

  it('does not optimize when shape is not square', () => {
    const svgDots = renderSVG(matrix, {
      size: 300,
      shape: 'dots',
      moduleTypes,
      optimizeSvg: true,
      skipValidation: true,
    });
    // Should have circles, not paths
    expect(svgDots).toContain('<circle');
    expect(svgDots).not.toContain('<path');
  });

  it('reduces element count by at least 30% for typical QR code', () => {
    const svgDefault = renderSVG(matrix, {
      size: 300,
      shape: 'square',
      moduleTypes,
      skipValidation: true,
    });
    const svgOptimized = renderSVG(matrix, {
      size: 300,
      shape: 'square',
      moduleTypes,
      optimizeSvg: true,
      skipValidation: true,
    });
    // Count visual elements (rects + paths, excluding background)
    const defaultCount = (svgDefault.match(/<rect /g) || []).length - 1; // -1 for bg
    const optimizedCount = (svgOptimized.match(/<path /g) || []).length +
                           (svgOptimized.match(/<rect /g) || []).length - 1; // -1 for bg
    expect(optimizedCount).toBeLessThan(defaultCount * 0.7);
  });

  it('works combined with finderColor', () => {
    const svg = renderSVG(matrix, {
      size: 300,
      shape: 'square',
      finderColor: '#ff0000',
      moduleTypes,
      optimizeSvg: true,
      skipValidation: true,
    });
    expect(svg).toContain('#ff0000');
    expect(svg).toContain('<path');
  });
});
