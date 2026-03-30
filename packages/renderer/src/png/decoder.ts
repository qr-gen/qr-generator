import { inflate } from './inflate.js';

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

export interface DecodedPNG {
  width: number;
  height: number;
  /** RGBA pixel data, 4 bytes per pixel, row-major */
  pixels: Uint8Array;
}

function readU32BE(buf: Uint8Array, offset: number): number {
  return (
    ((buf[offset] << 24) |
      (buf[offset + 1] << 16) |
      (buf[offset + 2] << 8) |
      buf[offset + 3]) >>> 0
  );
}

/** Paeth predictor per PNG spec */
function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

/**
 * Decode a PNG file into RGBA pixel data.
 * Supports color types: 0 (grayscale), 2 (RGB), 6 (RGBA), 8-bit depth.
 */
export function decodePNG(data: Uint8Array): DecodedPNG {
  // Verify signature
  for (let i = 0; i < 8; i++) {
    if (data[i] !== PNG_SIGNATURE[i]) {
      throw new Error('PNG: invalid signature');
    }
  }

  let width = 0;
  let height = 0;
  let colorType = 0;
  let bitDepth = 0;
  let hasIHDR = false;
  const idatChunks: Uint8Array[] = [];

  // Parse chunks
  let pos = 8;
  while (pos < data.length) {
    const chunkLen = readU32BE(data, pos);
    const type =
      String.fromCharCode(data[pos + 4]) +
      String.fromCharCode(data[pos + 5]) +
      String.fromCharCode(data[pos + 6]) +
      String.fromCharCode(data[pos + 7]);

    const chunkData = data.subarray(pos + 8, pos + 8 + chunkLen);

    if (type === 'IHDR') {
      hasIHDR = true;
      width = readU32BE(chunkData, 0);
      height = readU32BE(chunkData, 4);
      bitDepth = chunkData[8];
      colorType = chunkData[9];
      if (bitDepth !== 8) {
        throw new Error(`PNG: unsupported bit depth ${bitDepth} (only 8 supported)`);
      }
      if (colorType !== 0 && colorType !== 2 && colorType !== 6) {
        throw new Error(`PNG: unsupported color type ${colorType} (only 0, 2, 6 supported)`);
      }
    } else if (type === 'IDAT') {
      idatChunks.push(chunkData);
    } else if (type === 'IEND') {
      break;
    }

    pos += 12 + chunkLen; // 4 length + 4 type + data + 4 CRC
  }

  if (!hasIHDR) throw new Error('PNG: missing IHDR chunk');
  if (idatChunks.length === 0) throw new Error('PNG: missing IDAT chunk');

  // Concatenate IDAT chunks
  const totalIdatLen = idatChunks.reduce((sum, c) => sum + c.length, 0);
  const compressedData = new Uint8Array(totalIdatLen);
  let offset = 0;
  for (const chunk of idatChunks) {
    compressedData.set(chunk, offset);
    offset += chunk.length;
  }

  // Decompress
  const rawData = inflate(compressedData);

  // Determine bytes per pixel for the source format
  const srcBpp = colorType === 6 ? 4 : colorType === 2 ? 3 : 1;
  const srcRowBytes = width * srcBpp;

  // Un-filter scanlines
  const rawPixels = new Uint8Array(height * srcRowBytes);

  for (let y = 0; y < height; y++) {
    const filterType = rawData[y * (1 + srcRowBytes)];
    const srcStart = y * (1 + srcRowBytes) + 1;
    const dstStart = y * srcRowBytes;

    for (let x = 0; x < srcRowBytes; x++) {
      const raw = rawData[srcStart + x];
      const a = x >= srcBpp ? rawPixels[dstStart + x - srcBpp] : 0; // left
      const b = y > 0 ? rawPixels[dstStart - srcRowBytes + x] : 0; // above
      const c = y > 0 && x >= srcBpp ? rawPixels[dstStart - srcRowBytes + x - srcBpp] : 0; // upper-left

      let value: number;
      switch (filterType) {
        case 0: value = raw; break;                            // None
        case 1: value = (raw + a) & 0xff; break;               // Sub
        case 2: value = (raw + b) & 0xff; break;               // Up
        case 3: value = (raw + ((a + b) >>> 1)) & 0xff; break; // Average
        case 4: value = (raw + paeth(a, b, c)) & 0xff; break;  // Paeth
        default: throw new Error(`PNG: unsupported filter type ${filterType}`);
      }
      rawPixels[dstStart + x] = value;
    }
  }

  // Convert to RGBA if needed
  if (colorType === 6) {
    // Already RGBA
    return { width, height, pixels: rawPixels };
  }

  const pixels = new Uint8Array(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    if (colorType === 2) {
      // RGB → RGBA
      pixels[i * 4] = rawPixels[i * 3];
      pixels[i * 4 + 1] = rawPixels[i * 3 + 1];
      pixels[i * 4 + 2] = rawPixels[i * 3 + 2];
      pixels[i * 4 + 3] = 255;
    } else {
      // Grayscale → RGBA
      const v = rawPixels[i];
      pixels[i * 4] = v;
      pixels[i * 4 + 1] = v;
      pixels[i * 4 + 2] = v;
      pixels[i * 4 + 3] = 255;
    }
  }

  return { width, height, pixels };
}
