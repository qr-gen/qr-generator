/**
 * CRC-32 implementation for PNG chunk validation.
 * Uses the standard polynomial 0xEDB88320 (reflected form).
 */

/** Pre-computed 256-entry CRC-32 lookup table. */
const TABLE = /* @__PURE__ */ buildTable();

function buildTable(): Uint32Array {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
}

/**
 * Compute the CRC-32 checksum of the given data.
 * Returns an unsigned 32-bit integer.
 */
export function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Compute the CRC-32 over a PNG chunk's type and data fields combined,
 * as required by the PNG specification (CRC covers type code + data).
 */
export function pngChunkCrc(
  chunkType: Uint8Array,
  chunkData: Uint8Array,
): number {
  let crc = 0xffffffff;
  for (let i = 0; i < chunkType.length; i++) {
    crc = TABLE[(crc ^ chunkType[i]) & 0xff] ^ (crc >>> 8);
  }
  for (let i = 0; i < chunkData.length; i++) {
    crc = TABLE[(crc ^ chunkData[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
