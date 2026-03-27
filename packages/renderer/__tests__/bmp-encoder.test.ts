import { describe, it, expect } from 'vitest';
import { PixelBuffer } from '../src/raster/pixel-buffer.js';
import { encodeBMP } from '../src/bmp/encoder.js';

/** Read a 4-byte little-endian unsigned integer from a buffer at the given offset. */
function readU32LE(buf: Uint8Array, offset: number): number {
  return (
    buf[offset] |
    (buf[offset + 1] << 8) |
    (buf[offset + 2] << 16) |
    (buf[offset + 3] << 24)
  ) >>> 0;
}

/** Read a 2-byte little-endian unsigned integer from a buffer at the given offset. */
function readU16LE(buf: Uint8Array, offset: number): number {
  return buf[offset] | (buf[offset + 1] << 8);
}

function make1x1Red(): PixelBuffer {
  const buf = new PixelBuffer(1, 1);
  buf.setPixel(0, 0, 255, 0, 0, 255);
  return buf;
}

function make3x1RGB(): PixelBuffer {
  const buf = new PixelBuffer(3, 1);
  buf.setPixel(0, 0, 255, 0, 0, 255);   // red
  buf.setPixel(1, 0, 0, 255, 0, 255);   // green
  buf.setPixel(2, 0, 0, 0, 255, 255);   // blue
  return buf;
}

function make2x2Mixed(): PixelBuffer {
  const buf = new PixelBuffer(2, 2);
  buf.setPixel(0, 0, 255, 0, 0, 255);     // top-left: red
  buf.setPixel(1, 0, 0, 255, 0, 255);     // top-right: green
  buf.setPixel(0, 1, 0, 0, 255, 255);     // bottom-left: blue
  buf.setPixel(1, 1, 255, 255, 255, 255); // bottom-right: white
  return buf;
}

