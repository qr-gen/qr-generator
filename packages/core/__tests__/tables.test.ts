import { describe, it, expect } from 'vitest';
import { VERSION_CAPACITY } from '../src/tables/version-capacity';
import { EC_BLOCKS } from '../src/tables/ec-blocks';
import { ALIGNMENT_POSITIONS } from '../src/tables/alignment-positions';

describe('VERSION_CAPACITY', () => {
  it('has 41 entries (index 0 unused + versions 1-40)', () => {
    expect(VERSION_CAPACITY).toHaveLength(41);
  });

  it('version 1-M byte capacity is 14', () => {
    expect(VERSION_CAPACITY[1].M.byte).toBe(14);
  });

  it('version 1-L numeric capacity is 41', () => {
    expect(VERSION_CAPACITY[1].L.numeric).toBe(41);
  });

  it('version 1-H byte capacity is 7', () => {
    expect(VERSION_CAPACITY[1].H.byte).toBe(7);
  });

  it('version 10-M byte capacity is 213', () => {
    expect(VERSION_CAPACITY[10].M.byte).toBe(213);
  });

  it('version 40-L byte capacity is 2953', () => {
    expect(VERSION_CAPACITY[40].L.byte).toBe(2953);
  });

  it('version 40-H numeric capacity is 3057', () => {
    expect(VERSION_CAPACITY[40].H.numeric).toBe(3057);
  });

  it('version 5-Q alphanumeric capacity is 87', () => {
    expect(VERSION_CAPACITY[5].Q.alphanumeric).toBe(87);
  });
});

describe('EC_BLOCKS', () => {
  it('has 41 entries (index 0 unused + versions 1-40)', () => {
    expect(EC_BLOCKS).toHaveLength(41);
  });

  it('version 1-M has 16 total data codewords', () => {
    expect(EC_BLOCKS[1].M.totalDataCodewords).toBe(16);
  });

  it('version 1-M has 10 EC codewords per block', () => {
    expect(EC_BLOCKS[1].M.ecCodewordsPerBlock).toBe(10);
  });

  it('version 1-M has 1 block of 16', () => {
    expect(EC_BLOCKS[1].M.groups).toEqual([{ count: 1, dataCodewords: 16 }]);
  });

  it('version 5-Q has two groups', () => {
    const info = EC_BLOCKS[5].Q;
    expect(info.groups).toHaveLength(2);
    expect(info.groups[0]).toEqual({ count: 2, dataCodewords: 15 });
    expect(info.groups[1]).toEqual({ count: 2, dataCodewords: 16 });
  });

  it('version 5-Q total data codewords matches sum of groups', () => {
    const info = EC_BLOCKS[5].Q;
    const sum = info.groups.reduce((s, g) => s + g.count * g.dataCodewords, 0);
    expect(sum).toBe(info.totalDataCodewords);
  });

  it('all versions have consistent group sums', () => {
    for (let v = 1; v <= 40; v++) {
      for (const ec of ['L', 'M', 'Q', 'H'] as const) {
        const info = EC_BLOCKS[v][ec];
        const sum = info.groups.reduce((s, g) => s + g.count * g.dataCodewords, 0);
        expect(sum).toBe(info.totalDataCodewords);
      }
    }
  });

  it('version 40-L has 2956 total data codewords', () => {
    expect(EC_BLOCKS[40].L.totalDataCodewords).toBe(2956);
  });
});

describe('ALIGNMENT_POSITIONS', () => {
  it('has 41 entries', () => {
    expect(ALIGNMENT_POSITIONS).toHaveLength(41);
  });

  it('version 1 has no alignment patterns', () => {
    expect(ALIGNMENT_POSITIONS[1]).toEqual([]);
  });

  it('version 2 has positions [6, 18]', () => {
    expect(ALIGNMENT_POSITIONS[2]).toEqual([6, 18]);
  });

  it('version 7 has positions [6, 22, 38]', () => {
    expect(ALIGNMENT_POSITIONS[7]).toEqual([6, 22, 38]);
  });

  it('version 40 has 7 position coordinates', () => {
    expect(ALIGNMENT_POSITIONS[40]).toHaveLength(7);
  });

  it('all positions start with 6', () => {
    for (let v = 2; v <= 40; v++) {
      expect(ALIGNMENT_POSITIONS[v][0]).toBe(6);
    }
  });
});
