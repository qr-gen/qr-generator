import type { GradientConfig } from '../types';

export function getGradientId(name: string): string {
  return `url(#qr-gradient-${name})`;
}

export function renderGradientDef(config: GradientConfig, name: string): string {
  const id = `qr-gradient-${name}`;
  const stops = config.colors.map((color, i) => {
    const offset = config.colors.length === 1 ? 0 : Math.round((i / (config.colors.length - 1)) * 100);
    return `<stop offset="${offset}%" stop-color="${color}"/>`;
  }).join('');

  if (config.type === 'linear') {
    const angle = config.angle ?? 0;
    const rad = (angle * Math.PI) / 180;
    const x1 = Math.round((50 - Math.sin(rad) * 50));
    const y1 = Math.round((50 + Math.cos(rad) * 50));
    const x2 = Math.round((50 + Math.sin(rad) * 50));
    const y2 = Math.round((50 - Math.cos(rad) * 50));
    return `<linearGradient id="${id}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">${stops}</linearGradient>`;
  }

  return `<radialGradient id="${id}" cx="50%" cy="50%" r="50%">${stops}</radialGradient>`;
}
