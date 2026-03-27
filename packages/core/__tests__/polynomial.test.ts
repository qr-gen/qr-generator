import { describe, it, expect } from 'vitest';
import { polyMultiply, generatorPolynomial } from '../src/error-correction/polynomial';

describe('Polynomial operations', () => {
  describe('polyMultiply', () => {
    it('multiplies two simple polynomials', () => {
      // (x + alpha^0)(x + alpha^1) = x^2 + (alpha^1 + alpha^0)x + alpha^1
      // alpha^0 = 1, alpha^1 = 2
      // 1 + 2 = 3, 1*2 = 2
      // Result: [1, 3, 2] (coefficients from highest to lowest degree)
      const a = [1, 1]; // x + alpha^0
      const b = [1, 2]; // x + alpha^1
      const result = polyMultiply(a, b);
      expect(result).toEqual([1, 3, 2]);
    });
  });

  describe('generatorPolynomial', () => {
    it('degree 1: (x + alpha^0) = [1, 1]', () => {
      expect(generatorPolynomial(1)).toEqual([1, 1]);
    });

    it('degree 2: [1, 3, 2]', () => {
      expect(generatorPolynomial(2)).toEqual([1, 3, 2]);
    });

    it('degree 7 (used in v1-L)', () => {
      // Known generator polynomial coefficients for degree 7
      // g(x) = x^7 + alpha^87*x^6 + ...
      const gen = generatorPolynomial(7);
      expect(gen).toHaveLength(8); // degree 7 has 8 coefficients
      expect(gen[0]).toBe(1); // leading coefficient is always 1
    });

    it('degree 10 (used in v1-M with 10 EC codewords)', () => {
      // Known coefficients for generator polynomial of degree 10
      const gen = generatorPolynomial(10);
      expect(gen).toHaveLength(11);
      expect(gen[0]).toBe(1);
      // Known values: [1, 216, 194, 159, 111, 199, 94, 95, 113, 157, 193]
      // (alpha^0 representation of coefficients)
    });

    it('caches results', () => {
      const gen1 = generatorPolynomial(10);
      const gen2 = generatorPolynomial(10);
      expect(gen1).toBe(gen2); // same reference
    });
  });
});
