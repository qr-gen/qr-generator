import { describe, it, expect } from 'vitest';
import { generateECCodewords } from '../src/error-correction/reed-solomon';
import { encodeData } from '../src/encoding/data-encoder';

describe('Reed-Solomon', () => {
  it('generates correct number of EC codewords', () => {
    const data = new Uint8Array([32, 91, 11, 120, 209, 114, 220, 77, 67, 64, 236, 17, 236, 17, 236, 17]);
    const ec = generateECCodewords(data, 10);
    expect(ec).toHaveLength(10);
  });

  it('generates EC codewords for version 1-M "HELLO WORLD"', () => {
    // First encode the data to get codewords
    const encoded = encodeData('HELLO WORLD', 1, 'M');
    // v1-M has 10 EC codewords per block
    const ec = generateECCodewords(encoded.codewords, 10);
    expect(ec).toHaveLength(10);
    // EC codewords should be non-trivial (not all zeros)
    const sum = ec.reduce((a, b) => a + b, 0);
    expect(sum).toBeGreaterThan(0);
  });

  it('generates deterministic output', () => {
    const data = new Uint8Array([1, 2, 3, 4, 5]);
    const ec1 = generateECCodewords(data, 5);
    const ec2 = generateECCodewords(data, 5);
    expect(ec1).toEqual(ec2);
  });

  it('different data produces different EC codewords', () => {
    const data1 = new Uint8Array([1, 2, 3, 4, 5]);
    const data2 = new Uint8Array([5, 4, 3, 2, 1]);
    const ec1 = generateECCodewords(data1, 5);
    const ec2 = generateECCodewords(data2, 5);
    expect(ec1).not.toEqual(ec2);
  });

  it('handles single block (version 1)', () => {
    const data = new Uint8Array(19).fill(0xEC); // v1-L: 19 data codewords
    const ec = generateECCodewords(data, 7); // v1-L: 7 EC codewords
    expect(ec).toHaveLength(7);
  });
});
