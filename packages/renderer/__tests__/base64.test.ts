import { describe, it, expect } from 'vitest';
import { base64Encode } from '../src/utils/base64.js';

describe('base64Encode', () => {
  it('encodes "Hello" to "SGVsbG8="', () => {
    expect(base64Encode('Hello')).toBe('SGVsbG8=');
  });

  it('encodes empty string to ""', () => {
    expect(base64Encode('')).toBe('');
  });

  it('encodes "a" to "YQ=="', () => {
    expect(base64Encode('a')).toBe('YQ==');
  });

  it('encodes "ab" to "YWI="', () => {
    expect(base64Encode('ab')).toBe('YWI=');
  });

  it('encodes "abc" to "YWJj"', () => {
    expect(base64Encode('abc')).toBe('YWJj');
  });

  it('encodes Uint8Array with binary data (bytes > 127)', () => {
    const data = new Uint8Array([0, 128, 255, 1, 200, 50]);
    expect(base64Encode(data)).toBe('AID/Acgy');
  });

  it('encodes a known PNG-like binary sequence', () => {
    // PNG magic bytes: 137 80 78 71 13 10 26 10
    const pngHeader = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
    expect(base64Encode(pngHeader)).toBe('iVBORw0KGgo=');
  });

  it('encodes empty Uint8Array to ""', () => {
    expect(base64Encode(new Uint8Array([]))).toBe('');
  });
});
