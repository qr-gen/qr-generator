import { PixelBuffer } from '../raster/pixel-buffer.js';

/**
 * Apply PNG row filter type 0 (None) to scanlines.
 * Prepends a 0 byte to each row of RGBA data.
 */
export function filterScanlines(buffer: PixelBuffer): Uint8Array {
  const { width, height, data } = buffer;
  const rowBytes = width * 4;
  const filteredRowBytes = 1 + rowBytes; // filter byte + pixel data
  const out = new Uint8Array(height * filteredRowBytes);

  for (let y = 0; y < height; y++) {
    const outOffset = y * filteredRowBytes;
    const srcOffset = y * rowBytes;
    out[outOffset] = 0; // filter type None
    out.set(data.subarray(srcOffset, srcOffset + rowBytes), outOffset + 1);
  }

  return out;
}
