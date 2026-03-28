import { describe, it, expect } from 'vitest';
import { formatCalendarEvent } from '../../src/data-helpers/calendar';

describe('formatCalendarEvent', () => {
  it('formats a basic event with start only', () => {
    const start = new Date('2026-04-01T18:00:00Z');
    const result = formatCalendarEvent({ title: 'Launch', start });
    expect(result).toBe(
      [
        'BEGIN:VEVENT',
        'SUMMARY:Launch',
        'DTSTART:20260401T180000Z',
        'END:VEVENT',
      ].join('\n'),
    );
  });

  it('formats an event with start and end', () => {
    const start = new Date('2026-04-01T18:00:00Z');
    const end = new Date('2026-04-01T20:00:00Z');
    const result = formatCalendarEvent({ title: 'Meeting', start, end });
    expect(result).toContain('DTSTART:20260401T180000Z');
    expect(result).toContain('DTEND:20260401T200000Z');
  });

  it('formats an event with location', () => {
    const start = new Date('2026-06-15T09:00:00Z');
    const result = formatCalendarEvent({
      title: 'Conference',
      start,
      location: 'Room 42',
    });
    expect(result).toContain('LOCATION:Room 42');
  });

  it('formats an event with description', () => {
    const start = new Date('2026-06-15T09:00:00Z');
    const result = formatCalendarEvent({
      title: 'Workshop',
      start,
      description: 'Bring your laptop',
    });
    expect(result).toContain('DESCRIPTION:Bring your laptop');
  });

  it('formats an event with all optional fields', () => {
    const start = new Date('2026-12-25T10:00:00Z');
    const end = new Date('2026-12-25T12:00:00Z');
    const result = formatCalendarEvent({
      title: 'Holiday Party',
      start,
      end,
      location: 'Office',
      description: 'Secret Santa exchange',
    });
    expect(result).toBe(
      [
        'BEGIN:VEVENT',
        'SUMMARY:Holiday Party',
        'DTSTART:20261225T100000Z',
        'DTEND:20261225T120000Z',
        'LOCATION:Office',
        'DESCRIPTION:Secret Santa exchange',
        'END:VEVENT',
      ].join('\n'),
    );
  });

  it('converts local Date to UTC format correctly', () => {
    // Create a date with a specific UTC time
    const start = new Date(Date.UTC(2026, 0, 15, 8, 30, 45));
    const result = formatCalendarEvent({ title: 'Test', start });
    expect(result).toContain('DTSTART:20260115T083045Z');
  });

  it('pads single-digit months, days, hours, minutes, seconds', () => {
    const start = new Date(Date.UTC(2026, 0, 5, 3, 7, 9));
    const result = formatCalendarEvent({ title: 'Padded', start });
    expect(result).toContain('DTSTART:20260105T030709Z');
  });

  it('wraps output in BEGIN:VEVENT and END:VEVENT', () => {
    const start = new Date('2026-01-01T00:00:00Z');
    const result = formatCalendarEvent({ title: 'New Year', start });
    expect(result).toMatch(/^BEGIN:VEVENT\n/);
    expect(result).toMatch(/\nEND:VEVENT$/);
  });
});
