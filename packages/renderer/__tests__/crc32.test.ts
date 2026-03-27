import { describe, it, expect } from 'vitest';
import { crc32, pngChunkCrc } from '../src/png/crc32.js';

describe('crc32', () => {
  it('returns 0x00000000 for empty input', () => {
    expect(crc32(new Uint8Array([]))).toBe(0x00000000);
  });

  it('computes correct CRC-32 for ASCII "123456789" (check value 0xCBF43926)', () => {
    const data = new TextEncoder().encode('123456789');
    expect(crc32(data)).toBe(0xcbf43926);
  });

  it('computes correct CRC-32 for single byte 0x00', () => {
    expect(crc32(new Uint8Array([0x00]))).toBe(0xd202ef8d);
  });

  it('computes correct CRC-32 for single byte 0xff', () => {
    expect(crc32(new Uint8Array([0xff]))).toBe(0xff000000);
  });

  it('computes correct CRC-32 for ASCII "IEND"', () => {
    const data = new TextEncoder().encode('IEND');
    expect(crc32(data)).toBe(0xae426082);
  });

  it('computes correct CRC-32 for ASCII "IHDR"', () => {
    const data = new TextEncoder().encode('IHDR');
    expect(crc32(data)).toBe(0xa8a1ae0a);
  });

  it('computes correct CRC-32 for ASCII "IDAT"', () => {
    const data = new TextEncoder().encode('IDAT');
    expect(crc32(data)).toBe(0x35af061e);
  });
});

describe('pngChunkCrc', () => {
  it('computes CRC over chunk type + chunk data combined', () => {
    const chunkType = new TextEncoder().encode('IEND');
    const chunkData = new Uint8Array([]);
    // IEND chunk has no data, so CRC is just CRC of "IEND"
    expect(pngChunkCrc(chunkType, chunkData)).toBe(0xae426082);
  });

  it('computes CRC over type + data as a single contiguous buffer', () => {
    const chunkType = new TextEncoder().encode('tEXt');
    const chunkData = new TextEncoder().encode('Hello');
    // Should equal crc32 of the concatenation of "tEXt" + "Hello"
    const combined = new Uint8Array([...chunkType, ...chunkData]);
    expect(pngChunkCrc(chunkType, chunkData)).toBe(crc32(combined));
  });

  it('matches crc32 of concatenated bytes for IHDR with sample data', () => {
    const chunkType = new TextEncoder().encode('IHDR');
    // 13-byte IHDR data: width=1, height=1, bitDepth=8, colorType=2, compression=0, filter=0, interlace=0
    const chunkData = new Uint8Array([
      0x00, 0x00, 0x00, 0x01, // width
      0x00, 0x00, 0x00, 0x01, // height
      0x08,                   // bit depth
      0x02,                   // color type (truecolor)
      0x00,                   // compression
      0x00,                   // filter
      0x00,                   // interlace
    ]);
    const combined = new Uint8Array([...chunkType, ...chunkData]);
    expect(pngChunkCrc(chunkType, chunkData)).toBe(crc32(combined));
  });
});
