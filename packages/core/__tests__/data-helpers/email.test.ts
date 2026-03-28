import { describe, it, expect } from 'vitest';
import { formatEmail } from '../../src/data-helpers/email';

describe('formatEmail', () => {
  it('formats email with to address only', () => {
    expect(formatEmail({ to: 'a@b.com' })).toBe('mailto:a@b.com');
  });

  it('formats email with subject', () => {
    expect(formatEmail({ to: 'a@b.com', subject: 'Hi' })).toBe(
      'mailto:a@b.com?subject=Hi',
    );
  });

  it('formats email with body', () => {
    expect(formatEmail({ to: 'a@b.com', body: 'Hello' })).toBe(
      'mailto:a@b.com?body=Hello',
    );
  });

  it('formats email with subject and body', () => {
    expect(
      formatEmail({ to: 'a@b.com', subject: 'Hi', body: 'Hello' }),
    ).toBe('mailto:a@b.com?subject=Hi&body=Hello');
  });

  it('percent-encodes special characters in subject', () => {
    expect(formatEmail({ to: 'a@b.com', subject: 'Hello World' })).toBe(
      'mailto:a@b.com?subject=Hello%20World',
    );
  });

  it('percent-encodes special characters in body', () => {
    expect(
      formatEmail({ to: 'a@b.com', body: 'Line1\nLine2' }),
    ).toBe('mailto:a@b.com?body=Line1%0ALine2');
  });

  it('encodes ampersands and equals signs', () => {
    expect(
      formatEmail({ to: 'a@b.com', subject: 'A&B=C' }),
    ).toBe('mailto:a@b.com?subject=A%26B%3DC');
  });

  it('omits empty subject and body', () => {
    expect(formatEmail({ to: 'a@b.com', subject: '', body: '' })).toBe(
      'mailto:a@b.com',
    );
  });

  it('handles subject with no body', () => {
    expect(
      formatEmail({ to: 'user@domain.org', subject: 'Question?' }),
    ).toBe('mailto:user@domain.org?subject=Question%3F');
  });

  it('handles body with no subject', () => {
    expect(
      formatEmail({ to: 'user@domain.org', body: 'Please reply' }),
    ).toBe('mailto:user@domain.org?body=Please%20reply');
  });
});
