import { describe, it, expect } from 'vitest';
import { QRError, DataTooLongError, InvalidVersionError, InvalidInputError } from '../src/errors';

describe('QRError', () => {
  it('creates error with code, message, and suggestion', () => {
    const err = new QRError('TEST', 'something went wrong', 'try something else');
    expect(err.name).toBe('QRError');
    expect(err.code).toBe('TEST');
    expect(err.message).toBe('something went wrong');
    expect(err.suggestion).toBe('try something else');
    expect(err).toBeInstanceOf(Error);
  });

  it('creates error without suggestion', () => {
    const err = new QRError('TEST', 'no suggestion');
    expect(err.suggestion).toBeUndefined();
  });
});

describe('DataTooLongError', () => {
  it('creates error with data length and capacity info', () => {
    const err = new DataTooLongError(100, 50, 'H');
    expect(err.name).toBe('DataTooLongError');
    expect(err.code).toBe('DATA_TOO_LONG');
    expect(err.message).toContain('100');
    expect(err.message).toContain('50');
    expect(err.message).toContain('H');
    expect(err.suggestion).toBeDefined();
    expect(err).toBeInstanceOf(QRError);
  });
});

describe('InvalidVersionError', () => {
  it('creates error with version and reason', () => {
    const err = new InvalidVersionError(0, 'Version must be between 1 and 40.');
    expect(err.name).toBe('InvalidVersionError');
    expect(err.code).toBe('INVALID_VERSION');
    expect(err.message).toContain('0');
    expect(err.message).toContain('Version must be between 1 and 40.');
    expect(err.suggestion).toBeDefined();
    expect(err).toBeInstanceOf(QRError);
  });
});

describe('InvalidInputError', () => {
  it('creates error with reason', () => {
    const err = new InvalidInputError('empty data');
    expect(err.name).toBe('InvalidInputError');
    expect(err.code).toBe('INVALID_INPUT');
    expect(err.message).toContain('empty data');
    expect(err.suggestion).toBeUndefined();
    expect(err).toBeInstanceOf(QRError);
  });
});
