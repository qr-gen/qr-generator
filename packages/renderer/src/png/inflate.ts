import { adler32 } from './deflate.js';

/**
 * Minimal RFC 1951 inflate (decompression) implementation.
 * Handles stored blocks, fixed Huffman, and dynamic Huffman.
 * Input must be a valid zlib stream (2-byte header + deflate blocks + 4-byte Adler-32).
 */

/** A Huffman tree node represented as a flat lookup table. */
interface HuffmanTable {
  /** Map of (code, codeBitLength) → symbol */
  symbols: Map<number, number>;
  maxBits: number;
}

class BitReader {
  private data: Uint8Array;
  private pos: number; // byte position
  private bitBuf: number;
  private bitCount: number;

  constructor(data: Uint8Array, startPos: number) {
    this.data = data;
    this.pos = startPos;
    this.bitBuf = 0;
    this.bitCount = 0;
  }

  readBits(n: number): number {
    while (this.bitCount < n) {
      if (this.pos >= this.data.length) throw new Error('Inflate: unexpected end of data');
      this.bitBuf |= this.data[this.pos++] << this.bitCount;
      this.bitCount += 8;
    }
    const val = this.bitBuf & ((1 << n) - 1);
    this.bitBuf >>>= n;
    this.bitCount -= n;
    return val;
  }

  /** Align to byte boundary (discard remaining bits in current byte) */
  alignToByte(): void {
    this.bitBuf = 0;
    this.bitCount = 0;
  }

  readByte(): number {
    if (this.pos >= this.data.length) throw new Error('Inflate: unexpected end of data');
    return this.data[this.pos++];
  }

  /** Decode a symbol using a Huffman table by reading one bit at a time */
  readSymbol(table: HuffmanTable): number {
    let code = 0;
    let len = 0;
    for (let i = 0; i < table.maxBits; i++) {
      code = (code << 1) | this.readBits(1);
      len++;
      const key = (len << 16) | code;
      const sym = table.symbols.get(key);
      if (sym !== undefined) return sym;
    }
    throw new Error('Inflate: invalid Huffman code');
  }
}

/** Build a Huffman table from an array of code lengths. */
function buildHuffmanTable(codeLengths: number[]): HuffmanTable {
  const symbols = new Map<number, number>();
  let maxBits = 0;

  // Count code lengths
  const maxLen = Math.max(...codeLengths, 1);
  const blCount = new Array(maxLen + 1).fill(0);
  for (const len of codeLengths) {
    if (len > 0) blCount[len]++;
  }

  // Compute first code for each length
  const nextCode = new Array(maxLen + 1).fill(0);
  let code = 0;
  for (let bits = 1; bits <= maxLen; bits++) {
    code = (code + blCount[bits - 1]) << 1;
    nextCode[bits] = code;
  }

  // Assign codes to symbols
  for (let n = 0; n < codeLengths.length; n++) {
    const len = codeLengths[n];
    if (len > 0) {
      const key = (len << 16) | nextCode[len];
      symbols.set(key, n);
      nextCode[len]++;
      if (len > maxBits) maxBits = len;
    }
  }

  return { symbols, maxBits };
}

/** Fixed Huffman literal/length code lengths (RFC 1951 section 3.2.6) */
function getFixedLitLenLengths(): number[] {
  const lengths = new Array(288);
  for (let i = 0; i <= 143; i++) lengths[i] = 8;
  for (let i = 144; i <= 255; i++) lengths[i] = 9;
  for (let i = 256; i <= 279; i++) lengths[i] = 7;
  for (let i = 280; i <= 287; i++) lengths[i] = 8;
  return lengths;
}

/** Fixed Huffman distance code lengths */
function getFixedDistLengths(): number[] {
  return new Array(32).fill(5);
}

// Length base values and extra bits (codes 257-285)
const LENGTH_BASE = [
  3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
  35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258,
];
const LENGTH_EXTRA = [
  0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2,
  3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0,
];

// Distance base values and extra bits (codes 0-29)
const DIST_BASE = [
  1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
  257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577,
];
const DIST_EXTRA = [
  0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6,
  7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13,
];

// Code length alphabet order for dynamic Huffman
const CL_ORDER = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];

