import { describe, it, expect } from 'vitest';
import { decodePNG } from '../src/png/decoder.js';
import { encodePNG } from '../src/png/encoder.js';
import { PixelBuffer } from '../src/raster/pixel-buffer.js';
import { zlibCompress } from '../src/png/deflate.js';
import { pngChunkCrc } from '../src/png/crc32.js';

const PNG_SIG = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

function buildChunk(type: string, data: Uint8Array): Uint8Array {
  const typeBytes = new TextEncoder().encode(type);
  const chunk = new Uint8Array(12 + data.length);
  chunk[0] = (data.length >>> 24) & 0xff;
  chunk[1] = (data.length >>> 16) & 0xff;
  chunk[2] = (data.length >>> 8) & 0xff;
  chunk[3] = data.length & 0xff;
  chunk.set(typeBytes, 4);
  chunk.set(data, 8);
  const crc = pngChunkCrc(typeBytes, data);
  chunk[8 + data.length] = (crc >>> 24) & 0xff;
  chunk[9 + data.length] = (crc >>> 16) & 0xff;
  chunk[10 + data.length] = (crc >>> 8) & 0xff;
  chunk[11 + data.length] = crc & 0xff;
  return chunk;
}

function buildMinimalPNG(
  width: number,
  height: number,
  pixelData: Uint8Array,
  colorType = 6,
  bitDepth = 8,
): Uint8Array {
  // IHDR
  const ihdr = new Uint8Array(13);
  ihdr[0] = (width >>> 24) & 0xff;
  ihdr[1] = (width >>> 16) & 0xff;
  ihdr[2] = (width >>> 8) & 0xff;
  ihdr[3] = width & 0xff;
  ihdr[4] = (height >>> 24) & 0xff;
  ihdr[5] = (height >>> 16) & 0xff;
  ihdr[6] = (height >>> 8) & 0xff;
  ihdr[7] = height & 0xff;
  ihdr[8] = bitDepth;
  ihdr[9] = colorType;
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const ihdrChunk = buildChunk('IHDR', ihdr);

  // Build scanlines with filter type 0 (None)
  const bytesPerPixel = colorType === 6 ? 4 : colorType === 2 ? 3 : 1;
  const rowBytes = width * bytesPerPixel;
  const scanlines = new Uint8Array(height * (1 + rowBytes));
  for (let y = 0; y < height; y++) {
    scanlines[y * (1 + rowBytes)] = 0; // filter None
    scanlines.set(
      pixelData.subarray(y * rowBytes, y * rowBytes + rowBytes),
      y * (1 + rowBytes) + 1,
    );
  }

  const compressed = zlibCompress(scanlines);
  const idatChunk = buildChunk('IDAT', compressed);
  const iendChunk = buildChunk('IEND', new Uint8Array(0));

  const total = PNG_SIG.length + ihdrChunk.length + idatChunk.length + iendChunk.length;
  const out = new Uint8Array(total);
  let offset = 0;
  out.set(PNG_SIG, offset); offset += PNG_SIG.length;
  out.set(ihdrChunk, offset); offset += ihdrChunk.length;
  out.set(idatChunk, offset); offset += idatChunk.length;
  out.set(iendChunk, offset);
  return out;
}

