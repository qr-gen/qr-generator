import { describe, it, expect } from 'vitest';
import { decodeImageFromDataURI } from '../src/halftone/image-decoder.js';
import { encodePNG } from '../src/png/encoder.js';
import { PixelBuffer } from '../src/raster/pixel-buffer.js';
import { base64Encode } from '../src/utils/base64.js';

function make1x1PNG(r: number, g: number, b: number, a: number): string {
  const buf = new PixelBuffer(1, 1);
  buf.setPixel(0, 0, r, g, b, a);
  const pngBytes = encodePNG(buf);
  return `data:image/png;base64,${base64Encode(pngBytes)}`;
}

function make2x2PNG(): string {
  const buf = new PixelBuffer(2, 2);
  buf.setPixel(0, 0, 0, 0, 0, 255);       // black
  buf.setPixel(1, 0, 255, 255, 255, 255); // white
  buf.setPixel(0, 1, 128, 128, 128, 255); // gray
  buf.setPixel(1, 1, 255, 0, 0, 255);     // red
  const pngBytes = encodePNG(buf);
  return `data:image/png;base64,${base64Encode(pngBytes)}`;
}

describe('decodeImageFromDataURI', () => {
  it('decodes a 1x1 red pixel data URI', () => {
    const uri = make1x1PNG(255, 0, 0, 255);
    const result = decodeImageFromDataURI(uri);
    expect(result.width).toBe(1);
    expect(result.height).toBe(1);
    expect(result.pixels[0]).toBe(255); // R
    expect(result.pixels[1]).toBe(0);   // G
    expect(result.pixels[2]).toBe(0);   // B
    expect(result.pixels[3]).toBe(255); // A
  });

  it('decodes a 2x2 multi-color data URI', () => {
    const uri = make2x2PNG();
    const result = decodeImageFromDataURI(uri);
    expect(result.width).toBe(2);
    expect(result.height).toBe(2);
    // top-left: black
    expect(result.pixels[0]).toBe(0);
    expect(result.pixels[1]).toBe(0);
    expect(result.pixels[2]).toBe(0);
  });

  it('throws on missing data URI prefix', () => {
    expect(() => decodeImageFromDataURI('not-a-data-uri')).toThrow();
  });

  it('throws on non-PNG data URI', () => {
    expect(() => decodeImageFromDataURI('data:image/jpeg;base64,/9j/4AAQ')).toThrow();
  });

  it('handles data URI with charset parameter', () => {
    const buf = new PixelBuffer(1, 1);
    buf.setPixel(0, 0, 0, 0, 0, 255);
    const pngBytes = encodePNG(buf);
    const uri = `data:image/png;charset=utf-8;base64,${base64Encode(pngBytes)}`;
    const result = decodeImageFromDataURI(uri);
    expect(result.width).toBe(1);
    expect(result.height).toBe(1);
  });
});
