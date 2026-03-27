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

export function svgDocument(
  width: number, height: number, content: string,
): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${content}</svg>`;
}
