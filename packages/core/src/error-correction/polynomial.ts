import { gf256 } from './gf256';

/**
 * Multiply two polynomials over GF(256).
 * Polynomials are represented as coefficient arrays from highest to lowest degree.
 * e.g., [1, 3, 2] represents x^2 + 3x + 2
 */
export function polyMultiply(a: number[], b: number[]): number[] {
  const result = new Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      result[i + j] ^= gf256.multiply(a[i], b[j]);
    }
  }
  return result;
}

/**
 * Compute the remainder of polynomial division: dividend mod divisor.
 * Used for Reed-Solomon encoding.
 */
export function polyMod(dividend: number[], divisor: number[]): number[] {
  const result = Array.from(dividend);
  for (let i = 0; i < dividend.length - divisor.length + 1; i++) {
    if (result[i] === 0) continue;
    const coeff = result[i];
    for (let j = 1; j < divisor.length; j++) {
      result[i + j] ^= gf256.multiply(divisor[j], coeff);
    }
  }
  // Remainder is the last (divisor.length - 1) coefficients
  return result.slice(dividend.length - divisor.length + 1);
}

// Cache for generator polynomials
const generatorCache = new Map<number, number[]>();

/**
 * Generate the generator polynomial for `degree` error correction codewords.
 * g(x) = (x - alpha^0)(x - alpha^1)...(x - alpha^(degree-1))
 * In GF(256), subtraction = addition = XOR, so (x - alpha^i) = (x + alpha^i)
 */
export function generatorPolynomial(degree: number): number[] {
  const cached = generatorCache.get(degree);
  if (cached) return cached;

  let poly = [1];
  for (let i = 0; i < degree; i++) {
    poly = polyMultiply(poly, [1, gf256.exp(i)]);
  }

  generatorCache.set(degree, poly);
  return poly;
}
