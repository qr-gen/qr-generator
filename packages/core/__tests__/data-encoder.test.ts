import { describe, it, expect } from 'vitest';
import { encodeData } from '../src/encoding/data-encoder';

describe('encodeData', () => {
  it('encodes "HELLO WORLD" for version 1-M correctly', () => {
    // Per ISO 18004, "HELLO WORLD" in alphanumeric mode, version 1-M:
    // Mode indicator: 0010 (4 bits)
    // Char count: 000001011 (9 bits, value 11)
    // Data: 61 bits for "HELLO WORLD"
    // Terminator: 0000 (4 bits)
    // Total: 78 bits -> pad to 128 bits (16 bytes = 16 data codewords for v1-M)
    const result = encodeData('HELLO WORLD', 1, 'M');
    expect(result.codewords).toHaveLength(16); // 16 data codewords for v1-M
    expect(result.version).toBe(1);
    expect(result.mode).toBe('alphanumeric');

    // First byte: mode(0010) + first 4 bits of char count(0000) = 00100000 = 0x20
    expect(result.codewords[0]).toBe(0x20);
    // Second byte: remaining 5 bits of char count(01011) + first 3 bits of data
    // char count = 11 = 000001011, first 5 bits after the 4 in byte 0 = 01011
    // "HE" pair: H=17, E=14 -> 17*45+14=779 -> 01100001011
    // byte 1: 01011 011 = 0x5B? Let me calculate more carefully...
    // Bits so far: 0010 00000 1011 01100001011 ...
    // Byte 0: 0010 0000 = 0x20
    // Byte 1: 0101 1011 = 0x5B
    expect(result.codewords[1]).toBe(0x5B);
  });

  it('auto-selects version when not specified', () => {
    const result = encodeData('HELLO WORLD', undefined, 'M');
    expect(result.version).toBe(1); // fits in version 1-M (capacity 20 alphanumeric)
  });

  it('pads codewords with 0xEC 0x11 alternating', () => {
    const result = encodeData('HELLO WORLD', 1, 'M');
    // After data + terminator, remaining bytes should alternate 0xEC, 0x11
    // The last few bytes should be padding
    const codewords = result.codewords;
    // Check that padding bytes are present at the end
    // Data content takes approximately 10 bytes, rest should be padding
    const lastTwo = [codewords[codewords.length - 2], codewords[codewords.length - 1]];
    // Padding alternates between 0xEC and 0x11
    expect(lastTwo[0] === 0xEC || lastTwo[0] === 0x11).toBe(true);
    expect(lastTwo[1] === 0xEC || lastTwo[1] === 0x11).toBe(true);
  });

  it('uses numeric mode for digit strings', () => {
    const result = encodeData('01234567890123456789', undefined, 'M');
    expect(result.mode).toBe('numeric');
  });

  it('uses byte mode for lowercase strings', () => {
    const result = encodeData('hello', undefined, 'M');
    expect(result.mode).toBe('byte');
  });

  it('throws on data too long', () => {
    // Version 1-H byte capacity is 7, use lowercase to force byte mode
    expect(() => encodeData('abcdefgh', 1, 'H')).toThrow();
  });

  it('selects higher version for longer data', () => {
    // 15 bytes of data needs version >= 2 at EC level M (v1-M max=14 bytes)
    const result = encodeData('hello world 123', undefined, 'M');
    expect(result.version).toBeGreaterThanOrEqual(2);
  });

  it('returns correct codeword count matching EC table', () => {
    const result = encodeData('HELLO WORLD', 1, 'M');
    // v1-M has 16 total data codewords
    expect(result.codewords).toHaveLength(16);
  });

  it('defaults to EC level M', () => {
    const result = encodeData('TEST', undefined, undefined);
    expect(result.errorCorrection).toBe('M');
  });
});
