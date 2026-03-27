/**
 * Compute Adler-32 checksum.
 */
export function adler32(data: Uint8Array): number {
  let s1 = 1;
  let s2 = 0;
  for (let i = 0; i < data.length; i++) {
    s1 = (s1 + data[i]) % 65521;
    s2 = (s2 + s1) % 65521;
  }
  return ((s2 << 16) | s1) >>> 0;
}

/**
 * Compress data using zlib format with stored (uncompressed) deflate blocks.
 * This is the simplest valid zlib stream — no actual compression, but fully spec-compliant.
 */
export function zlibCompress(data: Uint8Array): Uint8Array {
  const MAX_BLOCK = 65535;
  const numBlocks = data.length === 0 ? 1 : Math.ceil(data.length / MAX_BLOCK);

  // Calculate total output size:
  // 2 bytes zlib header + (5 bytes block header + block data) per block + 4 bytes Adler-32
  let totalSize = 2; // CMF + FLG
  for (let i = 0; i < numBlocks; i++) {
    const start = i * MAX_BLOCK;
    const len = Math.min(MAX_BLOCK, data.length - start);
    totalSize += 5 + len; // 1 byte BFINAL+BTYPE + 2 bytes LEN + 2 bytes NLEN + data
  }
  totalSize += 4; // Adler-32

  const out = new Uint8Array(totalSize);
  let offset = 0;

  // Zlib header: CMF=0x78 (deflate, 32K window), FLG=0x01
  // 0x78 * 256 + 0x01 = 30721, 30721 % 31 = 0 ✓
  out[offset++] = 0x78;
  out[offset++] = 0x01;

  // Stored blocks
  for (let i = 0; i < numBlocks; i++) {
    const start = i * MAX_BLOCK;
    const len = Math.min(MAX_BLOCK, data.length - start);
    const isLast = i === numBlocks - 1;

    // BFINAL (1 if last) | BTYPE=00
    out[offset++] = isLast ? 0x01 : 0x00;

    // LEN (little-endian)
    out[offset++] = len & 0xff;
    out[offset++] = (len >> 8) & 0xff;

    // NLEN (one's complement of LEN, little-endian)
    const nlen = ~len & 0xffff;
    out[offset++] = nlen & 0xff;
    out[offset++] = (nlen >> 8) & 0xff;

    // Raw data
    out.set(data.subarray(start, start + len), offset);
    offset += len;
  }

  // Adler-32 checksum (big-endian)
  const checksum = adler32(data);
  out[offset++] = (checksum >> 24) & 0xff;
  out[offset++] = (checksum >> 16) & 0xff;
  out[offset++] = (checksum >> 8) & 0xff;
  out[offset++] = checksum & 0xff;

  return out;
}
