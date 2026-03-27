import { CHAR_COUNT_BITS, getVersionGroup } from '../types';
import type { BitBuffer } from './bit-buffer';

export class NumericEncoder {
  readonly mode = 'numeric' as const;
  readonly modeIndicator = 0b0001;

  canEncode(data: string): boolean {
    return /^\d*$/.test(data);
  }

  getCharCountBits(version: number): number {
    return CHAR_COUNT_BITS.numeric[getVersionGroup(version)];
  }

  getDataLength(data: string): number {
    return data.length;
  }

  encode(data: string, buffer: BitBuffer): void {
    let i = 0;
    // Process groups of 3 digits -> 10 bits each
    while (i + 2 < data.length) {
      const group = parseInt(data.substring(i, i + 3), 10);
      buffer.put(group, 10);
      i += 3;
    }
    // Remainder of 2 digits -> 7 bits
    if (data.length - i === 2) {
      const group = parseInt(data.substring(i, i + 2), 10);
      buffer.put(group, 7);
    }
    // Remainder of 1 digit -> 4 bits
    else if (data.length - i === 1) {
      const group = parseInt(data.substring(i, i + 1), 10);
      buffer.put(group, 4);
    }
  }
}
