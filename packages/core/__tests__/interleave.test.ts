import { describe, it, expect } from 'vitest';
import { interleaveBlocks } from '../src/error-correction/interleave';

describe('interleaveBlocks', () => {
  it('single block passthrough (v1-M: 1 block of 16, 10 EC)', () => {
    const data = new Uint8Array(16).fill(0xAB);
    const result = interleaveBlocks(data, 1, 'M');
    // 16 data + 10 EC = 26 total codewords
    expect(result).toHaveLength(26);
    // First 16 bytes should be data
    for (let i = 0; i < 16; i++) {
      expect(result[i]).toBe(0xAB);
    }
  });

  it('single block v1-L: 19 data + 7 EC = 26 total', () => {
    const data = new Uint8Array(19).fill(0xCD);
    const result = interleaveBlocks(data, 1, 'L');
    expect(result).toHaveLength(26);
  });

  it('two equal blocks (v2-M: 1 block of 28, 16 EC)', () => {
    const data = new Uint8Array(28);
    for (let i = 0; i < 28; i++) data[i] = i;
    const result = interleaveBlocks(data, 2, 'M');
    // v2-M: 28 data + 16 EC = 44 total
    expect(result).toHaveLength(44);
  });

  it('multi-block with different sizes (v5-Q)', () => {
    // v5-Q: 2 blocks of 15 + 2 blocks of 16 = 62 data codewords
    // 18 EC codewords per block
    const data = new Uint8Array(62);
    for (let i = 0; i < 62; i++) data[i] = i;
    const result = interleaveBlocks(data, 5, 'Q');
    // 62 data + 4*18 EC = 62 + 72 = 134 total
    expect(result).toHaveLength(134);

    // Interleaved data: take 1 codeword from each block in sequence
    // Block 1 (15 cw): [0..14], Block 2 (15 cw): [15..29]
    // Block 3 (16 cw): [30..45], Block 4 (16 cw): [46..61]
    // Interleaved: 0, 15, 30, 46, 1, 16, 31, 47, ..., 14, 29, 44, 60, 45, 61
    expect(result[0]).toBe(0);   // Block 1, codeword 0
    expect(result[1]).toBe(15);  // Block 2, codeword 0
    expect(result[2]).toBe(30);  // Block 3, codeword 0
    expect(result[3]).toBe(46);  // Block 4, codeword 0
  });

  it('includes remainder bits for version 1 (0 bits)', () => {
    // Version 1 has 0 remainder bits
    const data = new Uint8Array(16).fill(0);
    const result = interleaveBlocks(data, 1, 'M');
    // Total codewords = 16 data + 10 EC = 26
    expect(result).toHaveLength(26);
  });

  it('output length matches expected total codewords for version', () => {
    // v7-M: 124 data codewords, 4 blocks of 31, 18 EC per block
    const data = new Uint8Array(124);
    const result = interleaveBlocks(data, 7, 'M');
    // 124 data + 4*18 EC = 124 + 72 = 196 total
    expect(result).toHaveLength(196);
  });
});
