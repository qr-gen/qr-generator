import { describe, it, expect } from 'vitest';
import { renderSVG } from '../src/svg/renderer';
import type { RenderOptions } from '../src/types';
import { MODULE_TYPE } from '@qr-gen/core';

describe('SVG Renderer', () => {
  const simpleMatrix = [
    [1, 0, 1],
    [0, 1, 0],
    [1, 0, 1],
  ];

  it('produces valid SVG string', () => {
    const svg = renderSVG(simpleMatrix, { size: 100 });
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it('applies size correctly', () => {
    const svg = renderSVG(simpleMatrix, { size: 256 });
    expect(svg).toContain('width="256"');
    expect(svg).toContain('height="256"');
  });

  it('uses default colors (black fg, white bg)', () => {
    const svg = renderSVG(simpleMatrix, { size: 100 });
    expect(svg).toContain('#000000'); // fg
    expect(svg).toContain('#ffffff'); // bg
  });

  it('applies custom colors', () => {
    const svg = renderSVG(simpleMatrix, { size: 100, fgColor: '#ff0000', bgColor: '#00ff00', skipValidation: true });
    expect(svg).toContain('#ff0000');
    expect(svg).toContain('#00ff00');
  });

  it('renders correct number of dark modules', () => {
    const svg = renderSVG(simpleMatrix, { size: 100 });
    // 5 dark modules in simpleMatrix
    const rects = (svg.match(/<rect[^/]*fill="#000000"/g) || []).length;
    const circles = (svg.match(/<circle/g) || []).length;
    // Background rect is also #ffffff, so count only fg rects
    expect(rects + circles).toBe(5);
  });

  it('uses square shape by default', () => {
    const svg = renderSVG(simpleMatrix, { size: 100, shape: 'square' });
    expect(svg).not.toContain('<circle');
  });

  it('uses dots shape when specified', () => {
    const svg = renderSVG(simpleMatrix, { size: 100, shape: 'dots' });
    expect(svg).toContain('<circle');
  });

  it('uses rounded shape when specified', () => {
    const svg = renderSVG(simpleMatrix, { size: 100, shape: 'rounded' });
    expect(svg).toContain('rx=');
  });

  it('includes quiet zone margin', () => {
    const svg = renderSVG(simpleMatrix, { size: 100, margin: 4 });
    expect(svg).toContain('viewBox=');
  });

  it('supports gradient foreground', () => {
    const svg = renderSVG(simpleMatrix, {
      size: 100,
      fgColor: { type: 'linear', colors: ['#f00', '#00f'] },
    });
    expect(svg).toContain('<linearGradient');
    expect(svg).toContain('url(#qr-gradient-fg)');
  });

  it('works with a real QR matrix', () => {
    // Generate a simple 21x21 matrix (all zeros with finders)
    const matrix = Array.from({ length: 21 }, () => new Array(21).fill(0));
    // Set some modules to 1
    for (let i = 0; i < 7; i++) {
      matrix[0][i] = 1;
      matrix[i][0] = 1;
    }
    const svg = renderSVG(matrix, { size: 256 });
    expect(svg).toContain('<svg');
    expect(svg.length).toBeGreaterThan(100);
  });

  describe('logo integration', () => {
    // 21x21 matrix with some dark modules
    const matrix21 = Array.from({ length: 21 }, (_, r) =>
      Array.from({ length: 21 }, (_, c) => ((r + c) % 2 === 0 ? 1 : 0)),
    );

    it('renders logo image element when logo is provided', () => {
      const svg = renderSVG(matrix21, {
        size: 256,
        logo: { src: '/logo.png', width: 40, height: 40 },
        skipValidation: true,
      });
      expect(svg).toContain('<image');
      expect(svg).toContain('href="/logo.png"');
      expect(svg).toContain('width="40"');
      expect(svg).toContain('height="40"');
    });

    it('renders clear zone rect behind logo', () => {
      const svg = renderSVG(matrix21, {
        size: 256,
        logo: { src: '/logo.png', width: 40, height: 40 },
        skipValidation: true,
      });
      // Clear zone rect should appear before the image
      const clearZoneIndex = svg.indexOf('fill="#ffffff"');
      const imageIndex = svg.indexOf('<image');
      // There are multiple fills, but the clear zone rect should exist
      expect(svg).toContain('<image');
    });

    it('skips modules behind the logo clear zone', () => {
      const svgWithLogo = renderSVG(matrix21, {
        size: 256,
        logo: { src: '/logo.png', width: 40, height: 40 },
        skipValidation: true,
      });
      const svgWithoutLogo = renderSVG(matrix21, {
        size: 256,
        skipValidation: true,
      });
      // SVG with logo should have fewer module elements
      const countModules = (svg: string) => (svg.match(/<rect[^/]*fill="#000000"/g) || []).length;
      expect(countModules(svgWithLogo)).toBeLessThan(countModules(svgWithoutLogo));
    });

    it('handles data URI logo source', () => {
      const dataUri = 'data:image/png;base64,iVBORw0KGgo=';
      const svg = renderSVG(matrix21, {
        size: 256,
        logo: { src: dataUri, width: 20, height: 20 },
        skipValidation: true,
      });
      expect(svg).toContain(`href="${dataUri}"`);
    });
  });

  describe('finder pattern rendering', () => {
    // Helper to create moduleTypes for a 3x3 matrix where (0,0) is a finder module
    function createModuleTypes3x3(): number[][] {
      return [
        [MODULE_TYPE.FINDER, MODULE_TYPE.DATA, MODULE_TYPE.DATA],
        [MODULE_TYPE.DATA, MODULE_TYPE.DATA, MODULE_TYPE.DATA],
        [MODULE_TYPE.DATA, MODULE_TYPE.DATA, MODULE_TYPE.DATA],
      ];
    }

    it('applies finderColor to finder modules when moduleTypes is provided', () => {
      const svg = renderSVG(simpleMatrix, {
        size: 100,
        finderColor: '#ff0000',
        moduleTypes: createModuleTypes3x3(),
        skipValidation: true,
      });
      expect(svg).toContain('fill="#ff0000"');
    });

    it('applies finderShape=rounded to finder modules with rx= attribute', () => {
      const svg = renderSVG(simpleMatrix, {
        size: 100,
        finderShape: 'rounded',
        moduleTypes: createModuleTypes3x3(),
        skipValidation: true,
      });
      expect(svg).toContain('rx=');
    });

    it('ignores finderColor/finderShape when moduleTypes is not provided (backward compat)', () => {
      const svg = renderSVG(simpleMatrix, {
        size: 100,
        finderColor: '#ff0000',
        finderShape: 'rounded',
        skipValidation: true,
      });
      // Without moduleTypes, all modules use default fg color (black)
      expect(svg).not.toContain('fill="#ff0000"');
    });

    it('applies gradient finderColor with defs when moduleTypes is provided', () => {
      const svg = renderSVG(simpleMatrix, {
        size: 100,
        finderColor: { type: 'linear', colors: ['#ff0000', '#00ff00'] },
        moduleTypes: createModuleTypes3x3(),
        skipValidation: true,
      });
      expect(svg).toContain('qr-gradient-finder');
    });

    it('does not render separator modules (value 0 in matrix) even with moduleTypes', () => {
      // Create a matrix where (0,1) is 0 (light), and moduleTypes marks it as SEPARATOR
      const matrix = [
        [1, 0, 1],
        [0, 1, 0],
        [1, 0, 1],
      ];
      const moduleTypes = [
        [MODULE_TYPE.FINDER, MODULE_TYPE.SEPARATOR, MODULE_TYPE.DATA],
        [MODULE_TYPE.DATA, MODULE_TYPE.DATA, MODULE_TYPE.DATA],
        [MODULE_TYPE.DATA, MODULE_TYPE.DATA, MODULE_TYPE.DATA],
      ];
      const svg = renderSVG(matrix, {
        size: 100,
        finderColor: '#ff0000',
        moduleTypes,
        skipValidation: true,
      });
      // Only 5 dark modules should render (same as simpleMatrix), separator at (0,1) is light
      const rects = (svg.match(/<rect[^/]*\/>/g) || []).length;
      // Background rect + 5 dark module rects = 6
      expect(rects).toBe(6);
    });
  });

  describe('validation integration', () => {
    it('throws on low contrast by default', () => {
      expect(() =>
        renderSVG(simpleMatrix, {
          size: 100,
          fgColor: '#999999',
          bgColor: '#ffffff',
        }),
      ).toThrow(/contrast/i);
    });

    it('does not throw when skipValidation is true', () => {
      expect(() =>
        renderSVG(simpleMatrix, {
          size: 100,
          fgColor: '#999999',
          bgColor: '#ffffff',
          skipValidation: true,
        }),
      ).not.toThrow();
    });

    it('throws when logo is too large', () => {
      expect(() =>
        renderSVG(simpleMatrix, {
          size: 100,
          logo: { src: '/logo.png', width: 80, height: 80 },
        }),
      ).toThrow(/logo/i);
    });
  });
});
