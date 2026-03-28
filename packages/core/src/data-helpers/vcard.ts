import { foldVCardLine } from './escape';

export interface VCardOptions {
  firstName: string;
  lastName?: string;
  phone?: string;
  email?: string;
  org?: string;
  title?: string;
  url?: string;
  note?: string;
}

export function formatVCard(options: VCardOptions): string {
  const { firstName, lastName, phone, email, org, title, url, note } = options;

  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${lastName ?? ''};${firstName}`,
    `FN:${lastName ? `${firstName} ${lastName}` : firstName}`,
  ];

  if (phone) lines.push(`TEL:${phone}`);
  if (email) lines.push(`EMAIL:${email}`);
  if (org) lines.push(`ORG:${org}`);
  if (title) lines.push(`TITLE:${title}`);
  if (url) lines.push(`URL:${url}`);
  if (note) lines.push(`NOTE:${note}`);

  lines.push('END:VCARD');

  return lines.map(foldVCardLine).join('\r\n');
}
