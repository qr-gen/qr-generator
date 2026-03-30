import { generateQR, formatWifi, formatVCard, formatCalendarEvent, formatSMS, formatEmail, formatGeo } from '@qr-kit/core';
import { renderSVG, renderPNG, renderBMP, createQR, downloadQR, applyPreset, applyHalftone } from '@qr-kit/dom';
import type { RenderOptions, PresetName } from '@qr-kit/dom';

// Tiny 8x8 PNG logo as data URI
const SAMPLE_LOGO = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAE0lEQVQYV2Nk+M/wn4EIwMgAAFadBAkLhvdIAAAAAElFTkSuQmCC';

// ──────────────────────────────────────────
// Section definitions
// ──────────────────────────────────────────

interface Demo {
  title: string;
  note?: string;
  wrapClass?: string;
  render: () => string; // returns SVG string
}

const sections: Record<string, Demo[]> = {
  basic: [
    {
      title: 'Default',
      render: () => qr('https://example.com', { size: 256 }),
    },
    {
      title: 'Custom Colors',
      render: () => qr('https://example.com', { size: 256, fgColor: '#1a1a2e', bgColor: '#e8e8e8' }),
    },
    {
      title: 'Transparent Background',
      wrapClass: 'overlay-bg',
      render: () => qr('https://example.com', { size: 200, bgColor: 'transparent', fgColor: '#333333' }),
    },
    {
      title: 'Background Opacity (0.7)',
      wrapClass: 'dark-bg',
      render: () => qr('https://example.com', { size: 200, bgColor: '#ffffff', bgOpacity: 0.7 }),
    },
    {
      title: 'Border Radius',
      render: () => qr('https://example.com', { size: 256, borderRadius: 20, bgColor: '#f0f0f0' }),
    },
    {
      title: 'High Error Correction',
      render: () => {
        const q = generateQR({ data: 'https://example.com', errorCorrection: 'H' });
        return renderSVG(q.matrix, { size: 256, moduleTypes: q.moduleTypes });
      },
    },
  ],

  shapes: [
    { title: 'Square', render: () => qr('https://example.com', { size: 220, shape: 'square' }) },
    { title: 'Rounded', render: () => qr('https://example.com', { size: 220, shape: 'rounded' }) },
    { title: 'Dots', render: () => qr('https://example.com', { size: 220, shape: 'dots' }) },
    { title: 'Diamond', render: () => qr('https://example.com', { size: 220, shape: 'diamond' }) },
    {
      title: 'Dots + Module Scale 0.7',
      render: () => qr('https://example.com', { size: 220, shape: 'dots', moduleScale: 0.7 }),
    },
    {
      title: 'Diamond + Module Scale 0.5',
      render: () => qr('https://example.com', { size: 220, shape: 'diamond', moduleScale: 0.5 }),
    },
  ],

  colors: [
    {
      title: 'Linear Gradient (45deg)',
      render: () => qr('https://example.com', {
        size: 256, fgColor: { type: 'linear', colors: ['#667eea', '#764ba2'], angle: 45 },
      }),
    },
    {
      title: 'Radial Gradient',
      render: () => qr('https://example.com', {
        size: 256, fgColor: { type: 'radial', colors: ['#4facfe', '#00f2fe'] },
      }),
    },
    {
      title: '3-Color Gradient',
      render: () => qr('https://example.com', {
        size: 256, fgColor: { type: 'linear', colors: ['#ff6b6b', '#feca57', '#48dbfb'], angle: 135 },
      }),
    },
    {
      title: 'Dark Mode',
      wrapClass: 'dark-bg',
      render: () => qr('https://example.com', { size: 220, fgColor: '#e0e0e0', bgColor: '#1a1a2e' }),
    },
  ],

  finders: [
    {
      title: 'Circle Finders + Dots',
      render: () => qr('https://example.com', { size: 256, finderShape: 'circle', shape: 'dots' }),
    },
    {
      title: 'Rounded Finders',
      render: () => qr('https://example.com', { size: 256, finderShape: 'rounded', shape: 'rounded' }),
    },
    {
      title: 'Finder Color',
      render: () => qr('https://example.com', {
        size: 256, finderColor: '#e94560', shape: 'dots', finderShape: 'circle',
      }),
    },
    {
      title: 'Independent Outer/Inner Colors',
      render: () => qr('https://example.com', {
        size: 256, finderOuterColor: '#e94560', finderInnerColor: '#0f3460', shape: 'rounded',
      }),
    },
    {
      title: 'Independent Outer/Inner Shapes',
      render: () => qr('https://example.com', {
        size: 256, finderOuterShape: 'rounded', finderInnerShape: 'circle',
        finderOuterColor: '#6c5ce7', finderInnerColor: '#fd79a8', shape: 'rounded',
      }),
    },
    {
      title: 'Gradient Finder Colors',
      render: () => qr('https://example.com', {
        size: 256, finderColor: { type: 'linear', colors: ['#ee5a24', '#f368e0'], angle: 90 },
        shape: 'dots', finderShape: 'circle',
      }),
    },
  ],

  logo: [
    {
      title: 'Logo (center)',
      note: 'EC auto-upgraded to H',
      render: () => qr('https://example.com', {
        size: 256, logo: { src: SAMPLE_LOGO, width: 40, height: 40 },
      }),
    },
    {
      title: 'Logo + Rounded Shape',
      render: () => qr('https://example.com', {
        size: 256, logo: { src: SAMPLE_LOGO, width: 50, height: 50, padding: 10 },
        shape: 'rounded', finderShape: 'rounded', fgColor: '#2d3436',
      }),
    },
    {
      title: 'Logo + Circle Finders',
      render: () => qr('https://example.com', {
        size: 256, logo: { src: SAMPLE_LOGO, width: 40, height: 40 },
        shape: 'dots', finderShape: 'circle', finderColor: '#e94560',
      }),
    },
    {
      title: 'Logo + Gradient',
      render: () => qr('https://example.com', {
        size: 256, logo: { src: SAMPLE_LOGO, width: 45, height: 45 },
        fgColor: { type: 'linear', colors: ['#6c5ce7', '#a29bfe'], angle: 45 },
        finderShape: 'circle',
      }),
    },
    {
      title: 'Logo + Border Radius',
      render: () => qr('https://example.com', {
        size: 256, logo: { src: SAMPLE_LOGO, width: 40, height: 40 },
        borderRadius: 16, shape: 'rounded', bgColor: '#f8f9fa',
      }),
    },
    {
      title: 'Logo + Frame',
      render: () => qr('https://example.com', {
        size: 280, logo: { src: SAMPLE_LOGO, width: 40, height: 40 },
        frame: { style: 'rounded', color: '#6c5ce7', thickness: 3, label: 'Scan Me', labelPosition: 'bottom', labelColor: '#6c5ce7', labelFontSize: 12, padding: 8 },
        finderColor: '#6c5ce7',
      }),
    },
  ],

  frame: [
    {
      title: 'Square Frame',
      render: () => qr('https://example.com', {
        size: 260, frame: { style: 'square', color: '#333', thickness: 3 },
      }),
    },
    {
      title: 'Frame + Label (Bottom)',
      render: () => qr('https://example.com', {
        size: 260, frame: { style: 'rounded', color: '#e94560', thickness: 3, label: 'Scan Me', labelPosition: 'bottom', labelColor: '#e94560', labelFontSize: 14, padding: 8 },
        finderColor: '#e94560',
      }),
    },
    {
      title: 'Frame + Label (Top)',
      render: () => qr('https://example.com', {
        size: 260, frame: { style: 'square', color: '#2d3436', thickness: 2, label: 'Visit our site', labelPosition: 'top', labelColor: '#2d3436', labelFontSize: 12, padding: 10 },
        shape: 'rounded',
      }),
    },
  ],

  phase4: [
    {
      title: 'Margin Color',
      note: 'Red quiet zone, white inner bg',
      render: () => qr('https://example.com', {
        size: 256, marginColor: '#e94560', bgColor: '#ffffff', fgColor: '#1a1a2e',
      }),
    },
    {
      title: 'Margin Color + Dark',
      render: () => qr('https://example.com', {
        size: 256, marginColor: '#2d3436', bgColor: '#dfe6e9', fgColor: '#2d3436',
      }),
    },
    {
      title: 'Alignment Pattern Color',
      note: 'V3 QR: red alignment, purple finders',
      render: () => qr('HELLO WORLD THIS IS A LONGER STRING FOR QR', {
        size: 256, alignmentColor: '#e94560', fgColor: '#2d3436', finderColor: '#6c5ce7',
      }),
    },
    {
      title: 'Timing Pattern Color',
      note: 'Green timing patterns',
      render: () => qr('https://example.com', { size: 256, timingColor: '#00b894', fgColor: '#2d3436' }),
    },
    {
      title: 'All Pattern Colors',
      note: 'Every pattern type colored independently',
      render: () => qr('HELLO WORLD THIS IS A LONGER STRING FOR QR', {
        size: 256, fgColor: '#2d3436', finderOuterColor: '#6c5ce7', finderInnerColor: '#a29bfe',
        alignmentColor: '#e94560', timingColor: '#00b894',
      }),
    },
    {
      title: 'SVG Optimization (optimizeSvg)',
      note: 'Merged adjacent modules into paths',
      render: () => qr('https://example.com', { size: 256, shape: 'square', optimizeSvg: true, fgColor: '#2d3436' }),
    },
    {
      title: 'Margin Color + Logo',
      render: () => qr('https://example.com', {
        size: 256, marginColor: '#1a1a2e', bgColor: '#ffffff', fgColor: '#1a1a2e',
        logo: { src: SAMPLE_LOGO, width: 40, height: 40 },
        finderShape: 'circle', shape: 'dots',
      }),
    },
    {
      title: 'Gradient Alignment Color',
      render: () => qr('HELLO WORLD THIS IS A LONGER STRING FOR QR', {
        size: 256, alignmentColor: { type: 'radial', colors: ['#ff6b6b', '#feca57'] }, fgColor: '#2d3436',
      }),
    },
  ],

  dataHelpers: [
    {
      title: 'WiFi Network',
      note: 'Scan to join WiFi',
      render: () => qr(formatWifi({ ssid: 'CafeGuest', password: 's3cret', encryption: 'WPA' }), {
        size: 220, shape: 'rounded', finderShape: 'rounded', fgColor: '#2d3436',
      }),
    },
    {
      title: 'Contact vCard',
      note: 'Scan to add contact',
      render: () => qr(formatVCard({ firstName: 'Jane', lastName: 'Doe', phone: '+1234567890', email: 'jane@example.com', organization: 'Acme Inc' }), {
        size: 220, shape: 'dots', finderShape: 'circle', fgColor: '#6c5ce7',
      }),
    },
    {
      title: 'Calendar Event',
      note: 'Scan to add event',
      render: () => qr(formatCalendarEvent({ title: 'Launch Party', start: '2026-04-01T18:00', end: '2026-04-01T22:00', location: 'HQ' }), {
        size: 220, fgColor: '#e94560',
      }),
    },
    {
      title: 'SMS',
      note: 'Scan to send SMS',
      render: () => qr(formatSMS({ phone: '+1234567890', message: 'Hello from QR Kit!' }), {
        size: 220, shape: 'rounded', fgColor: '#00b894',
      }),
    },
    {
      title: 'Email',
      note: 'Scan to compose email',
      render: () => qr(formatEmail({ to: 'hello@example.com', subject: 'Hello!', body: 'Sent from a QR code' }), {
        size: 220, fgColor: '#0984e3',
      }),
    },
    {
      title: 'Geo Location',
      note: 'Scan to open in maps',
      render: () => qr(formatGeo({ latitude: 37.7749, longitude: -122.4194 }), {
        size: 220, shape: 'diamond', fgColor: '#fdcb6e', bgColor: '#2d3436',
      }),
    },
  ],

  presets: [
    ...(['default', 'minimal', 'rounded', 'dots', 'sharp', 'elegant'] as PresetName[]).map(name => ({
      title: `Preset: ${name}`,
      render: () => {
        const q = generateQR({ data: 'https://example.com' });
        const opts = applyPreset(name, { size: 220, moduleTypes: q.moduleTypes, skipValidation: true });
        return renderSVG(q.matrix, opts as RenderOptions);
      },
    })),
    {
      title: 'Preset + Override',
      note: 'elegant preset + custom fgColor',
      render: () => {
        const q = generateQR({ data: 'https://example.com' });
        const opts = applyPreset('elegant', { size: 220, fgColor: '#e94560', moduleTypes: q.moduleTypes, skipValidation: true });
        return renderSVG(q.matrix, opts as RenderOptions);
      },
    },
  ],

  download: [
    {
      title: 'createQR + Download (click buttons below)',
      render: () => qr('https://example.com', { size: 220, shape: 'rounded', finderShape: 'circle', fgColor: '#6c5ce7' }),
    },
  ],
};

