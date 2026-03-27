import { generatorPolynomial, polyMod } from './polynomial';

/**
 * Generate error correction codewords for a block of data.
 * @param data - Data codewords
 * @param ecCount - Number of EC codewords to generate
 * @returns EC codewords
 */
export function generateECCodewords(data: Uint8Array, ecCount: number): Uint8Array {
  const gen = generatorPolynomial(ecCount);

  // Create message polynomial: data * x^ecCount (pad with ecCount zeros)
  const msgPoly = new Array(data.length + ecCount).fill(0);
  for (let i = 0; i < data.length; i++) {
    msgPoly[i] = data[i];
  }

  // Remainder of division = EC codewords
  const remainder = polyMod(msgPoly, gen);
  return new Uint8Array(remainder);
}
