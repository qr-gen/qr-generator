/**
 * Escapes special characters for WiFi QR code fields.
 * Backslash-escapes: \, ;, :, "
 */
export function escapeWifi(value: string): string {
  return value.replace(/([\\;:"])/g, '\\$1');
}

/**
 * Folds a vCard line to ensure no physical line exceeds 75 characters.
 * Lines longer than 75 chars are split with CRLF + space continuation.
 */
export function foldVCardLine(line: string): string {
  if (line.length <= 75) {
    return line;
  }

  const parts: string[] = [];
  parts.push(line.slice(0, 75));
  let offset = 75;

  while (offset < line.length) {
    // Continuation lines start with a space, so max content is 74 chars
    parts.push(' ' + line.slice(offset, offset + 74));
    offset += 74;
  }

  return parts.join('\r\n');
}
