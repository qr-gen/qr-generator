/**
 * A simple RGBA pixel buffer for rasterizing QR code images.
 * Each pixel is stored as 4 consecutive bytes: R, G, B, A.
 */
export class PixelBuffer {
  readonly width: number;
  readonly height: number;
  readonly data: Uint8Array;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.data = new Uint8Array(width * height * 4);
  }

  setPixel(
    x: number,
    y: number,
    r: number,
    g: number,
    b: number,
    a: number,
  ): void {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;

    const offset = (y * this.width + x) * 4;
    this.data[offset] = r;
    this.data[offset + 1] = g;
    this.data[offset + 2] = b;
    this.data[offset + 3] = a;
  }

  getPixel(x: number, y: number): [number, number, number, number] {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return [0, 0, 0, 0];
    }

    const offset = (y * this.width + x) * 4;
    return [
      this.data[offset],
      this.data[offset + 1],
      this.data[offset + 2],
      this.data[offset + 3],
    ];
  }

  fillRect(
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    g: number,
    b: number,
    a: number,
  ): void {
    const x0 = Math.max(0, Math.floor(x));
    const y0 = Math.max(0, Math.floor(y));
    const x1 = Math.min(this.width, Math.floor(x + w));
    const y1 = Math.min(this.height, Math.floor(y + h));

    for (let py = y0; py < y1; py++) {
      for (let px = x0; px < x1; px++) {
        const offset = (py * this.width + px) * 4;
        this.data[offset] = r;
        this.data[offset + 1] = g;
        this.data[offset + 2] = b;
        this.data[offset + 3] = a;
      }
    }
  }

  fillCircle(
    cx: number,
    cy: number,
    radius: number,
    r: number,
    g: number,
    b: number,
    a: number,
  ): void {
    const x0 = Math.max(0, Math.floor(cx - radius));
    const y0 = Math.max(0, Math.floor(cy - radius));
    const x1 = Math.min(this.width, Math.ceil(cx + radius + 1));
    const y1 = Math.min(this.height, Math.ceil(cy + radius + 1));
    const r2 = radius * radius;

    for (let py = y0; py < y1; py++) {
      const dy = py - cy;
      for (let px = x0; px < x1; px++) {
        const dx = px - cx;
        if (dx * dx + dy * dy <= r2) {
          const offset = (py * this.width + px) * 4;
          this.data[offset] = r;
          this.data[offset + 1] = g;
          this.data[offset + 2] = b;
          this.data[offset + 3] = a;
        }
      }
    }
  }

  fillRoundedRect(
    x: number,
    y: number,
    w: number,
    h: number,
    cornerRadius: number,
    r: number,
    g: number,
    b: number,
    a: number,
  ): void {
    // Clamp corner radius to half the smallest dimension
    const cr = Math.min(cornerRadius, Math.floor(w / 2), Math.floor(h / 2));

    if (cr <= 0) {
      this.fillRect(x, y, w, h, r, g, b, a);
      return;
    }

    // Center horizontal strip (full width, excluding corner rows)
    this.fillRect(x, y + cr, w, h - 2 * cr, r, g, b, a);

    // Top strip between corners
    this.fillRect(x + cr, y, w - 2 * cr, cr, r, g, b, a);

    // Bottom strip between corners
    this.fillRect(x + cr, y + h - cr, w - 2 * cr, cr, r, g, b, a);

    // Four corner quarter-circles
    const corners = [
      { cx: x + cr, cy: y + cr },           // top-left
      { cx: x + w - 1 - cr, cy: y + cr },   // top-right
      { cx: x + cr, cy: y + h - 1 - cr },   // bottom-left
      { cx: x + w - 1 - cr, cy: y + h - 1 - cr }, // bottom-right
    ];

    const r2 = cr * cr;
    for (const corner of corners) {
      const bx0 = Math.max(0, Math.floor(corner.cx - cr));
      const by0 = Math.max(0, Math.floor(corner.cy - cr));
      const bx1 = Math.min(this.width, Math.ceil(corner.cx + cr + 1));
      const by1 = Math.min(this.height, Math.ceil(corner.cy + cr + 1));

      for (let py = by0; py < by1; py++) {
        const dy = py - corner.cy;
        for (let px = bx0; px < bx1; px++) {
          const dx = px - corner.cx;
          if (dx * dx + dy * dy <= r2) {
            const offset = (py * this.width + px) * 4;
            this.data[offset] = r;
            this.data[offset + 1] = g;
            this.data[offset + 2] = b;
            this.data[offset + 3] = a;
          }
        }
      }
    }
  }

  blendPixel(
    x: number,
    y: number,
    r: number,
    g: number,
    b: number,
    a: number,
  ): void {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;

    const srcA = a / 255;
    if (srcA === 0) return;

    const offset = (y * this.width + x) * 4;

    if (srcA === 1) {
      this.data[offset] = r;
      this.data[offset + 1] = g;
      this.data[offset + 2] = b;
      this.data[offset + 3] = a;
      return;
    }

    const dstR = this.data[offset];
    const dstG = this.data[offset + 1];
    const dstB = this.data[offset + 2];
    const dstA = this.data[offset + 3] / 255;

    const outA = srcA + dstA * (1 - srcA);

    if (outA === 0) {
      this.data[offset] = 0;
      this.data[offset + 1] = 0;
      this.data[offset + 2] = 0;
      this.data[offset + 3] = 0;
      return;
    }

    this.data[offset] = Math.round(
      (r * srcA + dstR * dstA * (1 - srcA)) / outA,
    );
    this.data[offset + 1] = Math.round(
      (g * srcA + dstG * dstA * (1 - srcA)) / outA,
    );
    this.data[offset + 2] = Math.round(
      (b * srcA + dstB * dstA * (1 - srcA)) / outA,
    );
    this.data[offset + 3] = Math.round(outA * 255);
  }
}
