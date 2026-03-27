import { PixelBuffer } from '../raster/pixel-buffer.js';

/**
 * Encode a PixelBuffer as a BMP file.
 * Uses 24-bit BGR color with BITMAPINFOHEADER.
 * Alpha channel is dropped (BMP 24-bit doesn't support alpha).
 */
export function encodeBMP(buffer: PixelBuffer): Uint8Array {
  const { width, height, data } = buffer;

  // Row size: each row is width*3 bytes of BGR data, padded to 4-byte boundary
  const rowSize = Math.ceil((width * 3) / 4) * 4;
  const pixelDataSize = rowSize * height;
  const fileSize = 14 + 40 + pixelDataSize;

  const out = new Uint8Array(fileSize);
  const view = new DataView(out.buffer);

  // --- File header (14 bytes) ---
  out[0] = 0x42; // 'B'
  out[1] = 0x4d; // 'M'
  view.setUint32(2, fileSize, true);       // file size
  // bytes 6-9: reserved (already 0)
  view.setUint32(10, 54, true);            // pixel data offset (14 + 40)

  // --- DIB header: BITMAPINFOHEADER (40 bytes) ---
  view.setUint32(14, 40, true);            // header size
  view.setInt32(18, width, true);           // width
  view.setInt32(22, height, true);          // height (positive = bottom-up)
  view.setUint16(26, 1, true);             // planes
  view.setUint16(28, 24, true);            // bits per pixel
  view.setUint32(30, 0, true);             // compression (BI_RGB = 0)
  view.setUint32(34, pixelDataSize, true); // image size
  view.setUint32(38, 0, true);             // x pixels per meter
  view.setUint32(42, 0, true);             // y pixels per meter
  view.setUint32(46, 0, true);             // colors used
  view.setUint32(50, 0, true);             // important colors

  // --- Pixel data (bottom-up row order, BGR) ---
  const pixelOffset = 54;
  for (let y = height - 1; y >= 0; y--) {
    // Row index in the output: bottom-up means row (height-1) is first
    const outRowStart = pixelOffset + (height - 1 - y) * rowSize;

    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const dstIdx = outRowStart + x * 3;
      out[dstIdx] = data[srcIdx + 2];     // B
      out[dstIdx + 1] = data[srcIdx + 1]; // G
      out[dstIdx + 2] = data[srcIdx];     // R
    }
    // Padding bytes are already 0 (Uint8Array is zero-initialized)
  }

  return out;
}
