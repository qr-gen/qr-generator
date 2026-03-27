import { describe, it, expect } from 'vitest';
import { AlphanumericEncoder } from '../src/encoding/alphanumeric';
import { BitBuffer } from '../src/encoding/bit-buffer';

describe('AlphanumericEncoder', () => {
  const encoder = new AlphanumericEncoder();

  it('has correct mode indicator (0010 = 2)', () => {
    expect(encoder.modeIndicator).toBe(0b0010);
  });

  it('can encode valid alphanumeric strings', () => {
    expect(encoder.canEncode('HELLO WORLD')).toBe(true);
    expect(encoder.canEncode('0123456789')).toBe(true);
    expect(encoder.canEncode('ABCDEFGHIJKLMNOPQRSTUVWXYZ')).toBe(true);
    expect(encoder.canEncode(' $%*+-./:')).toBe(true);
    expect(encoder.canEncode('')).toBe(true);
  });

  it('cannot encode lowercase', () => {
    expect(encoder.canEncode('hello')).toBe(false);
    expect(encoder.canEncode('Hello')).toBe(false);
  });

  it('cannot encode unsupported characters', () => {
    expect(encoder.canEncode('HELLO!')).toBe(false);
    expect(encoder.canEncode('A@B')).toBe(false);
  });

  it('returns correct char count bits per version group', () => {
    expect(encoder.getCharCountBits(1)).toBe(9);   // v1-9
    expect(encoder.getCharCountBits(10)).toBe(11);  // v10-26
    expect(encoder.getCharCountBits(27)).toBe(13);  // v27-40
  });

  it('encodes "HELLO WORLD" correctly per ISO spec', () => {
    // H=17, E=14 -> 17*45+14=779 -> 11 bits: 01100001011
    // L=21, L=21 -> 21*45+21=966 -> 11 bits: 01111000110
    // O=24, (space)=36 -> 24*45+36=1116 -> 11 bits: 10001011100
    // W=32, O=24 -> 32*45+24=1464 -> 11 bits: 10110111000
    // R=27, L=21 -> 27*45+21=1236 -> 11 bits: 10011010100
    // D=13 -> 6 bits: 001101
    // Total: 5*11 + 6 = 61 bits
    const buf = new BitBuffer();
    encoder.encode('HELLO WORLD', buf);
    expect(buf.getLengthInBits()).toBe(61);
  });

  it('encodes pairs into 11-bit values', () => {
    // "AC" -> A=10, C=12 -> 10*45+12=462 -> 11 bits
    const buf = new BitBuffer();
    encoder.encode('AC', buf);
    expect(buf.getLengthInBits()).toBe(11);
  });

  it('encodes single char remainder into 6 bits', () => {
    const buf = new BitBuffer();
    encoder.encode('A', buf);
    expect(buf.getLengthInBits()).toBe(6);
  });

  it('returns correct data length', () => {
    expect(encoder.getDataLength('HELLO WORLD')).toBe(11);
  });
});
