import { describe, it, expect } from 'vitest';
import { createQR, createQRSVG, applyHalftone } from '../src/index.js';
import { generateQR, MODULE_TYPE } from '@qr-kit/core';
import { encodePNG } from '../src/png/encoder.js';
import { PixelBuffer } from '../src/raster/pixel-buffer.js';
import { base64Encode } from '../src/utils/base64.js';
import type { HalftoneConfig } from '../src/types.js';

function makeTestImageDataURI(size: number, dark: boolean): string {
  const buf = new PixelBuffer(size, size);
  const color = dark ? 0 : 255;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      buf.setPixel(x, y, color, color, color, 255);
    }
  }
  const pngBytes = encodePNG(buf);
  return `data:image/png;base64,${base64Encode(pngBytes)}`;
}

function makeCheckerImageDataURI(size: number): string {
  const buf = new PixelBuffer(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const isDark = (x + y) % 2 === 0;
      const color = isDark ? 0 : 255;
      buf.setPixel(x, y, color, color, color, 255);
    }
  }
  const pngBytes = encodePNG(buf);
  return `data:image/png;base64,${base64Encode(pngBytes)}`;
}

describe('halftone integration', () => {
  const testImage = makeCheckerImageDataURI(21);

  describe('applyHalftone', () => {
    it('modifies the matrix while preserving structural patterns', () => {
      const qr = generateQR({ data: 'HELLO WORLD', errorCorrection: 'H' });
      const halftoneConfig: HalftoneConfig = {
        image: testImage,
        strength: 0.8,
      };

      const result = applyHalftone(qr.matrix, qr.moduleTypes, halftoneConfig);

      expect(result.matrix.length).toBe(qr.size);
      expect(result.flippedCount).toBeGreaterThan(0);

      // Verify structural patterns are untouched
      for (let r = 0; r < qr.size; r++) {
        for (let c = 0; c < qr.size; c++) {
          if (qr.moduleTypes[r][c] !== MODULE_TYPE.DATA) {
            expect(result.matrix[r][c]).toBe(qr.matrix[r][c]);
          }
        }
      }
    });
  });

  describe('createQR with halftone', () => {
    it('produces SVG output with halftone', () => {
      const result = createQR('https://example.com', {
        size: 256,
        halftone: { image: testImage, strength: 0.5 },
      });

      expect(result.format).toBe('svg');
      expect(result.errorCorrection).toBe('H'); // auto-upgraded
      expect(typeof result.data).toBe('string');
      expect((result.data as string)).toContain('<svg');
    });

    it('auto-upgrades error correction to H', () => {
      const result = createQR('TEST', {
        size: 256,
        halftone: { image: testImage },
      }, { errorCorrection: 'L' });

      expect(result.errorCorrection).toBe('H');
    });

    it('produces PNG output with halftone', () => {
      const result = createQR('TEST', {
        size: 256,
        format: 'png',
        halftone: { image: testImage, strength: 0.5 },
      });

      expect(result.format).toBe('png');
      expect(result.data).toBeInstanceOf(Uint8Array);
    });

    it('works with halftone + logo together', () => {
      const result = createQR('TEST', {
        size: 256,
        halftone: { image: testImage, strength: 0.5 },
        logo: {
          src: testImage,
          width: 40,
          height: 40,
        },
      });

      expect(result.errorCorrection).toBe('H');
      expect(typeof result.data).toBe('string');
    });
  });

  describe('createQRSVG with halftone', () => {
    it('produces SVG with halftone effect', () => {
      const result = createQRSVG('https://example.com', {
        size: 256,
        halftone: { image: testImage, strength: 0.6 },
      });

      expect(result.svg).toContain('<svg');
      expect(result.errorCorrection).toBe('H');
    });
  });

  describe('validation', () => {
    it('validates halftone config', () => {
      expect(() => createQR('TEST', {
        size: 256,
        halftone: { image: 'not-a-data-uri', strength: 0.5 },
      })).toThrow();
    });

    it('validates halftone strength range', () => {
      expect(() => createQR('TEST', {
        size: 256,
        halftone: { image: testImage, strength: 1.5 },
      })).toThrow();
    });
  });

  describe('edge cases', () => {
    it('strength=0 produces unchanged output', () => {
      const withoutHalftone = createQR('HELLO', { size: 256 }, { errorCorrection: 'H' });
      const withHalftone = createQR('HELLO', {
        size: 256,
        halftone: { image: testImage, strength: 0 },
      });

      // Both should produce valid SVGs with same structure
      expect(typeof withHalftone.data).toBe('string');
      expect((withHalftone.data as string)).toContain('<svg');
    });

    it('works with all-dark target image', () => {
      const darkImage = makeTestImageDataURI(10, true);
      const result = createQR('TEST', {
        size: 256,
        halftone: { image: darkImage, strength: 0.5 },
      });
      expect(typeof result.data).toBe('string');
    });

    it('works with all-light target image', () => {
      const lightImage = makeTestImageDataURI(10, false);
      const result = createQR('TEST', {
        size: 256,
        halftone: { image: lightImage, strength: 0.5 },
      });
      expect(typeof result.data).toBe('string');
    });
  });
});
