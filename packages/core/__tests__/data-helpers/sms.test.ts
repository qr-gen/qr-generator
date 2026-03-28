import { describe, it, expect } from 'vitest';
import { formatSMS } from '../../src/data-helpers/sms';

describe('formatSMS', () => {
  it('formats SMS with phone and message', () => {
    expect(formatSMS({ phone: '+1234567890', message: 'Hello' })).toBe(
      'SMSTO:+1234567890:Hello',
    );
  });

  it('formats SMS with phone only (no message)', () => {
    expect(formatSMS({ phone: '+1234567890' })).toBe('SMSTO:+1234567890');
  });

  it('formats SMS with empty message', () => {
    expect(formatSMS({ phone: '+9876543210', message: '' })).toBe(
      'SMSTO:+9876543210',
    );
  });

  it('preserves special characters in message without encoding', () => {
    expect(
      formatSMS({ phone: '+1111111111', message: 'Hello & goodbye! 100%' }),
    ).toBe('SMSTO:+1111111111:Hello & goodbye! 100%');
  });

  it('handles phone number without plus prefix', () => {
    expect(formatSMS({ phone: '5551234567', message: 'Hi' })).toBe(
      'SMSTO:5551234567:Hi',
    );
  });
});
