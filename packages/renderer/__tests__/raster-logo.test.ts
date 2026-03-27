import { describe, it, expect } from 'vitest';
import { PixelBuffer } from '../src/raster/pixel-buffer.js';
import {
  renderRasterLogoClearZone,
  renderRasterLogoPlaceholder,
} from '../src/raster/logo.js';
import type { LogoBounds } from '../src/svg/logo.js';

describe('renderRasterLogoClearZone', () => {
  it('fills the clear zone area with background color', () => {
    const buffer = new PixelBuffer(100, 100);
    // Set some foreground pixels in the clear zone area first
    buffer.fillRect(20, 20, 60, 60, 0, 0, 0, 255);

    const bounds: LogoBounds = {
      x: 30,
      y: 30,
      width: 40,
      height: 40,
      clearX: 25,
      clearY: 25,
      clearWidth: 50,
      clearHeight: 50,
    };

    renderRasterLogoClearZone(buffer, bounds, 255, 255, 255);

    // Check that the clear zone area is now filled with background color
    const [r, g, b, a] = buffer.getPixel(30, 30);
    expect(r).toBe(255);
    expect(g).toBe(255);
    expect(b).toBe(255);
    expect(a).toBe(255);
  });

  it('clear zone position matches LogoBounds clearX/clearY', () => {
    const buffer = new PixelBuffer(200, 200);
    // Fill entire buffer with black
    buffer.fillRect(0, 0, 200, 200, 0, 0, 0, 255);

    const bounds: LogoBounds = {
      x: 70,
      y: 70,
      width: 60,
      height: 60,
      clearX: 60,
      clearY: 60,
      clearWidth: 80,
      clearHeight: 80,
    };

    renderRasterLogoClearZone(buffer, bounds, 128, 128, 128);

    // Pixel just inside the clear zone should be background
    const [r1, g1, b1, a1] = buffer.getPixel(60, 60);
    expect(r1).toBe(128);
    expect(g1).toBe(128);
    expect(b1).toBe(128);
    expect(a1).toBe(255);

    // Pixel just outside the clear zone should still be black
    const [r2, g2, b2] = buffer.getPixel(59, 59);
    expect(r2).toBe(0);
    expect(g2).toBe(0);
    expect(b2).toBe(0);
  });

  it('clear zone dimensions match clearWidth/clearHeight', () => {
    const buffer = new PixelBuffer(100, 100);
    buffer.fillRect(0, 0, 100, 100, 0, 0, 0, 255);

    const bounds: LogoBounds = {
      x: 30,
      y: 30,
      width: 40,
      height: 40,
      clearX: 25,
      clearY: 25,
      clearWidth: 50,
      clearHeight: 50,
    };

    renderRasterLogoClearZone(buffer, bounds, 200, 100, 50);

    // Last pixel inside clear zone (clearX + clearWidth - 1 = 74)
    const [r1, g1, b1, a1] = buffer.getPixel(74, 74);
    expect(r1).toBe(200);
    expect(g1).toBe(100);
    expect(b1).toBe(50);
    expect(a1).toBe(255);

    // First pixel outside clear zone (clearX + clearWidth = 75)
    const [r2, g2, b2] = buffer.getPixel(75, 75);
    expect(r2).toBe(0);
    expect(g2).toBe(0);
    expect(b2).toBe(0);
  });
});

describe('renderRasterLogoPlaceholder', () => {
  it('fills the logo image area with background color', () => {
    const buffer = new PixelBuffer(100, 100);
    // Fill with some foreground color first
    buffer.fillRect(0, 0, 100, 100, 0, 0, 0, 255);

    const bounds: LogoBounds = {
      x: 30,
      y: 30,
      width: 40,
      height: 40,
      clearX: 25,
      clearY: 25,
      clearWidth: 50,
      clearHeight: 50,
    };

    renderRasterLogoPlaceholder(buffer, bounds, 255, 255, 255);

    // Inside the logo area should be background
    const [r1, g1, b1, a1] = buffer.getPixel(35, 35);
    expect(r1).toBe(255);
    expect(g1).toBe(255);
    expect(b1).toBe(255);
    expect(a1).toBe(255);

    // The logo area boundary: x=30 to x=69, y=30 to y=69
    const [r2, g2, b2, a2] = buffer.getPixel(30, 30);
    expect(r2).toBe(255);
    expect(g2).toBe(255);
    expect(b2).toBe(255);
    expect(a2).toBe(255);
  });

  it('only fills the logo area, not the full clear zone', () => {
    const buffer = new PixelBuffer(100, 100);
    buffer.fillRect(0, 0, 100, 100, 0, 0, 0, 255);

    const bounds: LogoBounds = {
      x: 30,
      y: 30,
      width: 40,
      height: 40,
      clearX: 25,
      clearY: 25,
      clearWidth: 50,
      clearHeight: 50,
    };

    renderRasterLogoPlaceholder(buffer, bounds, 255, 255, 255);

    // Pixel in the padding area (inside clear zone but outside logo area)
    // should remain unchanged (black)
    const [r, g, b] = buffer.getPixel(26, 26);
    expect(r).toBe(0);
    expect(g).toBe(0);
    expect(b).toBe(0);
  });

  it('handles non-square logo dimensions', () => {
    const buffer = new PixelBuffer(100, 100);
    buffer.fillRect(0, 0, 100, 100, 0, 0, 0, 255);

    const bounds: LogoBounds = {
      x: 20,
      y: 35,
      width: 60,
      height: 30,
      clearX: 15,
      clearY: 30,
      clearWidth: 70,
      clearHeight: 40,
    };

    renderRasterLogoPlaceholder(buffer, bounds, 100, 200, 50);

    // Inside the logo area
    const [r1, g1, b1, a1] = buffer.getPixel(50, 50);
    expect(r1).toBe(100);
    expect(g1).toBe(200);
    expect(b1).toBe(50);
    expect(a1).toBe(255);

    // Outside logo height (y=65 is outside since y+height=35+30=65)
    const [r2, g2, b2] = buffer.getPixel(50, 65);
    expect(r2).toBe(0);
    expect(g2).toBe(0);
    expect(b2).toBe(0);
  });
});

describe('no-op behavior', () => {
  it('renderRasterLogoClearZone does not affect pixels outside clear zone', () => {
    const buffer = new PixelBuffer(50, 50);
    buffer.fillRect(0, 0, 50, 50, 10, 20, 30, 255);

    const bounds: LogoBounds = {
      x: 15,
      y: 15,
      width: 20,
      height: 20,
      clearX: 10,
      clearY: 10,
      clearWidth: 30,
      clearHeight: 30,
    };

    renderRasterLogoClearZone(buffer, bounds, 255, 255, 255);

    // Corner pixel should be untouched
    const [r, g, b, a] = buffer.getPixel(0, 0);
    expect(r).toBe(10);
    expect(g).toBe(20);
    expect(b).toBe(30);
    expect(a).toBe(255);

    // Pixel at edge of clear zone (9, 9) should be untouched
    const [r2, g2, b2] = buffer.getPixel(9, 9);
    expect(r2).toBe(10);
    expect(g2).toBe(20);
    expect(b2).toBe(30);
  });
});
