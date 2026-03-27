import { describe, it, expect } from 'vitest';
import { selectMode } from '../src/encoding/mode-selector';

describe('selectMode', () => {
  it('selects numeric for digit-only strings', () => {
    expect(selectMode('0123456789')).toBe('numeric');
    expect(selectMode('0')).toBe('numeric');
  });

  it('selects alphanumeric for uppercase + digits + special chars', () => {
    expect(selectMode('HELLO WORLD')).toBe('alphanumeric');
    expect(selectMode('HELLO123')).toBe('alphanumeric');
    expect(selectMode('A')).toBe('alphanumeric');
    expect(selectMode('$%*+-./:')).toBe('alphanumeric');
  });

  it('selects byte for lowercase', () => {
    expect(selectMode('hello')).toBe('byte');
    expect(selectMode('Hello')).toBe('byte');
  });

  it('selects byte for non-ASCII', () => {
    expect(selectMode('café')).toBe('byte');
  });

  it('selects byte for special characters not in alphanumeric set', () => {
    expect(selectMode('hello@world.com')).toBe('byte');
    expect(selectMode('http://example.com')).toBe('byte');
  });

  it('selects numeric for empty string', () => {
    // Empty string can be encoded in any mode; numeric is most efficient
    expect(selectMode('')).toBe('numeric');
  });
});