describe('decodePNG', () => {
  it('decodes a 1x1 red pixel PNG', () => {
    const pixels = new Uint8Array([255, 0, 0, 255]);
    const png = buildMinimalPNG(1, 1, pixels);
    const result = decodePNG(png);
    expect(result.width).toBe(1);
    expect(result.height).toBe(1);
    expect(result.pixels[0]).toBe(255); // R
    expect(result.pixels[1]).toBe(0);   // G
    expect(result.pixels[2]).toBe(0);   // B
    expect(result.pixels[3]).toBe(255); // A
  });

  it('decodes a 2x2 PNG with mixed colors', () => {
    const pixels = new Uint8Array([
      255, 0, 0, 255,     // red
      0, 255, 0, 255,     // green
      0, 0, 255, 255,     // blue
      255, 255, 255, 255, // white
    ]);
    const png = buildMinimalPNG(2, 2, pixels);
    const result = decodePNG(png);
    expect(result.width).toBe(2);
    expect(result.height).toBe(2);
    expect(Array.from(result.pixels)).toEqual(Array.from(pixels));
  });

  it('round-trips through encodePNG → decodePNG', () => {
    const buf = new PixelBuffer(3, 3);
    buf.setPixel(0, 0, 255, 0, 0, 255);
    buf.setPixel(1, 0, 0, 255, 0, 255);
    buf.setPixel(2, 0, 0, 0, 255, 255);
    buf.setPixel(0, 1, 128, 128, 128, 255);
    buf.setPixel(1, 1, 0, 0, 0, 255);
    buf.setPixel(2, 1, 255, 255, 255, 255);
    buf.setPixel(0, 2, 64, 64, 64, 255);
    buf.setPixel(1, 2, 192, 192, 192, 255);
    buf.setPixel(2, 2, 100, 200, 50, 255);

    const encoded = encodePNG(buf);
    const decoded = decodePNG(encoded);
    expect(decoded.width).toBe(3);
    expect(decoded.height).toBe(3);
    expect(Array.from(decoded.pixels)).toEqual(Array.from(buf.data));
  });

  it('decodes RGB (color type 2) PNG', () => {
    const pixels = new Uint8Array([255, 0, 0, 0, 255, 0]); // 2 pixels: red, green
    const png = buildMinimalPNG(2, 1, pixels, 2);
    const result = decodePNG(png);
    expect(result.width).toBe(2);
    expect(result.height).toBe(1);
    // Should expand RGB to RGBA with alpha=255
    expect(result.pixels[0]).toBe(255); // R
    expect(result.pixels[1]).toBe(0);   // G
    expect(result.pixels[2]).toBe(0);   // B
    expect(result.pixels[3]).toBe(255); // A (added)
    expect(result.pixels[4]).toBe(0);   // R
    expect(result.pixels[5]).toBe(255); // G
    expect(result.pixels[6]).toBe(0);   // B
    expect(result.pixels[7]).toBe(255); // A (added)
  });

  it('decodes grayscale (color type 0) PNG', () => {
    const pixels = new Uint8Array([0, 128, 255]); // 3 pixels: black, gray, white
    const png = buildMinimalPNG(3, 1, pixels, 0);
    const result = decodePNG(png);
    expect(result.width).toBe(3);
    expect(result.height).toBe(1);
    // Should expand grayscale to RGBA
    expect(result.pixels[0]).toBe(0);   // R
    expect(result.pixels[1]).toBe(0);   // G
    expect(result.pixels[2]).toBe(0);   // B
    expect(result.pixels[3]).toBe(255); // A
    expect(result.pixels[4]).toBe(128); // R
    expect(result.pixels[5]).toBe(128); // G
    expect(result.pixels[6]).toBe(128); // B
    expect(result.pixels[7]).toBe(255); // A
  });

  it('throws on invalid PNG signature', () => {
    const bad = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]);
    expect(() => decodePNG(bad)).toThrow();
  });

  it('throws on missing IHDR', () => {
    const iendChunk = buildChunk('IEND', new Uint8Array(0));
    const data = new Uint8Array(PNG_SIG.length + iendChunk.length);
    data.set(PNG_SIG, 0);
    data.set(iendChunk, PNG_SIG.length);
    expect(() => decodePNG(data)).toThrow();
  });

  it('handles an 8x8 checkerboard pattern', () => {
    const pixels = new Uint8Array(8 * 8 * 4);
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const offset = (y * 8 + x) * 4;
        const isDark = (x + y) % 2 === 0;
        pixels[offset] = isDark ? 0 : 255;
        pixels[offset + 1] = isDark ? 0 : 255;
        pixels[offset + 2] = isDark ? 0 : 255;
        pixels[offset + 3] = 255;
      }
    }
    const png = buildMinimalPNG(8, 8, pixels);
    const result = decodePNG(png);
    expect(result.width).toBe(8);
    expect(result.height).toBe(8);
    expect(Array.from(result.pixels)).toEqual(Array.from(pixels));
  });
});
