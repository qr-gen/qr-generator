import { describe, it, expect } from 'vitest';
import { ByteEncoder } from '../src/encoding/byte';
import { BitBuffer } from '../src/encoding/bit-buffer';

describe('ByteEncoder', () => {
  const encoder = new ByteEncoder();

  it('has correct mode indicator (0100 = 4)', () => {
    expect(encoder.modeIndicator).toBe(0b0100);
  });

  it('can encode any string', () => {
    expect(encoder.canEncode('Hello')).toBe(true);
    expect(encoder.canEncode('123')).toBe(true);
    expect(encoder.canEncode('')).toBe(true);
    expect(encoder.canEncode('café')).toBe(true);
  });

  it('returns correct char count bits per version group', () => {
    expect(encoder.getCharCountBits(1)).toBe(8);   // v1-9
    expect(encoder.getCharCountBits(9)).toBe(8);
    expect(encoder.getCharCountBits(10)).toBe(16);  // v10-26
    expect(encoder.getCharCountBits(26)).toBe(16);
    expect(encoder.getCharCountBits(27)).toBe(16);  // v27-40
  });

  it('encodes ASCII bytes correctly', () => {
    const buf = new BitBuffer();
    encoder.encode('Hello', buf);
    const bytes = buf.getBytes();
    // 'H'=0x48, 'e'=0x65, 'l'=0x6C, 'l'=0x6C, 'o'=0x6F
    expect(bytes[0]).toBe(0x48);
    expect(bytes[1]).toBe(0x65);
    expect(bytes[2]).toBe(0x6C);
    expect(bytes[3]).toBe(0x6C);
    expect(bytes[4]).toBe(0x6F);
    expect(buf.getLengthInBits()).toBe(40); // 5 chars * 8 bits
  });

  it('returns correct byte length for data', () => {
    expect(encoder.getDataLength('Hello')).toBe(5);
    expect(encoder.getDataLength('')).toBe(0);
  });
});
