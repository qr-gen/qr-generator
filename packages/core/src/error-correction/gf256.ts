// Galois Field GF(256) arithmetic for QR code Reed-Solomon encoding
// Primitive polynomial: x^8 + x^4 + x^3 + x^2 + 1 = 0x11D (285)

const EXP_TABLE = new Uint8Array(256);
const LOG_TABLE = new Uint8Array(256);

// Generate lookup tables
(function initTables() {
  let x = 1;
  for (let i = 0; i < 256; i++) {
    EXP_TABLE[i] = x;
    LOG_TABLE[x] = i;
    x <<= 1; // x = x * 2
    if (x >= 256) {
      x ^= 0x11D; // reduce by primitive polynomial
    }
  }
  // LOG[1] was overwritten to 255 on the last iteration (EXP[255]=1).
  // Restore it: log(1) = 0 because alpha^0 = 1.
  LOG_TABLE[1] = 0;
})();

export const gf256 = {
  exp(i: number): number {
    return EXP_TABLE[i % 255];
  },

  log(a: number): number {
    if (a === 0) throw new Error('log(0) is undefined in GF(256)');
    return LOG_TABLE[a];
  },

  multiply(a: number, b: number): number {
    if (a === 0 || b === 0) return 0;
    return EXP_TABLE[(LOG_TABLE[a] + LOG_TABLE[b]) % 255];
  },

  inverse(a: number): number {
    if (a === 0) throw new Error('inverse(0) is undefined in GF(256)');
    return EXP_TABLE[255 - LOG_TABLE[a]];
  },

  power(a: number, n: number): number {
    if (n === 0) return 1;
    if (a === 0) return 0;
    return EXP_TABLE[(LOG_TABLE[a] * n) % 255];
  },
};
