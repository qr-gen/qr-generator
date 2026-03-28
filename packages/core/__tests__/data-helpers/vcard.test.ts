import { describe, it, expect } from 'vitest';
import { formatVCard } from '../../src/data-helpers/vcard';

describe('formatVCard', () => {
  it('formats with firstName only', () => {
    const result = formatVCard({ firstName: 'Jane' });
    expect(result).toBe(
      'BEGIN:VCARD\r\nVERSION:3.0\r\nN:;Jane\r\nFN:Jane\r\nEND:VCARD',
    );
  });

  it('formats with firstName and lastName', () => {
    const result = formatVCard({ firstName: 'Jane', lastName: 'Doe' });
    expect(result).toBe(
      'BEGIN:VCARD\r\nVERSION:3.0\r\nN:Doe;Jane\r\nFN:Jane Doe\r\nEND:VCARD',
    );
  });

  it('includes all optional fields', () => {
    const result = formatVCard({
      firstName: 'Jane',
      lastName: 'Doe',
      phone: '+1234567890',
      email: 'jane@example.com',
      org: 'Acme Corp',
      title: 'Engineer',
      url: 'https://jane.dev',
      note: 'A great contact',
    });
    expect(result).toBe(
      [
        'BEGIN:VCARD',
        'VERSION:3.0',
        'N:Doe;Jane',
        'FN:Jane Doe',
        'TEL:+1234567890',
        'EMAIL:jane@example.com',
        'ORG:Acme Corp',
        'TITLE:Engineer',
        'URL:https://jane.dev',
        'NOTE:A great contact',
        'END:VCARD',
      ].join('\r\n'),
    );
  });

  it('omits fields that are not provided', () => {
    const result = formatVCard({
      firstName: 'Alice',
      phone: '+9876543210',
    });
    expect(result).toBe(
      [
        'BEGIN:VCARD',
        'VERSION:3.0',
        'N:;Alice',
        'FN:Alice',
        'TEL:+9876543210',
        'END:VCARD',
      ].join('\r\n'),
    );
  });

  it('handles special characters in names', () => {
    const result = formatVCard({
      firstName: "O'Brien",
      lastName: 'de la Cruz',
    });
    expect(result).toContain("N:de la Cruz;O'Brien");
    expect(result).toContain("FN:O'Brien de la Cruz");
  });

  it('folds lines longer than 75 characters', () => {
    const longNote =
      'This is a very long note that should definitely exceed the seventy-five character line length limit for vCard';
    const result = formatVCard({
      firstName: 'Jane',
      note: longNote,
    });
    const lines = result.split('\r\n');
    for (const line of lines) {
      // Each physical line (after folding) must be <= 75 chars
      expect(line.length).toBeLessThanOrEqual(75);
    }
    // Verify the note content is preserved when unfolded
    const unfolded = result.replace(/\r\n /g, '');
    expect(unfolded).toContain(`NOTE:${longNote}`);
  });

  it('does not fold lines that are exactly 75 characters', () => {
    // "NOTE:" is 5 chars, so we need content of 70 chars to hit exactly 75
    const content70 = 'A'.repeat(70);
    const result = formatVCard({ firstName: 'X', note: content70 });
    const lines = result.split('\r\n');
    const noteLine = lines.find((l) => l.startsWith('NOTE:'));
    expect(noteLine).toBe(`NOTE:${content70}`);
    expect(noteLine!.length).toBe(75);
  });

  it('folds lines that are 76 characters', () => {
    const content71 = 'B'.repeat(71);
    const result = formatVCard({ firstName: 'X', note: content71 });
    const lines = result.split('\r\n');
    // The NOTE line should be folded
    const noteIdx = lines.findIndex((l) => l.startsWith('NOTE:'));
    expect(noteIdx).toBeGreaterThan(-1);
    expect(lines[noteIdx].length).toBeLessThanOrEqual(75);
    // Next line should be a continuation (starts with space)
    expect(lines[noteIdx + 1]).toMatch(/^ /);
  });
});
