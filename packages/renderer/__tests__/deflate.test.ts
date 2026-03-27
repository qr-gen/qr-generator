import { describe, it, expect } from 'vitest';
import { adler32, zlibCompress } from '../src/png/deflate.js';

describe('adler32', () => {
  it('returns 1 for empty input', () => {
    expect(adler32(new Uint8Array([]))).toBe(1);
  });

  it('computes correct checksum for "Wikipedia" (0x11E60398)', () => {
    const data = new TextEncoder().encode('Wikipedia');
    expect(adler32(data)).toBe(0x11e60398);
  });

  it('computes correct checksum for a single byte', () => {
    // For byte value 0x01: s1 = 1 + 1 = 2, s2 = 0 + 2 = 2, result = (2 << 16) | 2 = 0x00020002
    expect(adler32(new Uint8Array([0x01]))).toBe(0x00020002);
  });

  it('computes correct checksum for all-zero bytes', () => {
    // For 4 zero bytes: s1 stays 1, s2 = 0 + 1 + 1 + 1 + 1 = 4
    // result = (4 << 16) | 1 = 0x00040001
    expect(adler32(new Uint8Array([0, 0, 0, 0]))).toBe(0x00040001);
  });
});

describe('zlibCompress', () => {
  it('output starts with zlib header bytes 0x78, 0x01', () => {
    const result = zlibCompress(new Uint8Array([1, 2, 3]));
    expect(result[0]).toBe(0x78);
    expect(result[1]).toBe(0x01);
  });

  it('output ends with 4-byte Adler-32 checksum in big-endian', () => {
    const input = new Uint8Array([1, 2, 3]);
    const result = zlibCompress(input);
    const checksum = adler32(input);

    const len = result.length;
    const trailingChecksum =
      ((result[len - 4] << 24) |
        (result[len - 3] << 16) |
        (result[len - 2] << 8) |
        result[len - 1]) >>>
      0;
    expect(trailingChecksum).toBe(checksum);
  });

  it('small input (< 65535 bytes) produces a single stored block', () => {
    const input = new Uint8Array(100);
    input.fill(0xab);
    const result = zlibCompress(input);

    // After 2-byte zlib header, the first byte of the stored block should have BFINAL=1, BTYPE=00
    // That byte is 0x01 (BFINAL=1, BTYPE=0b00)
    expect(result[2]).toBe(0x01);

    // Total length: 2 (header) + 1 (block header) + 2 (LEN) + 2 (NLEN) + 100 (data) + 4 (adler32) = 111
    expect(result.length).toBe(111);
  });

  it('stored block has correct LEN and NLEN (little-endian, NLEN = ~LEN & 0xFFFF)', () => {
    const input = new Uint8Array(300);
    input.fill(0x42);
    const result = zlibCompress(input);

    // LEN at offset 3 (little-endian)
    const len = result[3] | (result[4] << 8);
    expect(len).toBe(300);

    // NLEN at offset 5 (little-endian)
    const nlen = result[5] | (result[6] << 8);
    expect(nlen).toBe(~300 & 0xffff);
  });

  it('stored block structure: BFINAL=1, BTYPE=00, LEN, NLEN, then raw data', () => {
    const input = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
    const result = zlibCompress(input);

    // Byte 2: BFINAL=1, BTYPE=00 → 0x01
    expect(result[2]).toBe(0x01);

    // LEN = 4 (LE)
    expect(result[3]).toBe(0x04);
    expect(result[4]).toBe(0x00);

    // NLEN = ~4 & 0xFFFF = 0xFFFB (LE → 0xFB, 0xFF)
    expect(result[5]).toBe(0xfb);
    expect(result[6]).toBe(0xff);

    // Raw data bytes
    expect(result[7]).toBe(0xde);
    expect(result[8]).toBe(0xad);
    expect(result[9]).toBe(0xbe);
    expect(result[10]).toBe(0xef);
  });

  it('empty input produces valid zlib stream', () => {
    const result = zlibCompress(new Uint8Array([]));

    // Header
    expect(result[0]).toBe(0x78);
    expect(result[1]).toBe(0x01);

    // Single stored block: BFINAL=1, LEN=0, NLEN=0xFFFF
    expect(result[2]).toBe(0x01);
    expect(result[3]).toBe(0x00);
    expect(result[4]).toBe(0x00);
    expect(result[5]).toBe(0xff);
    expect(result[6]).toBe(0xff);

    // Adler-32 of empty input = 1 → big-endian 0x00000001
    expect(result[7]).toBe(0x00);
    expect(result[8]).toBe(0x00);
    expect(result[9]).toBe(0x00);
    expect(result[10]).toBe(0x01);

    expect(result.length).toBe(11);
  });

  it('large input (> 65535 bytes) produces multiple stored blocks with correct BFINAL flags', () => {
    const size = 65535 + 1000; // 66535 bytes → 2 blocks
    const input = new Uint8Array(size);
    for (let i = 0; i < size; i++) input[i] = i & 0xff;

    const result = zlibCompress(input);

    // First block at offset 2: BFINAL=0, BTYPE=00 → 0x00
    expect(result[2]).toBe(0x00);

    // First block LEN = 65535
    const len1 = result[3] | (result[4] << 8);
    expect(len1).toBe(65535);

    // First block NLEN
    const nlen1 = result[5] | (result[6] << 8);
    expect(nlen1).toBe(~65535 & 0xffff); // 0x0000

    // Second block starts at offset 2 + 1 + 2 + 2 + 65535 = 65542
    const block2Offset = 2 + 1 + 2 + 2 + 65535;
    // BFINAL=1, BTYPE=00 → 0x01
    expect(result[block2Offset]).toBe(0x01);

    // Second block LEN = 1000
    const len2 = result[block2Offset + 1] | (result[block2Offset + 2] << 8);
    expect(len2).toBe(1000);

    // Second block NLEN
    const nlen2 = result[block2Offset + 3] | (result[block2Offset + 4] << 8);
    expect(nlen2).toBe(~1000 & 0xffff);

    // Total: 2 (header) + (1+2+2+65535) + (1+2+2+1000) + 4 (adler) = 66551
    expect(result.length).toBe(2 + (1 + 2 + 2 + 65535) + (1 + 2 + 2 + 1000) + 4);
  });
});