describe('encodeBMP', () => {
  describe('file header', () => {
    it('output starts with "BM" signature (bytes 66, 77)', () => {
      const bmp = encodeBMP(make1x1Red());
      expect(bmp[0]).toBe(66); // 'B'
      expect(bmp[1]).toBe(77); // 'M'
    });

    it('file size in header (bytes 2-5, LE) matches actual output length', () => {
      const bmp = encodeBMP(make1x1Red());
      const headerFileSize = readU32LE(bmp, 2);
      expect(headerFileSize).toBe(bmp.length);
    });

    it('file size matches for larger buffers', () => {
      const bmp = encodeBMP(make2x2Mixed());
      const headerFileSize = readU32LE(bmp, 2);
      expect(headerFileSize).toBe(bmp.length);
    });

    it('reserved bytes (6-9) are zero', () => {
      const bmp = encodeBMP(make1x1Red());
      expect(bmp[6]).toBe(0);
      expect(bmp[7]).toBe(0);
      expect(bmp[8]).toBe(0);
      expect(bmp[9]).toBe(0);
    });

    it('pixel data offset at bytes 10-13 is 54 (14 + 40)', () => {
      const bmp = encodeBMP(make1x1Red());
      const pixelOffset = readU32LE(bmp, 10);
      expect(pixelOffset).toBe(54);
    });
  });

  describe('DIB header (BITMAPINFOHEADER)', () => {
    it('DIB header size at offset 14 is 40', () => {
      const bmp = encodeBMP(make1x1Red());
      const dibSize = readU32LE(bmp, 14);
      expect(dibSize).toBe(40);
    });

    it('width at offset 18 (LE 4 bytes) matches buffer width', () => {
      const buf = new PixelBuffer(7, 3);
      const bmp = encodeBMP(buf);
      const width = readU32LE(bmp, 18);
      expect(width).toBe(7);
    });

    it('height at offset 22 (LE 4 bytes) matches buffer height', () => {
      const buf = new PixelBuffer(7, 3);
      const bmp = encodeBMP(buf);
      const height = readU32LE(bmp, 22);
      expect(height).toBe(3);
    });

    it('planes at offset 26 is 1', () => {
      const bmp = encodeBMP(make1x1Red());
      const planes = readU16LE(bmp, 26);
      expect(planes).toBe(1);
    });

    it('bits per pixel at offset 28 is 24', () => {
      const bmp = encodeBMP(make1x1Red());
      const bpp = readU16LE(bmp, 28);
      expect(bpp).toBe(24);
    });

    it('compression at offset 30 is 0', () => {
      const bmp = encodeBMP(make1x1Red());
      const compression = readU32LE(bmp, 30);
      expect(compression).toBe(0);
    });

    it('image size at offset 34 matches pixel data size', () => {
      const buf = make3x1RGB();
      const bmp = encodeBMP(buf);
      const imageSize = readU32LE(bmp, 34);
      const expectedPixelDataSize = bmp.length - 54;
      expect(imageSize).toBe(expectedPixelDataSize);
    });

    it('x/y pels per meter at offsets 38 and 42 are 0', () => {
      const bmp = encodeBMP(make1x1Red());
      expect(readU32LE(bmp, 38)).toBe(0);
      expect(readU32LE(bmp, 42)).toBe(0);
    });

    it('colors used and important colors at offsets 46 and 50 are 0', () => {
      const bmp = encodeBMP(make1x1Red());
      expect(readU32LE(bmp, 46)).toBe(0);
      expect(readU32LE(bmp, 50)).toBe(0);
    });
  });

  describe('pixel data', () => {
    it('color order is BGR (not RGB)', () => {
      // 1x1 red pixel [255,0,0,255] should produce BGR bytes [0,0,255]
      const bmp = encodeBMP(make1x1Red());
      const pixelStart = 54;
      expect(bmp[pixelStart]).toBe(0);     // B
      expect(bmp[pixelStart + 1]).toBe(0); // G
      expect(bmp[pixelStart + 2]).toBe(255); // R
    });

    it('1x1 red pixel [255,0,0,255] produces BGR bytes [0,0,255] at pixel data', () => {
      const bmp = encodeBMP(make1x1Red());
      const pixelStart = 54;
      // BGR for red = [0, 0, 255]
      expect(bmp[pixelStart]).toBe(0);
      expect(bmp[pixelStart + 1]).toBe(0);
      expect(bmp[pixelStart + 2]).toBe(255);
    });

    it('pixel data is bottom-up (last row of image is first in file)', () => {
      const bmp = encodeBMP(make2x2Mixed());
      const pixelStart = 54;
      // Row size for 2px wide: 2*3=6 bytes, padded to 8 (next 4-byte boundary)
      const rowSize = 8;

      // First row in file = bottom row of image (row 1: blue, white)
      // Bottom-left pixel: blue (R=0, G=0, B=255) -> BGR: [255, 0, 0]
      expect(bmp[pixelStart]).toBe(255);     // B of blue pixel
      expect(bmp[pixelStart + 1]).toBe(0);   // G
      expect(bmp[pixelStart + 2]).toBe(0);   // R

      // Bottom-right pixel: white (R=255, G=255, B=255) -> BGR: [255, 255, 255]
      expect(bmp[pixelStart + 3]).toBe(255); // B of white
      expect(bmp[pixelStart + 4]).toBe(255); // G
      expect(bmp[pixelStart + 5]).toBe(255); // R

      // Second row in file = top row of image (row 0: red, green)
      // Top-left pixel: red (R=255, G=0, B=0) -> BGR: [0, 0, 255]
      expect(bmp[pixelStart + rowSize]).toBe(0);       // B of red
      expect(bmp[pixelStart + rowSize + 1]).toBe(0);   // G
      expect(bmp[pixelStart + rowSize + 2]).toBe(255); // R

      // Top-right pixel: green (R=0, G=255, B=0) -> BGR: [0, 255, 0]
      expect(bmp[pixelStart + rowSize + 3]).toBe(0);   // B of green
      expect(bmp[pixelStart + rowSize + 4]).toBe(255); // G
      expect(bmp[pixelStart + rowSize + 5]).toBe(0);   // R
    });

    it('3x1 buffer produces rows padded from 9 bytes to 12 bytes (next 4-byte boundary)', () => {
      const bmp = encodeBMP(make3x1RGB());
      // 3 pixels * 3 bytes = 9, padded to 12
      const expectedRowSize = 12;
      const pixelDataSize = bmp.length - 54;
      expect(pixelDataSize).toBe(expectedRowSize);
    });

    it('row padding bytes are zero', () => {
      const bmp = encodeBMP(make3x1RGB());
      const pixelStart = 54;
      // 3 pixels * 3 bytes = 9 bytes of pixel data per row
      // Padded to 12: bytes at offsets 9, 10, 11 should be 0
      expect(bmp[pixelStart + 9]).toBe(0);
      expect(bmp[pixelStart + 10]).toBe(0);
      expect(bmp[pixelStart + 11]).toBe(0);
    });

    it('width that is already 4-byte aligned has no extra padding', () => {
      // 4 pixels * 3 bytes = 12 bytes, already 4-byte aligned
      const buf = new PixelBuffer(4, 1);
      buf.setPixel(0, 0, 255, 0, 0, 255);
      buf.setPixel(1, 0, 0, 255, 0, 255);
      buf.setPixel(2, 0, 0, 0, 255, 255);
      buf.setPixel(3, 0, 128, 128, 128, 255);
      const bmp = encodeBMP(buf);
      const pixelDataSize = bmp.length - 54;
      expect(pixelDataSize).toBe(12); // no padding needed
    });

    it('alpha channel is dropped', () => {
      // Create a pixel with alpha < 255, verify output is still 24-bit (3 bytes per pixel)
      const buf = new PixelBuffer(1, 1);
      buf.setPixel(0, 0, 128, 64, 32, 100); // semi-transparent
      const bmp = encodeBMP(buf);
      const bpp = readU16LE(bmp, 28);
      expect(bpp).toBe(24);
      // Only 3 bytes for the pixel (+ 1 byte padding to reach 4-byte boundary)
      const pixelStart = 54;
      expect(bmp[pixelStart]).toBe(32);  // B
      expect(bmp[pixelStart + 1]).toBe(64);  // G
      expect(bmp[pixelStart + 2]).toBe(128); // R
    });
  });
});
