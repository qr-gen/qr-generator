import { describe, it, expect } from 'vitest';
import { formatWifi } from '../../src/data-helpers/wifi';

describe('formatWifi', () => {
  it('formats a basic WPA network', () => {
    expect(
      formatWifi({ ssid: 'MyNetwork', password: 'secret', security: 'WPA' }),
    ).toBe('WIFI:T:WPA;S:MyNetwork;P:secret;;');
  });

  it('formats a WEP network', () => {
    expect(
      formatWifi({ ssid: 'OldNet', password: 'wepkey', security: 'WEP' }),
    ).toBe('WIFI:T:WEP;S:OldNet;P:wepkey;;');
  });

  it('formats an open network (nopass) and omits password', () => {
    expect(formatWifi({ ssid: 'FreeWifi', security: 'nopass' })).toBe(
      'WIFI:T:nopass;S:FreeWifi;;',
    );
  });

  it('includes hidden flag when true', () => {
    expect(
      formatWifi({
        ssid: 'HiddenNet',
        password: 'pass',
        security: 'WPA',
        hidden: true,
      }),
    ).toBe('WIFI:T:WPA;S:HiddenNet;P:pass;H:true;;');
  });

  it('omits hidden flag when false', () => {
    expect(
      formatWifi({
        ssid: 'Visible',
        password: 'pass',
        security: 'WPA',
        hidden: false,
      }),
    ).toBe('WIFI:T:WPA;S:Visible;P:pass;;');
  });

  it('escapes semicolons in SSID', () => {
    expect(
      formatWifi({ ssid: 'My;Network', password: 'pass', security: 'WPA' }),
    ).toBe('WIFI:T:WPA;S:My\\;Network;P:pass;;');
  });

  it('escapes colons in SSID', () => {
    expect(
      formatWifi({ ssid: 'My:Network', password: 'pass', security: 'WPA' }),
    ).toBe('WIFI:T:WPA;S:My\\:Network;P:pass;;');
  });

  it('escapes backslashes in SSID', () => {
    expect(
      formatWifi({ ssid: 'My\\Network', password: 'pass', security: 'WPA' }),
    ).toBe('WIFI:T:WPA;S:My\\\\Network;P:pass;;');
  });

  it('escapes double quotes in SSID', () => {
    expect(
      formatWifi({ ssid: 'My"Network', password: 'pass', security: 'WPA' }),
    ).toBe('WIFI:T:WPA;S:My\\"Network;P:pass;;');
  });

  it('escapes special characters in password', () => {
    expect(
      formatWifi({ ssid: 'Net', password: 'p;a:s\\s"', security: 'WPA' }),
    ).toBe('WIFI:T:WPA;S:Net;P:p\\;a\\:s\\\\s\\";;');
  });

  it('handles SSID and password with multiple special chars', () => {
    expect(
      formatWifi({
        ssid: 'a;b:c\\d"e',
        password: '1;2:3\\4"5',
        security: 'WPA',
      }),
    ).toBe(
      'WIFI:T:WPA;S:a\\;b\\:c\\\\d\\"e;P:1\\;2\\:3\\\\4\\"5;;',
    );
  });
});
