import { describe, it, expect } from 'vitest';
import { formatGeo } from '../../src/data-helpers/geo';

describe('formatGeo', () => {
  it('formats positive coordinates', () => {
    expect(formatGeo({ latitude: 37.7749, longitude: -122.4194 })).toBe(
      'geo:37.7749,-122.4194',
    );
  });

  it('formats negative coordinates', () => {
    expect(formatGeo({ latitude: -33.8688, longitude: 151.2093 })).toBe(
      'geo:-33.8688,151.2093',
    );
  });

  it('formats zero coordinates', () => {
    expect(formatGeo({ latitude: 0, longitude: 0 })).toBe('geo:0,0');
  });

  it('preserves decimal precision', () => {
    expect(
      formatGeo({ latitude: 51.507351, longitude: -0.127758 }),
    ).toBe('geo:51.507351,-0.127758');
  });

  it('handles integer coordinates', () => {
    expect(formatGeo({ latitude: 40, longitude: -74 })).toBe('geo:40,-74');
  });

  it('handles high-precision coordinates', () => {
    expect(
      formatGeo({ latitude: 48.858844, longitude: 2.294351 }),
    ).toBe('geo:48.858844,2.294351');
  });
});
