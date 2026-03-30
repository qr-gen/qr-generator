import { describe, it, expect } from 'vitest';
import { base64Encode, base64Decode } from '../src/utils/base64.js';

describe('base64Decode', () => {
  it('decodes an empty string to empty Uint8Array', () => {
    expect(base64Decode('')).toEqual(new Uint8Array(0));
  });

  it('decodes a single byte (2 chars + 2 padding)', () => {
    // 'A' = 65 → base64 'QQ=='
    const result = base64Decode('QQ==');
    expect(result).toEqual(new Uint8Array([65]));
  });

  it('decodes two bytes (3 chars + 1 padding)', () => {
    // [65, 66] → base64 'QUI='
    const result = base64Decode('QUI=');
    expect(result).toEqual(new Uint8Array([65, 66]));
  });

  it('decodes three bytes (4 chars, no padding)', () => {
    // [65, 66, 67] → base64 'QUJD'
    const result = base64Decode('QUJD');
    expect(result).toEqual(new Uint8Array([65, 66, 67]));
  });

  it('round-trips with base64Encode for various lengths', () => {
    for (const len of [0, 1, 2, 3, 4, 5, 10, 100, 255]) {
      const original = new Uint8Array(len);
      for (let i = 0; i < len; i++) original[i] = i & 0xff;
      const encoded = base64Encode(original);
      const decoded = base64Decode(encoded);
      expect(decoded).toEqual(original);
    }
  });

  it('decodes binary data with all byte values', () => {
    const original = new Uint8Array(256);
    for (let i = 0; i < 256; i++) original[i] = i;
    const encoded = base64Encode(original);
    const decoded = base64Decode(encoded);
    expect(decoded).toEqual(original);
  });

  it('handles base64 without padding', () => {
    // Some base64 strings omit padding — decoder should handle this
    const result = base64Decode('QQ');
    expect(result).toEqual(new Uint8Array([65]));
  });

  it('decodes a known PNG data URI prefix', () => {
    // iVBORw0KGgo= is the base64 of the first 8 bytes of the PNG signature
    const result = base64Decode('iVBORw0KGgo=');
    expect(result).toEqual(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]));
  });
});