// ──────────────────────────────────────────
// Helper: generate QR + render SVG
// ──────────────────────────────────────────

function qr(data: string, opts: Partial<RenderOptions>): string {
  const hasLogo = !!opts.logo;
  const hasOverlay = !!(opts as any).overlayImage;
  const ec = (hasLogo || hasOverlay) ? 'H' as const : 'M' as const;
  const q = generateQR({ data, errorCorrection: ec });
  return renderSVG(q.matrix, {
    size: 256,
    ...opts,
    moduleTypes: q.moduleTypes,
    skipValidation: true,
  } as RenderOptions);
}

// ──────────────────────────────────────────
// Navigation & rendering
// ──────────────────────────────────────────

let activeSection = 'basic';

function renderNav() {
  const nav = document.getElementById('nav')!;
  nav.innerHTML = Object.keys(sections)
    .map(key => `<button data-section="${key}" class="${key === activeSection ? 'active' : ''}">${key.charAt(0).toUpperCase() + key.slice(1)}</button>`)
    .join('');

  nav.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      activeSection = btn.dataset.section!;
      renderNav();
      renderContent();
    });
  });
}

function renderContent() {
  const content = document.getElementById('content')!;
  const demos = sections[activeSection] || [];

  content.innerHTML = `<div class="grid">${demos.map((demo, i) => {
    const svg = demo.render();
    const wrapStart = demo.wrapClass ? `<div class="${demo.wrapClass}">` : '';
    const wrapEnd = demo.wrapClass ? '</div>' : '';
    return `
      <div class="card">
        <h3>${demo.title}</h3>
        <div class="qr-container">${wrapStart}${svg}${wrapEnd}</div>
        ${demo.note ? `<p class="note">${demo.note}</p>` : ''}
        ${activeSection === 'download' && i === 0 ? `
          <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
            <button id="dl-svg" style="padding:6px 14px;border:1px solid #ccc;border-radius:6px;background:#fff;cursor:pointer;font-size:13px;">Download SVG</button>
            <button id="dl-png" style="padding:6px 14px;border:1px solid #ccc;border-radius:6px;background:#fff;cursor:pointer;font-size:13px;">Download PNG</button>
            <button id="dl-bmp" style="padding:6px 14px;border:1px solid #ccc;border-radius:6px;background:#fff;cursor:pointer;font-size:13px;">Download BMP</button>
          </div>
        ` : ''}
      </div>
    `;
  }).join('')}</div>`;

  // Attach download handlers
  if (activeSection === 'download') {
    const opts = { size: 220, shape: 'rounded' as const, finderShape: 'circle' as const, fgColor: '#6c5ce7' };

    document.getElementById('dl-svg')?.addEventListener('click', () => {
      const result = createQR('https://example.com', { ...opts, format: 'svg' });
      result.download({ filename: 'qr-code.svg' });
    });
    document.getElementById('dl-png')?.addEventListener('click', () => {
      const result = createQR('https://example.com', { ...opts, format: 'png' });
      result.download({ filename: 'qr-code.png' });
    });
    document.getElementById('dl-bmp')?.addEventListener('click', () => {
      const result = createQR('https://example.com', { ...opts, format: 'bmp' });
      result.download({ filename: 'qr-code.bmp' });
    });
  }
}

// Boot
renderNav();
renderContent();
