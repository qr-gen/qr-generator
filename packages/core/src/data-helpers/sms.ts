export interface SMSOptions {
  phone: string;
  message?: string;
}

export function formatSMS(options: SMSOptions): string {
  const { phone, message } = options;

  if (message) {
    return `SMSTO:${phone}:${message}`;
  }

  return `SMSTO:${phone}`;
}
