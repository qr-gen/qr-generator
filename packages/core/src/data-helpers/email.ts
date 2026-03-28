export interface EmailOptions {
  to: string;
  subject?: string;
  body?: string;
}

export function formatEmail(options: EmailOptions): string {
  const { to, subject, body } = options;

  const params: string[] = [];

  if (subject) {
    params.push(`subject=${encodeURIComponent(subject)}`);
  }

  if (body) {
    params.push(`body=${encodeURIComponent(body)}`);
  }

  if (params.length > 0) {
    return `mailto:${to}?${params.join('&')}`;
  }

  return `mailto:${to}`;
}
