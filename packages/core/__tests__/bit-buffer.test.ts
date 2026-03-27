import { describe, it, expect } from 'vitest';
import { BitBuffer } from '../src/encoding/bit-buffer';

describe('BitBuffer', () => {
  it('starts empty', () => {
    const buf = new BitBuffer();
    expect(buf.getLengthInBits()).toBe(0);
    expect(buf.getBytes()).toEqual(new Uint8Array(0));
  });

  it('puts a single bit', () => {
    const buf = new BitBuffer();
    buf.put(1, 1);
    expect(buf.getLengthInBits()).toBe(1);
    // 1 followed by 7 zero padding bits = 0b10000000 = 128
    expect(buf.getBytes()).toEqual(new Uint8Array([0b10000000]));
  });

  it('puts multiple bits', () => {
    const buf = new BitBuffer();
    buf.put(0b1010, 4);
    expect(buf.getLengthInBits()).toBe(4);
    // 1010 followed by 4 zero padding = 0b10100000 = 160
    expect(buf.getBytes()).toEqual(new Uint8Array([0b10100000]));
  });

  it('puts exactly 8 bits', () => {
    const buf = new BitBuffer();
    buf.put(0b11001010, 8);
    expect(buf.getLengthInBits()).toBe(8);
    expect(buf.getBytes()).toEqual(new Uint8Array([0b11001010]));
  });

  it('puts bits across byte boundary', () => {
    const buf = new BitBuffer();
    buf.put(0b1111, 4); // first 4 bits
    buf.put(0b00001111, 8); // next 8 bits
    expect(buf.getLengthInBits()).toBe(12);
    // 1111 0000 1111 0000 (padded)
    expect(buf.getBytes()).toEqual(new Uint8Array([0b11110000, 0b11110000]));
  });

  it('puts 0 bits (no-op)', () => {
    const buf = new BitBuffer();
    buf.put(0, 0);
    expect(buf.getLengthInBits()).toBe(0);
  });

  it('handles 16-bit value', () => {
    const buf = new BitBuffer();
    buf.put(0xABCD, 16);
    expect(buf.getLengthInBits()).toBe(16);
    expect(buf.getBytes()).toEqual(new Uint8Array([0xAB, 0xCD]));
  });

  it('accumulates multiple puts', () => {
    const buf = new BitBuffer();
    buf.put(0b0001, 4); // mode indicator for numeric
    buf.put(0b0000001000, 10); // char count = 8
    expect(buf.getLengthInBits()).toBe(14);
  });

  it('pads final byte with zeros', () => {
    const buf = new BitBuffer();
    buf.put(0b111, 3);
    // 111 + 00000 padding = 0b11100000 = 224
    expect(buf.getBytes()).toEqual(new Uint8Array([0b11100000]));
  });

  it('getBit returns correct values', () => {
    const buf = new BitBuffer();
    buf.put(0b10110, 5);
    expect(buf.getBit(0)).toBe(1);
    expect(buf.getBit(1)).toBe(0);
    expect(buf.getBit(2)).toBe(1);
    expect(buf.getBit(3)).toBe(1);
    expect(buf.getBit(4)).toBe(0);
  });
});
