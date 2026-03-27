import { describe, it, expect, vi } from 'vitest';
import { PixelBuffer } from '../src/raster/pixel-buffer.js';
import { pngChunkCrc } from '../src/png/crc32.js';

// Mock zlibCompress since deflate.ts is being built in parallel
vi.mock('../src/png/deflate.js', () => ({
  zlibCompress: (data: Uint8Array) => {
    // Return a minimal valid zlib stream: CMF(0x78) + FLG(0x01) + stored block + Adler32
    // For testing purposes, we wrap data in an uncompressed deflate block
    const out = new Uint8Array(data.length + 11);
    out[0] = 0x78; // CMF
    out[1] = 0x01; // FLG
    // Final block, no compression
    out[2] = 0x01;
    // Length (little-endian)
    out[3] = data.length & 0xff;
    out[4] = (data.length >> 8) & 0xff;
    // One's complement of length
    out[5] = ~data.length & 0xff;
    out[6] = (~data.length >> 8) & 0xff;
    out.set(data, 7);
    // Adler32 placeholder (simplified)
    const adlerOffset = 7 + data.length;
    out[adlerOffset] = 0x00;
    out[adlerOffset + 1] = 0x00;
    out[adlerOffset + 2] = 0x00;
    out[adlerOffset + 3] = 0x01;
    return out;
  },
}));

import { encodePNG } from '../src/png/encoder.js';
import { filterScanlines } from '../src/png/filter.js';

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

/** Read a 4-byte big-endian unsigned integer from a buffer at the given offset. */
function readU32BE(buf: Uint8Array, offset: number): number {
  return (
    ((buf[offset] << 24) |
      (buf[offset + 1] << 16) |
      (buf[offset + 2] << 8) |
      buf[offset + 3]) >>>
    0
  );
}

/** Read a 4-byte ASCII string from a buffer at the given offset. */
function readAscii4(buf: Uint8Array, offset: number): string {
  return String.fromCharCode(
    buf[offset],
    buf[offset + 1],
    buf[offset + 2],
    buf[offset + 3],
  );
}

/** Parse chunks from a PNG buffer (skipping the 8-byte signature). */
function parseChunks(
  png: Uint8Array,
): Array<{ type: string; data: Uint8Array; crc: number; offset: number }> {
  const chunks: Array<{
    type: string;
    data: Uint8Array;
    crc: number;
    offset: number;
  }> = [];
  let pos = 8; // skip signature
  while (pos < png.length) {
    const length = readU32BE(png, pos);
    const type = readAscii4(png, pos + 4);
    const data = png.slice(pos + 8, pos + 8 + length);
    const crc = readU32BE(png, pos + 8 + length);
    chunks.push({ type, data, crc, offset: pos });
    pos += 12 + length;
  }
  return chunks;
}

function make1x1Red(): PixelBuffer {
  const buf = new PixelBuffer(1, 1);
  buf.setPixel(0, 0, 255, 0, 0, 255);
  return buf;
}

function make2x2Mixed(): PixelBuffer {
  const buf = new PixelBuffer(2, 2);
  buf.setPixel(0, 0, 255, 0, 0, 255); // red
  buf.setPixel(1, 0, 0, 255, 0, 255); // green
  buf.setPixel(0, 1, 0, 0, 255, 255); // blue
  buf.setPixel(1, 1, 255, 255, 255, 128); // semi-transparent white
  return buf;
}

describe('filterScanlines', () => {
  it('prepends filter byte 0 to each row', () => {
    const buf = make1x1Red();
    const scanlines = filterScanlines(buf);
    // 1 row: 1 filter byte + 1*4 RGBA bytes = 5
    expect(scanlines.length).toBe(5);
    expect(scanlines[0]).toBe(0); // filter type None
    expect(scanlines[1]).toBe(255); // R
    expect(scanlines[2]).toBe(0); // G
    expect(scanlines[3]).toBe(0); // B
    expect(scanlines[4]).toBe(255); // A
  });

  it('handles multiple rows correctly', () => {
    const buf = make2x2Mixed();
    const scanlines = filterScanlines(buf);
    const rowBytes = 1 + 2 * 4; // filter byte + 2 pixels * 4 bytes
    expect(scanlines.length).toBe(2 * rowBytes);
    // Each row starts with filter byte 0
    expect(scanlines[0]).toBe(0);
    expect(scanlines[rowBytes]).toBe(0);
  });
});

