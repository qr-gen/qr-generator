import { CHAR_COUNT_BITS, getVersionGroup } from '../types';
import type { BitBuffer } from './bit-buffer';

const ALPHANUMERIC_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';

function charValue(c: string): number {
  const index = ALPHANUMERIC_CHARS.indexOf(c);
  if (index === -1) throw new Error(`Invalid alphanumeric character: ${c}`);
  return index;
}

export class AlphanumericEncoder {
  readonly mode = 'alphanumeric' as const;
  readonly modeIndicator = 0b0010;

  canEncode(data: string): boolean {
    for (const c of data) {
      if (ALPHANUMERIC_CHARS.indexOf(c) === -1) return false;
    }
    return true;
  }

  getCharCountBits(version: number): number {
    return CHAR_COUNT_BITS.alphanumeric[getVersionGroup(version)];
  }

  getDataLength(data: string): number {
    return data.length;
  }

  encode(data: string, buffer: BitBuffer): void {
    let i = 0;
    // Process pairs of characters -> 11 bits each
    while (i + 1 < data.length) {
      const value = charValue(data[i]) * 45 + charValue(data[i + 1]);
      buffer.put(value, 11);
      i += 2;
    }
    // Remainder of 1 character -> 6 bits
    if (i < data.length) {
      buffer.put(charValue(data[i]), 6);
    }
  }
}
