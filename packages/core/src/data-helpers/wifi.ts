import { escapeWifi } from './escape';

export interface WifiOptions {
  ssid: string;
  password?: string;
  security: 'WPA' | 'WEP' | 'nopass';
  hidden?: boolean;
}

export function formatWifi(options: WifiOptions): string {
  const { ssid, password, security, hidden } = options;

  let result = `WIFI:T:${security};S:${escapeWifi(ssid)};`;

  if (password) {
    result += `P:${escapeWifi(password)};`;
  }

  if (hidden) {
    result += 'H:true;';
  }

  result += ';';
  return result;
}
