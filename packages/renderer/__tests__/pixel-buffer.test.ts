import { describe, it, expect } from 'vitest';
import { PixelBuffer } from '../src/raster/pixel-buffer.js';

describe('PixelBuffer', () => {
  describe('constructor', () => {
    it('creates buffer with correct width and height', () => {
      const buf = new PixelBuffer(10, 20);
      expect(buf.width).toBe(10);
      expect(buf.height).toBe(20);
    });

    it('creates buffer with size = width * height * 4', () => {
      const buf = new PixelBuffer(10, 20);
      expect(buf.data.length).toBe(10 * 20 * 4);
    });

    it('initializes buffer to all zeros (transparent black)', () => {
      const buf = new PixelBuffer(5, 5);
      for (let i = 0; i < buf.data.length; i++) {
        expect(buf.data[i]).toBe(0);
      }
    });
  });

  describe('setPixel', () => {
    it('writes RGBA at correct offset (y * width + x) * 4', () => {
      const buf = new PixelBuffer(10, 10);
      buf.setPixel(3, 5, 100, 150, 200, 255);

      const offset = (5 * 10 + 3) * 4;
      expect(buf.data[offset]).toBe(100);
      expect(buf.data[offset + 1]).toBe(150);
      expect(buf.data[offset + 2]).toBe(200);
      expect(buf.data[offset + 3]).toBe(255);
    });

    it('silently ignores out-of-bounds coordinates', () => {
      const buf = new PixelBuffer(10, 10);
      // Should not throw
      buf.setPixel(-1, 0, 255, 0, 0, 255);
      buf.setPixel(0, -1, 255, 0, 0, 255);
      buf.setPixel(10, 0, 255, 0, 0, 255);
      buf.setPixel(0, 10, 255, 0, 0, 255);
      buf.setPixel(100, 100, 255, 0, 0, 255);

      // Buffer should still be all zeros
      for (let i = 0; i < buf.data.length; i++) {
        expect(buf.data[i]).toBe(0);
      }
    });
  });

  describe('getPixel', () => {
    it('returns [r, g, b, a] for a set pixel', () => {
      const buf = new PixelBuffer(10, 10);
      buf.setPixel(2, 3, 10, 20, 30, 40);
      expect(buf.getPixel(2, 3)).toEqual([10, 20, 30, 40]);
    });

    it('returns [0, 0, 0, 0] for out-of-bounds coordinates', () => {
      const buf = new PixelBuffer(10, 10);
      expect(buf.getPixel(-1, 0)).toEqual([0, 0, 0, 0]);
      expect(buf.getPixel(0, -1)).toEqual([0, 0, 0, 0]);
      expect(buf.getPixel(10, 0)).toEqual([0, 0, 0, 0]);
      expect(buf.getPixel(0, 10)).toEqual([0, 0, 0, 0]);
      expect(buf.getPixel(100, 100)).toEqual([0, 0, 0, 0]);
    });
  });

  describe('fillRect', () => {
    it('fills a rectangular region with the given color', () => {
      const buf = new PixelBuffer(10, 10);
      buf.fillRect(2, 3, 4, 5, 255, 128, 64, 200);

      // Check pixels inside the rect
      for (let y = 3; y < 8; y++) {
        for (let x = 2; x < 6; x++) {
          expect(buf.getPixel(x, y)).toEqual([255, 128, 64, 200]);
        }
      }

      // Check a pixel outside the rect is still transparent
      expect(buf.getPixel(0, 0)).toEqual([0, 0, 0, 0]);
      expect(buf.getPixel(1, 3)).toEqual([0, 0, 0, 0]);
      expect(buf.getPixel(6, 3)).toEqual([0, 0, 0, 0]);
    });

    it('clips to buffer bounds', () => {
      const buf = new PixelBuffer(5, 5);
      // This rect extends beyond the buffer
      buf.fillRect(3, 3, 10, 10, 255, 0, 0, 255);

      // Pixels inside bounds should be filled
      expect(buf.getPixel(3, 3)).toEqual([255, 0, 0, 255]);
      expect(buf.getPixel(4, 4)).toEqual([255, 0, 0, 255]);

      // Pixels outside the rect start should not be filled
      expect(buf.getPixel(2, 2)).toEqual([0, 0, 0, 0]);
    });
  });

  describe('fillCircle', () => {
    it('fills a circle at the specified center and radius', () => {
      const buf = new PixelBuffer(20, 20);
      buf.fillCircle(10, 10, 5, 255, 0, 0, 255);

      // Center should be filled
      expect(buf.getPixel(10, 10)).toEqual([255, 0, 0, 255]);

      // Points on the cardinal directions at radius distance should be filled
      expect(buf.getPixel(10, 5)).toEqual([255, 0, 0, 255]); // top
      expect(buf.getPixel(10, 15)).toEqual([255, 0, 0, 255]); // bottom
      expect(buf.getPixel(5, 10)).toEqual([255, 0, 0, 255]); // left
      expect(buf.getPixel(15, 10)).toEqual([255, 0, 0, 255]); // right

      // Point well outside the circle should not be filled
      expect(buf.getPixel(0, 0)).toEqual([0, 0, 0, 0]);
      expect(buf.getPixel(19, 19)).toEqual([0, 0, 0, 0]);
    });

    it('handles circle partially out of bounds', () => {
      const buf = new PixelBuffer(10, 10);
      // Circle centered at corner, should not throw
      buf.fillCircle(0, 0, 5, 0, 255, 0, 255);

      // (0,0) should be filled (distance 0 from center)
      expect(buf.getPixel(0, 0)).toEqual([0, 255, 0, 255]);
      // (4,0) should be filled (distance 4 <= 5)
      expect(buf.getPixel(4, 0)).toEqual([0, 255, 0, 255]);
      // (0,4) should be filled
      expect(buf.getPixel(0, 4)).toEqual([0, 255, 0, 255]);
    });
  });

  describe('fillRoundedRect', () => {
    it('fills a rounded rectangle', () => {
      const buf = new PixelBuffer(30, 30);
      buf.fillRoundedRect(5, 5, 20, 20, 4, 0, 0, 255, 255);

      // Center should be filled
      expect(buf.getPixel(15, 15)).toEqual([0, 0, 255, 255]);

      // Edge midpoints should be filled
      expect(buf.getPixel(15, 5)).toEqual([0, 0, 255, 255]); // top edge center
      expect(buf.getPixel(15, 24)).toEqual([0, 0, 255, 255]); // bottom edge center
      expect(buf.getPixel(5, 15)).toEqual([0, 0, 255, 255]); // left edge center
      expect(buf.getPixel(24, 15)).toEqual([0, 0, 255, 255]); // right edge center

      // Outside should not be filled
      expect(buf.getPixel(0, 0)).toEqual([0, 0, 0, 0]);
    });

    it('corner pixels outside the radius curve should not be filled', () => {
      const buf = new PixelBuffer(30, 30);
      buf.fillRoundedRect(5, 5, 20, 20, 5, 255, 0, 0, 255);

      // The very corner pixel (5,5) is outside the rounded corner
      // because it's at distance sqrt(5^2 + 5^2) = ~7.07 from the corner center (10,10)
      // which is > radius 5
      expect(buf.getPixel(5, 5)).toEqual([0, 0, 0, 0]);
    });

    it('with radius 0 behaves like fillRect', () => {
      const buf1 = new PixelBuffer(20, 20);
      const buf2 = new PixelBuffer(20, 20);

      buf1.fillRect(3, 3, 10, 10, 128, 64, 32, 255);
      buf2.fillRoundedRect(3, 3, 10, 10, 0, 128, 64, 32, 255);

      expect(buf1.data).toEqual(buf2.data);
    });
  });

  describe('blendPixel', () => {
    it('blends a semi-transparent pixel over an opaque one', () => {
      const buf = new PixelBuffer(10, 10);
      // Set a fully opaque red pixel
      buf.setPixel(0, 0, 255, 0, 0, 255);
      // Blend a 50% transparent green pixel over it
      buf.blendPixel(0, 0, 0, 255, 0, 128);

      const [r, g, b, a] = buf.getPixel(0, 0);
      // Output alpha: srcA + dstA*(1-srcA) = 128 + 255*(1 - 128/255) = 128 + 127 = 255
      expect(a).toBe(255);
      // Output R: (0*128 + 255*255*(1-128/255)) / 255 = (0 + 255*127) / 255 ~ 127
      // Output G: (255*128 + 0*255*(1-128/255)) / 255 = (32640) / 255 ~ 128
      expect(r).toBeGreaterThanOrEqual(126);
      expect(r).toBeLessThanOrEqual(128);
      expect(g).toBeGreaterThanOrEqual(127);
      expect(g).toBeLessThanOrEqual(129);
      expect(b).toBe(0);
    });

    it('fully opaque blend replaces the pixel', () => {
      const buf = new PixelBuffer(10, 10);
      buf.setPixel(1, 1, 100, 100, 100, 255);
      buf.blendPixel(1, 1, 200, 50, 25, 255);

      expect(buf.getPixel(1, 1)).toEqual([200, 50, 25, 255]);
    });

    it('fully transparent blend leaves pixel unchanged', () => {
      const buf = new PixelBuffer(10, 10);
      buf.setPixel(2, 2, 100, 150, 200, 255);
      buf.blendPixel(2, 2, 0, 0, 0, 0);

      expect(buf.getPixel(2, 2)).toEqual([100, 150, 200, 255]);
    });

    it('blending onto transparent pixel just sets the pixel', () => {
      const buf = new PixelBuffer(10, 10);
      buf.blendPixel(3, 3, 50, 100, 150, 200);

      expect(buf.getPixel(3, 3)).toEqual([50, 100, 150, 200]);
    });

    it('silently ignores out-of-bounds coordinates', () => {
      const buf = new PixelBuffer(5, 5);
      buf.blendPixel(-1, 0, 255, 0, 0, 255);
      buf.blendPixel(5, 0, 255, 0, 0, 255);

      // Buffer should be unchanged
      for (let i = 0; i < buf.data.length; i++) {
        expect(buf.data[i]).toBe(0);
      }
    });
  });
});