describe('encodePNG', () => {
  it('output starts with the 8-byte PNG signature', () => {
    const png = encodePNG(make1x1Red());
    const sig = Array.from(png.slice(0, 8));
    expect(sig).toEqual(PNG_SIGNATURE);
  });

  describe('IHDR chunk', () => {
    it('has length 13 and type "IHDR"', () => {
      const png = encodePNG(make1x1Red());
      const chunks = parseChunks(png);
      const ihdr = chunks[0];
      expect(ihdr.type).toBe('IHDR');
      expect(ihdr.data.length).toBe(13);
    });

    it('encodes width and height in big-endian', () => {
      const buf = new PixelBuffer(300, 200);
      const png = encodePNG(buf);
      const chunks = parseChunks(png);
      const ihdr = chunks[0];
      expect(readU32BE(ihdr.data, 0)).toBe(300);
      expect(readU32BE(ihdr.data, 4)).toBe(200);
    });

    it('sets bitDepth=8 and colorType=6 (RGBA)', () => {
      const png = encodePNG(make1x1Red());
      const chunks = parseChunks(png);
      const ihdr = chunks[0];
      expect(ihdr.data[8]).toBe(8); // bit depth
      expect(ihdr.data[9]).toBe(6); // color type RGBA
    });

    it('sets compression=0, filter=0, interlace=0', () => {
      const png = encodePNG(make1x1Red());
      const chunks = parseChunks(png);
      const ihdr = chunks[0];
      expect(ihdr.data[10]).toBe(0); // compression method
      expect(ihdr.data[11]).toBe(0); // filter method
      expect(ihdr.data[12]).toBe(0); // interlace method
    });

    it('has a valid CRC', () => {
      const png = encodePNG(make1x1Red());
      const chunks = parseChunks(png);
      const ihdr = chunks[0];
      const typeBytes = new TextEncoder().encode('IHDR');
      const expected = pngChunkCrc(typeBytes, ihdr.data);
      expect(ihdr.crc).toBe(expected);
    });
  });

  describe('IDAT chunk', () => {
    it('is present after IHDR', () => {
      const png = encodePNG(make1x1Red());
      const chunks = parseChunks(png);
      expect(chunks.length).toBeGreaterThanOrEqual(3);
      expect(chunks[1].type).toBe('IDAT');
    });

    it('contains compressed data', () => {
      const png = encodePNG(make1x1Red());
      const chunks = parseChunks(png);
      const idat = chunks[1];
      expect(idat.data.length).toBeGreaterThan(0);
    });
  });

  describe('IEND chunk', () => {
    it('is the last chunk with length 0', () => {
      const png = encodePNG(make1x1Red());
      const chunks = parseChunks(png);
      const iend = chunks[chunks.length - 1];
      expect(iend.type).toBe('IEND');
      expect(iend.data.length).toBe(0);
    });

    it('has a valid CRC', () => {
      const png = encodePNG(make1x1Red());
      const chunks = parseChunks(png);
      const iend = chunks[chunks.length - 1];
      const typeBytes = new TextEncoder().encode('IEND');
      const expected = pngChunkCrc(typeBytes, iend.data);
      expect(iend.crc).toBe(expected);
    });
  });

  it('1x1 red pixel produces 3-chunk structure (IHDR, IDAT, IEND)', () => {
    const png = encodePNG(make1x1Red());
    const chunks = parseChunks(png);
    expect(chunks.map((c) => c.type)).toEqual(['IHDR', 'IDAT', 'IEND']);
  });

  it('2x2 buffer with mixed colors produces valid chunk sequence', () => {
    const png = encodePNG(make2x2Mixed());
    const chunks = parseChunks(png);
    expect(chunks.map((c) => c.type)).toEqual(['IHDR', 'IDAT', 'IEND']);
    // IHDR should encode 2x2
    expect(readU32BE(chunks[0].data, 0)).toBe(2);
    expect(readU32BE(chunks[0].data, 4)).toBe(2);
  });

  it('total output size is reasonable for a small buffer', () => {
    const png = encodePNG(make1x1Red());
    // Signature(8) + IHDR chunk(25) + IDAT(12+compressed) + IEND(12)
    // For 1x1: raw scanlines = 5 bytes, compressed ~16 bytes with mock
    // Total should be well under 200 bytes
    expect(png.length).toBeGreaterThan(8 + 25 + 12 + 12); // minimum structure
    expect(png.length).toBeLessThan(500); // reasonable upper bound
  });

  it('all chunk CRCs are valid', () => {
    const png = encodePNG(make2x2Mixed());
    const chunks = parseChunks(png);
    for (const chunk of chunks) {
      const typeBytes = new TextEncoder().encode(chunk.type);
      const expected = pngChunkCrc(typeBytes, chunk.data);
      expect(chunk.crc).toBe(expected);
    }
  });
});
