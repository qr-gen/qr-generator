import { describe, it, expect } from 'vitest';
import { NumericEncoder } from '../src/encoding/numeric';
import { BitBuffer } from '../src/encoding/bit-buffer';

describe('NumericEncoder', () => {
  const encoder = new NumericEncoder();

  it('has correct mode indicator (0001 = 1)', () => {
    expect(encoder.modeIndicator).toBe(0b0001);
  });

  it('can encode digit-only strings', () => {
    expect(encoder.canEncode('01234567890')).toBe(true);
    expect(encoder.canEncode('0')).toBe(true);
    expect(encoder.canEncode('')).toBe(true);
  });

  it('cannot encode non-digit strings', () => {
    expect(encoder.canEncode('123A')).toBe(false);
    expect(encoder.canEncode('hello')).toBe(false);
    expect(encoder.canEncode('12.3')).toBe(false);
    expect(encoder.canEncode('12 3')).toBe(false);
  });

  it('returns correct char count bits per version group', () => {
    expect(encoder.getCharCountBits(1)).toBe(10);  // v1-9
    expect(encoder.getCharCountBits(10)).toBe(12);  // v10-26
    expect(encoder.getCharCountBits(27)).toBe(14);  // v27-40
  });

  it('encodes "01234567" correctly per ISO spec', () => {
    // "01234567" -> groups: "012"=12 (10 bits), "345"=345 (10 bits), "67"=67 (7 bits)
    // 12 = 0b0000001100, 345 = 0b0101011001, 67 = 0b1000011
    // Total: 27 bits
    const buf = new BitBuffer();
    encoder.encode('01234567', buf);
    expect(buf.getLengthInBits()).toBe(27);

    const bytes = buf.getBytes();
    // Bit stream: 0000001100 0101011001 1000011 0 (padded to 4 bytes)
    // = 00000011 00010101 10011000 01100000
    expect(bytes[0]).toBe(0b00000011);
    expect(bytes[1]).toBe(0b00010101);
    expect(bytes[2]).toBe(0b10011000);
  });

  it('encodes single digit', () => {
    const buf = new BitBuffer();
    encoder.encode('7', buf);
    expect(buf.getLengthInBits()).toBe(4); // remainder of 1 digit = 4 bits
  });

  it('encodes two digits', () => {
    const buf = new BitBuffer();
    encoder.encode('89', buf);
    expect(buf.getLengthInBits()).toBe(7); // remainder of 2 digits = 7 bits
  });

  it('returns correct data length', () => {
    expect(encoder.getDataLength('01234567')).toBe(8);
  });
});
