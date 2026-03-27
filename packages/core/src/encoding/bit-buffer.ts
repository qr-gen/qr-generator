export class BitBuffer {
  private buffer: number[] = [];
  private length = 0;

  put(value: number, numBits: number): void {
    for (let i = numBits - 1; i >= 0; i--) {
      this.buffer[this.length] = (value >>> i) & 1;
      this.length++;
    }
  }

  getBit(index: number): number {
    return this.buffer[index];
  }

  getLengthInBits(): number {
    return this.length;
  }

  getBytes(): Uint8Array {
    const byteCount = Math.ceil(this.length / 8);
    const bytes = new Uint8Array(byteCount);
    for (let i = 0; i < this.length; i++) {
      if (this.buffer[i]) {
        bytes[i >> 3] |= 0x80 >> (i & 7);
      }
    }
    return bytes;
  }
}
