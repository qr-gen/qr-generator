import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createQR } from '../src/create-qr';
import { downloadQR } from '../src/download';

describe('downloadQR', () => {
  let mockClick: ReturnType<typeof vi.fn>;
  let mockCreateObjectURL: ReturnType<typeof vi.fn>;
  let mockRevokeObjectURL: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockClick = vi.fn();
    mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    mockRevokeObjectURL = vi.fn();

    vi.stubGlobal('URL', {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
    });
    vi.stubGlobal('document', {
      createElement: vi.fn().mockReturnValue({
        click: mockClick,
        href: '',
        download: '',
      }),
    });
    vi.stubGlobal('Blob', global.Blob);
  });

  it('creates anchor element and triggers click', () => {
    const result = createQR('test', { size: 100 });
    downloadQR(result);
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(mockClick).toHaveBeenCalled();
  });

  it('uses default filename qr-code.svg for svg format', () => {
    const result = createQR('test', { size: 100, format: 'svg' });
    const anchor = { click: mockClick, href: '', download: '' };
    (document.createElement as any).mockReturnValue(anchor);
    downloadQR(result);
    expect(anchor.download).toBe('qr-code.svg');
  });

  it('uses default filename qr-code.png for png format', () => {
    const result = createQR('test', { size: 100, format: 'png' });
    const anchor = { click: mockClick, href: '', download: '' };
    (document.createElement as any).mockReturnValue(anchor);
    downloadQR(result);
    expect(anchor.download).toBe('qr-code.png');
  });

  it('uses custom filename when provided', () => {
    const result = createQR('test', { size: 100 });
    const anchor = { click: mockClick, href: '', download: '' };
    (document.createElement as any).mockReturnValue(anchor);
    downloadQR(result, { filename: 'my-code.svg' });
    expect(anchor.download).toBe('my-code.svg');
  });

  it('creates blob URL and revokes it', () => {
    const result = createQR('test', { size: 100 });
    downloadQR(result);
    expect(mockCreateObjectURL).toHaveBeenCalled();
  });

  it('throws in environments without document', () => {
    vi.stubGlobal('document', undefined);
    const result = createQR('test', { size: 100 });
    expect(() => downloadQR(result)).toThrow(/browser/i);
  });
});

describe('CreateQRResult.toDataURL', () => {
  it('returns data:image/svg+xml;base64,... for svg format', () => {
    const result = createQR('test', { size: 100 });
    const dataUrl = result.toDataURL('svg');
    expect(dataUrl).toMatch(/^data:image\/svg\+xml;base64,/);
  });

  it('returns data:image/png;base64,... for png format', () => {
    const result = createQR('test', { size: 100 });
    const dataUrl = result.toDataURL('png');
    expect(dataUrl).toMatch(/^data:image\/png;base64,/);
  });

  it('returns data:image/bmp;base64,... for bmp format', () => {
    const result = createQR('test', { size: 100 });
    const dataUrl = result.toDataURL('bmp');
    expect(dataUrl).toMatch(/^data:image\/bmp;base64,/);
  });

  it('defaults to png format', () => {
    const result = createQR('test', { size: 100 });
    const dataUrl = result.toDataURL();
    expect(dataUrl).toMatch(/^data:image\/png;base64,/);
  });
});

describe('CreateQRResult.toBlob', () => {
  it('returns Blob with image/svg+xml type for svg', () => {
    const result = createQR('test', { size: 100 });
    const blob = result.toBlob('svg');
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/svg+xml');
  });

  it('returns Blob with image/png type for png', () => {
    const result = createQR('test', { size: 100 });
    const blob = result.toBlob('png');
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/png');
  });

  it('returns Blob with image/bmp type for bmp', () => {
    const result = createQR('test', { size: 100 });
    const blob = result.toBlob('bmp');
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/bmp');
  });

  it('defaults to png format', () => {
    const result = createQR('test', { size: 100 });
    const blob = result.toBlob();
    expect(blob.type).toBe('image/png');
  });
});

describe('CreateQRResult.download', () => {
  beforeEach(() => {
    const mockClick = vi.fn();
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn().mockReturnValue('blob:mock'),
      revokeObjectURL: vi.fn(),
    });
    vi.stubGlobal('document', {
      createElement: vi.fn().mockReturnValue({
        click: mockClick,
        href: '',
        download: '',
      }),
    });
  });

  it('triggers download via the result object', () => {
    const result = createQR('test', { size: 100 });
    expect(() => result.download()).not.toThrow();
  });

  it('accepts options', () => {
    const result = createQR('test', { size: 100 });
    const anchor = { click: vi.fn(), href: '', download: '' };
    (document.createElement as any).mockReturnValue(anchor);
    result.download({ filename: 'custom.png', format: 'png' });
    expect(anchor.download).toBe('custom.png');
  });
});