function inflateBlock(
  reader: BitReader,
  litLenTable: HuffmanTable,
  distTable: HuffmanTable,
  output: number[],
): void {
  for (;;) {
    const sym = reader.readSymbol(litLenTable);
    if (sym < 256) {
      output.push(sym);
    } else if (sym === 256) {
      break; // end of block
    } else {
      // Length/distance pair
      const lenIdx = sym - 257;
      const length = LENGTH_BASE[lenIdx] + reader.readBits(LENGTH_EXTRA[lenIdx]);

      const distSym = reader.readSymbol(distTable);
      const distance = DIST_BASE[distSym] + reader.readBits(DIST_EXTRA[distSym]);

      // Copy from output history
      const start = output.length - distance;
      for (let i = 0; i < length; i++) {
        output.push(output[start + i]);
      }
    }
  }
}

/**
 * Decompress a zlib-wrapped deflate stream.
 * @param data - Complete zlib stream (header + deflate blocks + Adler-32 checksum)
 * @returns Decompressed data
 */
export function inflate(data: Uint8Array): Uint8Array {
  if (data.length < 6) throw new Error('Inflate: data too short for zlib stream');

  // Verify zlib header
  const cmf = data[0];
  const flg = data[1];
  if ((cmf * 256 + flg) % 31 !== 0) throw new Error('Inflate: invalid zlib header checksum');
  if ((cmf & 0x0f) !== 8) throw new Error('Inflate: unsupported compression method');

  const reader = new BitReader(data, 2);
  const output: number[] = [];

  let bfinal = 0;
  do {
    bfinal = reader.readBits(1);
    const btype = reader.readBits(2);

    if (btype === 0) {
      // Stored (uncompressed) block
      reader.alignToByte();
      const len = reader.readByte() | (reader.readByte() << 8);
      const nlen = reader.readByte() | (reader.readByte() << 8);
      if ((len ^ nlen) !== 0xffff) throw new Error('Inflate: invalid stored block lengths');
      for (let i = 0; i < len; i++) {
        output.push(reader.readByte());
      }
    } else if (btype === 1) {
      // Fixed Huffman
      const litLenTable = buildHuffmanTable(getFixedLitLenLengths());
      const distTable = buildHuffmanTable(getFixedDistLengths());
      inflateBlock(reader, litLenTable, distTable, output);
    } else if (btype === 2) {
      // Dynamic Huffman
      const hlit = reader.readBits(5) + 257;
      const hdist = reader.readBits(5) + 1;
      const hclen = reader.readBits(4) + 4;

      // Read code length code lengths
      const clLengths = new Array(19).fill(0);
      for (let i = 0; i < hclen; i++) {
        clLengths[CL_ORDER[i]] = reader.readBits(3);
      }
      const clTable = buildHuffmanTable(clLengths);

      // Decode literal/length + distance code lengths
      const totalCodes = hlit + hdist;
      const codeLengths: number[] = [];
      while (codeLengths.length < totalCodes) {
        const sym = reader.readSymbol(clTable);
        if (sym < 16) {
          codeLengths.push(sym);
        } else if (sym === 16) {
          const repeat = reader.readBits(2) + 3;
          const prev = codeLengths[codeLengths.length - 1];
          for (let i = 0; i < repeat; i++) codeLengths.push(prev);
        } else if (sym === 17) {
          const repeat = reader.readBits(3) + 3;
          for (let i = 0; i < repeat; i++) codeLengths.push(0);
        } else if (sym === 18) {
          const repeat = reader.readBits(7) + 11;
          for (let i = 0; i < repeat; i++) codeLengths.push(0);
        }
      }

      const litLenTable = buildHuffmanTable(codeLengths.slice(0, hlit));
      const distTable = buildHuffmanTable(codeLengths.slice(hlit, hlit + hdist));
      inflateBlock(reader, litLenTable, distTable, output);
    } else {
      throw new Error('Inflate: invalid block type 3');
    }
  } while (!bfinal);

  const result = new Uint8Array(output);

  // Verify Adler-32
  const stored =
    ((data[data.length - 4] << 24) |
      (data[data.length - 3] << 16) |
      (data[data.length - 2] << 8) |
      data[data.length - 1]) >>> 0;
  const computed = adler32(result);
  if (stored !== computed) throw new Error('Inflate: Adler-32 checksum mismatch');

  return result;
}
