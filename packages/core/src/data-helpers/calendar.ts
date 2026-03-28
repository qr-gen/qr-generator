export interface CalendarEventOptions {
  title: string;
  start: Date;
  end?: Date;
  location?: string;
  description?: string;
}

function formatDateUTC(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const h = String(date.getUTCHours()).padStart(2, '0');
  const min = String(date.getUTCMinutes()).padStart(2, '0');
  const s = String(date.getUTCSeconds()).padStart(2, '0');
  return `${y}${m}${d}T${h}${min}${s}Z`;
}

export function formatCalendarEvent(options: CalendarEventOptions): string {
  const { title, start, end, location, description } = options;

  const lines: string[] = [
    'BEGIN:VEVENT',
    `SUMMARY:${title}`,
    `DTSTART:${formatDateUTC(start)}`,
  ];

  if (end) lines.push(`DTEND:${formatDateUTC(end)}`);
  if (location) lines.push(`LOCATION:${location}`);
  if (description) lines.push(`DESCRIPTION:${description}`);

  lines.push('END:VEVENT');

  return lines.join('\n');
}
