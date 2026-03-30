export function svgRect(
  x: number, y: number, w: number, h: number, fill: string,
): string {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;
}

export function svgRoundedRect(
  x: number, y: number, w: number, h: number, r: number, fill: string,
): string {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="${fill}"/>`;
}

export function svgCircle(
  cx: number, cy: number, r: number, fill: string,
): string {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;
}

export function svgPolygon(
  points: string, fill: string,
): string {
  return `<polygon points="${points}" fill="${fill}"/>`;
}

export function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function svgDocument(
  width: number, height: number, content: string, title?: string,
  physicalDims?: { width: string; height: string },
): string {
  const w = physicalDims ? physicalDims.width : String(width);
  const h = physicalDims ? physicalDims.height : String(height);
  if (title) {
    const escaped = escapeXml(title);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escaped}"><title>${escaped}</title>${content}</svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${width} ${height}">${content}</svg>`;
}
