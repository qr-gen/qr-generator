import { describe, it, expect } from 'vitest';
import { toGrayscaleGrid, rgbToGray } from '../src/halftone/grayscale.js';

describe('rgbToGray', () => {
  it('converts pure white to 255', () => {
    expect(rgbToGray(255, 255, 255)).toBe(255);
  });

  it('converts pure black to 0', () => {
    expect(rgbToGray(0, 0, 0)).toBe(0);
  });

  it('uses luminance formula (0.299R + 0.587G + 0.114B)', () => {
    // Pure red
    expect(rgbToGray(255, 0, 0)).toBe(Math.round(0.299 * 255));
    // Pure green
    expect(rgbToGray(0, 255, 0)).toBe(Math.round(0.587 * 255));
    // Pure blue
    expect(rgbToGray(0, 0, 255)).toBe(Math.round(0.114 * 255));
  });

  it('handles mid-gray', () => {
    expect(rgbToGray(128, 128, 128)).toBe(128);
  });
});

describe('toGrayscaleGrid', () => {
  it('downsamples a 4x4 image to a 2x2 grid with threshold', () => {
    // 4x4 RGBA image: top-left quadrant black, rest white
    const pixels = new Uint8Array(4 * 4 * 4);
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const offset = (y * 4 + x) * 4;
        const isBlack = x < 2 && y < 2;
        pixels[offset] = isBlack ? 0 : 255;
        pixels[offset + 1] = isBlack ? 0 : 255;
        pixels[offset + 2] = isBlack ? 0 : 255;
        pixels[offset + 3] = 255;
      }
    }

    const grid = toGrayscaleGrid(pixels, 4, 4, 2, 128);
    expect(grid.length).toBe(2);
    expect(grid[0].length).toBe(2);
    // top-left should be dark (1), rest light (0)
    expect(grid[0][0]).toBe(1); // black → dark
    expect(grid[0][1]).toBe(0); // white → light
    expect(grid[1][0]).toBe(0); // white → light
    expect(grid[1][1]).toBe(0); // white → light
  });

  it('produces correct grid for same-size image', () => {
    // 3x3 RGBA image, all black
    const pixels = new Uint8Array(3 * 3 * 4);
    for (let i = 0; i < 3 * 3; i++) {
      pixels[i * 4 + 3] = 255; // alpha
    }

    const grid = toGrayscaleGrid(pixels, 3, 3, 3, 128);
    expect(grid.length).toBe(3);
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        expect(grid[y][x]).toBe(1); // all black → dark
      }
    }
  });

  it('threshold at 0 makes everything light', () => {
    const pixels = new Uint8Array(4); // 1x1 black pixel
    pixels[3] = 255;
    const grid = toGrayscaleGrid(pixels, 1, 1, 1, 0);
    expect(grid[0][0]).toBe(0); // gray=0 is NOT < 0, so light
  });

  it('threshold at 255 makes everything dark except pure white', () => {
    // 1x1 gray pixel (128,128,128)
    const pixels = new Uint8Array([128, 128, 128, 255]);
    const grid = toGrayscaleGrid(pixels, 1, 1, 1, 255);
    expect(grid[0][0]).toBe(1); // gray=128 < 255 → dark
  });

  it('upsamples a 1x1 image to a larger grid', () => {
    // 1x1 white pixel
    const pixels = new Uint8Array([255, 255, 255, 255]);
    const grid = toGrayscaleGrid(pixels, 1, 1, 5, 128);
    expect(grid.length).toBe(5);
    for (let y = 0; y < 5; y++) {
      expect(grid[y].length).toBe(5);
      for (let x = 0; x < 5; x++) {
        expect(grid[y][x]).toBe(0); // white → light
      }
    }
  });
});
