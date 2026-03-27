import { CHAR_COUNT_BITS, getVersionGroup } from '../types';
import type { BitBuffer } from './bit-buffer';

export class ByteEncoder {
  readonly mode = 'byte' as const;
  readonly modeIndicator = 0b0100;

  canEncode(_data: string): boolean {
    return true; // byte mode can encode any string
  }

  getCharCountBits(version: number): number {
    return CHAR_COUNT_BITS.byte[getVersionGroup(version)];
  }

  getDataLength(data: string): number {
    return new TextEncoder().encode(data).length;
  }

  encode(data: string, buffer: BitBuffer): void {
    const bytes = new TextEncoder().encode(data);
    for (const byte of bytes) {
      buffer.put(byte, 8);
    }
  }
}
