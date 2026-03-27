import { describe, it, expect } from 'vitest';
import { gf256 } from '../src/error-correction/gf256';

describe('GF(256)', () => {
  describe('EXP_TABLE', () => {
    it('EXP[0] = 1 (alpha^0)', () => {
      expect(gf256.exp(0)).toBe(1);
    });

    it('EXP[1] = 2 (alpha^1)', () => {
      expect(gf256.exp(1)).toBe(2);
    });

    it('EXP[7] = 128 (alpha^7)', () => {
      expect(gf256.exp(7)).toBe(128);
    });

    it('EXP[8] = 29 (256 XOR 285 = 29)', () => {
      // 2^8 = 256, 256 XOR 0x11D(285) = 29
      expect(gf256.exp(8)).toBe(29);
    });

    it('EXP[255] = 1 (alpha^255 = 1 in GF(256))', () => {
      expect(gf256.exp(255)).toBe(1);
    });
  });

  describe('LOG_TABLE', () => {
    it('LOG[1] = 0', () => {
      expect(gf256.log(1)).toBe(0);
    });

    it('LOG[2] = 1', () => {
      expect(gf256.log(2)).toBe(1);
    });

    it('LOG[128] = 7', () => {
      expect(gf256.log(128)).toBe(7);
    });

    it('LOG[29] = 8', () => {
      expect(gf256.log(29)).toBe(8);
    });
  });

  describe('multiply', () => {
    it('multiply(0, x) = 0', () => {
      expect(gf256.multiply(0, 100)).toBe(0);
      expect(gf256.multiply(0, 0)).toBe(0);
    });

    it('multiply(x, 0) = 0', () => {
      expect(gf256.multiply(100, 0)).toBe(0);
    });

    it('multiply(1, x) = x', () => {
      expect(gf256.multiply(1, 42)).toBe(42);
      expect(gf256.multiply(1, 255)).toBe(255);
    });

    it('is commutative', () => {
      for (let i = 1; i < 256; i += 17) {
        for (let j = 1; j < 256; j += 19) {
          expect(gf256.multiply(i, j)).toBe(gf256.multiply(j, i));
        }
      }
    });

    it('multiply(2, 2) = 4', () => {
      expect(gf256.multiply(2, 2)).toBe(4);
    });

    it('multiply(a, inverse(a)) = 1 for sample values', () => {
      for (const a of [2, 42, 100, 200, 255]) {
        expect(gf256.multiply(a, gf256.inverse(a))).toBe(1);
      }
    });
  });

  describe('inverse', () => {
    it('inverse(a) * a = 1 for all nonzero a', () => {
      for (let a = 1; a < 256; a++) {
        const inv = gf256.inverse(a);
        expect(gf256.multiply(a, inv)).toBe(1);
      }
    });

    it('inverse(1) = 1', () => {
      expect(gf256.inverse(1)).toBe(1);
    });
  });

  describe('power', () => {
    it('power(2, 0) = 1', () => {
      expect(gf256.power(2, 0)).toBe(1);
    });

    it('power(2, 8) = 29', () => {
      // alpha^1 = 2, (alpha^1)^8 = alpha^8 = 29
      expect(gf256.power(2, 8)).toBe(29);
    });
  });
});
