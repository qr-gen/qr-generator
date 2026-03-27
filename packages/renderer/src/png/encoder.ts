import { PixelBuffer } from '../raster/pixel-buffer.js';
import { pngChunkCrc } from './crc32.js';
import { zlibCompress } from './deflate.js';
import { filterScanlines } from './filter.js';

/** The 8-byte PNG file signature. */
const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

/**
 * Build a PNG chunk: [length:4 BE][type:4][data:N][crc:4 BE]
 */
function buildChunk(type: string, data: Uint8Array): Uint8Array {
  const typeBytes = new TextEncoder().encode(type);
  const length = data.length;
  const chunk = new Uint8Array(12 + length);

  // Length (4 bytes, big-endian)
  chunk[0] = (length >>> 24) & 0xff;
  chunk[1] = (length >>> 16) & 0xff;
  chunk[2] = (length >>> 8) & 0xff;
  chunk[3] = length & 0xff;

  // Type (4 bytes)
  chunk.set(typeBytes, 4);

  // Data
  chunk.set(data, 8);

  // CRC (4 bytes, big-endian, over type + data)
  const crc = pngChunkCrc(typeBytes, data);
  chunk[8 + length] = (crc >>> 24) & 0xff;
  chunk[9 + length] = (crc >>> 16) & 0xff;
  chunk[10 + length] = (crc >>> 8) & 0xff;
  chunk[11 + length] = crc & 0xff;

  return chunk;
}

/**
 * Write a 4-byte big-endian unsigned integer into a buffer at the given offset.
 */
function writeU32BE(buf: Uint8Array, offset: number, value: number): void {
  buf[offset] = (value >>> 24) & 0xff;
  buf[offset + 1] = (value >>> 16) & 0xff;
  buf[offset + 2] = (value >>> 8) & 0xff;
  buf[offset + 3] = value & 0xff;
}

/**
 * Encode a PixelBuffer as a PNG file.
 * Uses RGBA color type (6) with 8-bit depth and no-filter scanlines.
 */
export function encodePNG(buffer: PixelBuffer): Uint8Array {
  // Build IHDR data (13 bytes)
  const ihdrData = new Uint8Array(13);
  writeU32BE(ihdrData, 0, buffer.width);
  writeU32BE(ihdrData, 4, buffer.height);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression method
  ihdrData[11] = 0; // filter method
  ihdrData[12] = 0; // interlace method

  const ihdrChunk = buildChunk('IHDR', ihdrData);

  // Build filtered scanlines and compress
  const scanlines = filterScanlines(buffer);
  const compressed = zlibCompress(scanlines);
  const idatChunk = buildChunk('IDAT', compressed);

  // IEND chunk (empty data)
  const iendChunk = buildChunk('IEND', new Uint8Array(0));

  // Concatenate all parts
  const totalLength =
    PNG_SIGNATURE.length + ihdrChunk.length + idatChunk.length + iendChunk.length;
  const out = new Uint8Array(totalLength);
  let offset = 0;

  out.set(PNG_SIGNATURE, offset);
  offset += PNG_SIGNATURE.length;

  out.set(ihdrChunk, offset);
  offset += ihdrChunk.length;

  out.set(idatChunk, offset);
  offset += idatChunk.length;

  out.set(iendChunk, offset);

  return out;
}
