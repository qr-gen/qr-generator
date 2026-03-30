import { describe, it, expect } from 'vitest';
import { renderSVG } from '../src/svg/renderer';
import { rasterizeMatrix } from '../src/raster/rasterize';
import { generateQR, MODULE_TYPE } from '@qr-kit/core';

// Generate a larger QR to get timing patterns (all versions) and alignment patterns (v2+)
// Need enough data to force version 2+ which has alignment patterns
const qrV2 = generateQR({ data: 'HELLO WORLD THIS IS A LONGER STRING FOR QR' });
// Use a shorter string for a simpler v1 QR
const qrV1 = generateQR({ data: 'TEST' });

describe('Alignment and Timing Colors', () => {
  describe('SVG - timing color', () => {
    it('renders timing modules with timingColor when set', () => {
      const svg = renderSVG(qrV1.matrix, {
        size: 300,
        timingColor: '#0000ff',
        moduleTypes: qrV1.moduleTypes,
        skipValidation: true,
      });
      expect(svg).toContain('fill="#0000ff"');
    });

    it('uses fgColor for timing modules when timingColor not set', () => {
      const svg = renderSVG(qrV1.matrix, {
        size: 300,
        fgColor: '#333333',
        moduleTypes: qrV1.moduleTypes,
        skipValidation: true,
      });
      // All modules (including timing) should use fgColor
      // No separate color for timing
      expect(svg).toContain('fill="#333333"');
    });

    it('supports gradient for timingColor', () => {
      const svg = renderSVG(qrV1.matrix, {
        size: 300,
        timingColor: {
          type: 'linear',
          colors: ['#ff0000', '#0000ff'],
        },
        moduleTypes: qrV1.moduleTypes,
        skipValidation: true,
      });
      // Should have a gradient definition for timing
      expect(svg).toContain('qr-gradient-timing');
    });
  });

  describe('SVG - alignment color', () => {
    it('renders alignment modules with alignmentColor when set (version 2+)', () => {
      const svg = renderSVG(qrV2.matrix, {
        size: 300,
        alignmentColor: '#00ff00',
        moduleTypes: qrV2.moduleTypes,
        skipValidation: true,
      });
      // Should contain the alignment color
      expect(svg).toContain('fill="#00ff00"');
    });

    it('version 1 QR accepts alignmentColor without error', () => {
      const svg = renderSVG(qrV1.matrix, {
        size: 300,
        alignmentColor: '#00ff00',
        moduleTypes: qrV1.moduleTypes,
        skipValidation: true,
      });
      // v1 has no alignment patterns, so #00ff00 won't appear
      // But it should not error
      expect(svg).toContain('<svg');
    });

    it('supports gradient for alignmentColor', () => {
      const svg = renderSVG(qrV2.matrix, {
        size: 300,
        alignmentColor: {
          type: 'radial',
          colors: ['#ff0000', '#00ff00'],
        },
        moduleTypes: qrV2.moduleTypes,
        skipValidation: true,
      });
      expect(svg).toContain('qr-gradient-alignment');
    });
  });

  describe('SVG - combined with finder colors', () => {
    it('each module type uses its specific color', () => {
      const svg = renderSVG(qrV2.matrix, {
        size: 300,
        fgColor: '#000000',
        finderColor: '#ff0000',
        alignmentColor: '#00ff00',
        timingColor: '#0000ff',
        moduleTypes: qrV2.moduleTypes,
        skipValidation: true,
      });
      // All three colors should be present
      expect(svg).toContain('fill="#ff0000"'); // finder
      expect(svg).toContain('fill="#00ff00"'); // alignment
      expect(svg).toContain('fill="#0000ff"'); // timing
      expect(svg).toContain('fill="#000000"'); // data modules
    });
  });

  describe('Raster - timing color', () => {
    it('renders timing modules in timingColor', () => {
      const buffer = rasterizeMatrix(qrV1.matrix, {
        size: 300,
        timingColor: '#0000ff',
        fgColor: '#000000',
        moduleTypes: qrV1.moduleTypes,
        skipValidation: true,
      });
      // Timing patterns are at row 6 and col 6 (between finder patterns)
      // We need to find a timing module position
      const margin = 4;
      const matrixSize = qrV1.matrix.length;
      const moduleSize = 300 / (matrixSize + margin * 2);

      // Find a timing module in row 6 (horizontal timing pattern)
      let timingCol = -1;
      for (let c = 8; c < matrixSize - 8; c++) {
        if (qrV1.moduleTypes[6][c] === MODULE_TYPE.TIMING && qrV1.matrix[6][c] === 1) {
          timingCol = c;
          break;
        }
      }

      if (timingCol >= 0) {
        const px = Math.floor((timingCol + margin) * moduleSize + moduleSize / 2);
        const py = Math.floor((6 + margin) * moduleSize + moduleSize / 2);
        const [r, g, b] = buffer.getPixel(px, py);
        // Should be blue (timing color)
        expect(r).toBe(0);
        expect(g).toBe(0);
        expect(b).toBe(255);
      }
    });
  });

  describe('Raster - alignment color', () => {
    it('renders alignment modules in alignmentColor', () => {
      const buffer = rasterizeMatrix(qrV2.matrix, {
        size: 300,
        alignmentColor: '#00ff00',
        fgColor: '#000000',
        moduleTypes: qrV2.moduleTypes,
        skipValidation: true,
      });
      const margin = 4;
      const matrixSize = qrV2.matrix.length;
      const moduleSize = 300 / (matrixSize + margin * 2);

      // Find an alignment module
      let alignRow = -1, alignCol = -1;
      for (let r = 0; r < matrixSize && alignRow < 0; r++) {
        for (let c = 0; c < matrixSize; c++) {
          if (qrV2.moduleTypes[r][c] === MODULE_TYPE.ALIGNMENT && qrV2.matrix[r][c] === 1) {
            alignRow = r;
            alignCol = c;
            break;
          }
        }
      }

      if (alignRow >= 0 && alignCol >= 0) {
        const px = Math.floor((alignCol + margin) * moduleSize + moduleSize / 2);
        const py = Math.floor((alignRow + margin) * moduleSize + moduleSize / 2);
        const [r, g, b] = buffer.getPixel(px, py);
        // Should be green (alignment color)
        expect(r).toBe(0);
        expect(g).toBe(255);
        expect(b).toBe(0);
      }
    });
  });

  describe('backward compatibility', () => {
    it('does not change output when no alignment/timing colors set', () => {
      const svgBefore = renderSVG(qrV2.matrix, {
        size: 300,
        fgColor: '#000000',
        moduleTypes: qrV2.moduleTypes,
        skipValidation: true,
      });
      // Verify no unexpected colors appear
      expect(svgBefore).not.toContain('fill="#00ff00"');
      expect(svgBefore).not.toContain('fill="#0000ff"');
    });
  });
});
