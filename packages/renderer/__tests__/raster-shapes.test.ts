import { describe, it, expect } from 'vitest';
import { PixelBuffer } from '../src/raster/pixel-buffer.js';
import { renderRasterModule } from '../src/raster/shapes.js';

describe('renderRasterModule', () => {
  it('square shape fills exact rectangle', () => {
    const buf = new PixelBuffer(20, 20);
    renderRasterModule(buf, 2, 3, 10, 'square', 0, 0, 0, 255);

    // Every pixel inside the 10x10 rect starting at (2,3) should be filled
    for (let y = 3; y < 13; y++) {
      for (let x = 2; x < 12; x++) {
        expect(buf.getPixel(x, y)).toEqual([0, 0, 0, 255]);
      }
    }

    // Pixels just outside should remain empty
    expect(buf.getPixel(1, 3)).toEqual([0, 0, 0, 0]);
    expect(buf.getPixel(12, 3)).toEqual([0, 0, 0, 0]);
    expect(buf.getPixel(2, 2)).toEqual([0, 0, 0, 0]);
    expect(buf.getPixel(2, 13)).toEqual([0, 0, 0, 0]);
  });

  it('rounded shape fills with rounded corners (corner pixels differ from center)', () => {
    const size = 20;
    const buf = new PixelBuffer(30, 30);
    renderRasterModule(buf, 5, 5, size, 'rounded', 0, 0, 0, 255);

    // Center should be filled
    const cx = 5 + Math.floor(size / 2);
    const cy = 5 + Math.floor(size / 2);
    expect(buf.getPixel(cx, cy)).toEqual([0, 0, 0, 255]);

    // Edge midpoints should be filled
    expect(buf.getPixel(cx, 5)).toEqual([0, 0, 0, 255]); // top center
    expect(buf.getPixel(cx, 5 + size - 1)).toEqual([0, 0, 0, 255]); // bottom center

    // The very corner pixel (5,5) should NOT be filled due to rounding
    // cornerRadius = size * 0.3 = 6, so corners are cut
    expect(buf.getPixel(5, 5)).toEqual([0, 0, 0, 0]);
  });

  it('dots shape fills circle (corners empty, center filled)', () => {
    const size = 20;
    const buf = new PixelBuffer(30, 30);
    renderRasterModule(buf, 5, 5, size, 'dots', 0, 0, 0, 255);

    // Center should be filled
    const cx = 5 + size / 2;
    const cy = 5 + size / 2;
    expect(buf.getPixel(Math.floor(cx), Math.floor(cy))).toEqual([0, 0, 0, 255]);

    // All four corner pixels of the bounding box should be empty
    expect(buf.getPixel(5, 5)).toEqual([0, 0, 0, 0]);
    expect(buf.getPixel(5 + size - 1, 5)).toEqual([0, 0, 0, 0]);
    expect(buf.getPixel(5, 5 + size - 1)).toEqual([0, 0, 0, 0]);
    expect(buf.getPixel(5 + size - 1, 5 + size - 1)).toEqual([0, 0, 0, 0]);
  });

  it('color is applied correctly', () => {
    const buf = new PixelBuffer(20, 20);
    renderRasterModule(buf, 0, 0, 10, 'square', 255, 0, 0, 255);

    // Check center pixel is red
    expect(buf.getPixel(5, 5)).toEqual([255, 0, 0, 255]);
  });

  it('module at different positions renders at correct coordinates', () => {
    const buf = new PixelBuffer(50, 50);
    renderRasterModule(buf, 30, 20, 10, 'square', 0, 255, 0, 128);

    // Pixel before the module should be empty
    expect(buf.getPixel(29, 20)).toEqual([0, 0, 0, 0]);
    expect(buf.getPixel(30, 19)).toEqual([0, 0, 0, 0]);

    // Pixel at the module origin should be filled
    expect(buf.getPixel(30, 20)).toEqual([0, 255, 0, 128]);

    // Pixel at the far end of the module should be filled
    expect(buf.getPixel(39, 29)).toEqual([0, 255, 0, 128]);

    // Pixel just past the module should be empty
    expect(buf.getPixel(40, 20)).toEqual([0, 0, 0, 0]);
    expect(buf.getPixel(30, 30)).toEqual([0, 0, 0, 0]);
  });

  it('diamond shape fills center, leaves corners empty', () => {
    const size = 20;
    const buf = new PixelBuffer(30, 30);
    renderRasterModule(buf, 5, 5, size, 'diamond', 0, 0, 0, 255);

    // Center should be filled
    const cx = 5 + Math.floor(size / 2);
    const cy = 5 + Math.floor(size / 2);
    expect(buf.getPixel(cx, cy)).toEqual([0, 0, 0, 255]);

    // All four corner pixels of the bounding box should be empty
    expect(buf.getPixel(5, 5)).toEqual([0, 0, 0, 0]);
    expect(buf.getPixel(5 + size - 1, 5)).toEqual([0, 0, 0, 0]);
    expect(buf.getPixel(5, 5 + size - 1)).toEqual([0, 0, 0, 0]);
    expect(buf.getPixel(5 + size - 1, 5 + size - 1)).toEqual([0, 0, 0, 0]);
  });

  it('diamond shape fills edge midpoints (vertices)', () => {
    const size = 20;
    const buf = new PixelBuffer(30, 30);
    renderRasterModule(buf, 5, 5, size, 'diamond', 0, 0, 0, 255);

    const cx = 5 + size / 2; // 15
    const cy = 5 + size / 2; // 15
    // The diamond vertices touch near edge midpoints (within 0.45 * half of center)
    // Top vertex: (cx, cy - half) where half = size * 0.45 = 9
    // So top vertex at ~(15, 6) — should be filled
    expect(buf.getPixel(Math.floor(cx), Math.ceil(cy - size * 0.45))).toEqual([0, 0, 0, 255]);
    // Right vertex
    expect(buf.getPixel(Math.floor(cx + size * 0.45), Math.floor(cy))).toEqual([0, 0, 0, 255]);
  });

  it('diamond color is applied correctly', () => {
    const buf = new PixelBuffer(20, 20);
    renderRasterModule(buf, 0, 0, 10, 'diamond', 255, 0, 0, 255);
    // Center pixel should be red
    expect(buf.getPixel(5, 5)).toEqual([255, 0, 0, 255]);
  });
});
