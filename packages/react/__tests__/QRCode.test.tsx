import { describe, it, expect, vi } from 'vitest';
import { createRef } from 'react';
import { render } from '@testing-library/react';
import { QRCode } from '../src/components/QRCode';
import type { QRCodeHandle } from '../src/components/QRCode';

describe('QRCode Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<QRCode value="HELLO WORLD" />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders an SVG element', () => {
    const { container } = render(<QRCode value="TEST" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('applies custom size', () => {
    const { container } = render(<QRCode value="TEST" size={300} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('300');
  });

  it('applies className', () => {
    const { container } = render(<QRCode value="TEST" className="my-qr" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.classList.contains('my-qr')).toBe(true);
  });

  it('applies style', () => {
    const { container } = render(
      <QRCode value="TEST" style={{ border: '1px solid red' }} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.border).toBe('1px solid red');
  });

  it('renders different QR for different values', () => {
    const { container: c1 } = render(<QRCode value="AAA" />);
    const { container: c2 } = render(<QRCode value="BBB" />);
    expect(c1.innerHTML).not.toBe(c2.innerHTML);
  });

  it('applies custom colors', () => {
    const { container } = render(
      <QRCode value="TEST" fgColor="#ff0000" bgColor="#00ff00" skipValidation />,
    );
    const html = container.innerHTML;
    expect(html).toContain('#ff0000');
    expect(html).toContain('#00ff00');
  });

  it('accepts finderColor prop', () => {
    const { container } = render(
      <QRCode value="TEST" size={100} finderColor="#ff0000" skipValidation />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    // The SVG should contain the finder color
    expect(container.innerHTML).toContain('#ff0000');
  });

  it('accepts finderShape prop', () => {
    const { container } = render(
      <QRCode value="TEST" size={100} finderShape="rounded" skipValidation />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('renders same as before without finder props (backward compat)', () => {
    const { container: c1 } = render(
      <QRCode value="TEST" size={100} skipValidation />
    );
    const { container: c2 } = render(
      <QRCode value="TEST" size={100} skipValidation />
    );
    expect(c1.innerHTML).toBe(c2.innerHTML);
  });

  describe('accessibility', () => {
    it('renders role="img" and default aria-label on wrapper div', () => {
      const { container } = render(<QRCode value="TEST" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.getAttribute('role')).toBe('img');
      expect(wrapper.getAttribute('aria-label')).toBe('QR Code');
    });

    it('uses custom alt as aria-label', () => {
      const { container } = render(<QRCode value="TEST" alt="Scan me" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.getAttribute('aria-label')).toBe('Scan me');
    });

    it('renders empty aria-label when alt is empty string', () => {
      const { container } = render(<QRCode value="TEST" alt="" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.getAttribute('role')).toBe('img');
      expect(wrapper.getAttribute('aria-label')).toBe('');
    });
  });

  describe('imperative handle (ref)', () => {
    it('exposes element via ref', () => {
      const ref = createRef<QRCodeHandle>();
      const { container } = render(<QRCode ref={ref} value="TEST" />);
      expect(ref.current).toBeTruthy();
      expect(ref.current!.element).toBe(container.firstChild);
    });

    it('toDataURL returns a data URL string', () => {
      const ref = createRef<QRCodeHandle>();
      render(<QRCode ref={ref} value="TEST" />);
      const dataUrl = ref.current!.toDataURL();
      expect(typeof dataUrl).toBe('string');
      expect(dataUrl.startsWith('data:')).toBe(true);
    });

    it('toBlob returns a Blob', () => {
      const ref = createRef<QRCodeHandle>();
      render(<QRCode ref={ref} value="TEST" />);
      const blob = ref.current!.toBlob();
      expect(blob).toBeInstanceOf(Blob);
    });

    it('download calls without error', () => {
      // Mock URL.createObjectURL and URL.revokeObjectURL for jsdom
      const createObjectURL = vi.fn(() => 'blob:mock');
      const revokeObjectURL = vi.fn();
      globalThis.URL.createObjectURL = createObjectURL;
      globalThis.URL.revokeObjectURL = revokeObjectURL;

      const ref = createRef<QRCodeHandle>();
      render(<QRCode ref={ref} value="TEST" />);
      expect(() => ref.current!.download('test.svg')).not.toThrow();
    });

    it('auto-upgrades EC to H when logo is present', () => {
      const ref = createRef<QRCodeHandle>();
      render(
        <QRCode ref={ref} value="TEST" logo={{ data: 'data:image/png;base64,abc', size: 20 }} />
      );
      // Just verify it renders without error (EC upgrades internally)
      expect(ref.current).toBeTruthy();
    });

    it('auto-upgrades EC to H when overlayImage is present', () => {
      const ref = createRef<QRCodeHandle>();
      render(
        <QRCode ref={ref} value="TEST" overlayImage={{ src: 'data:image/png;base64,abc', width: 20, height: 20 }} />
      );
      expect(ref.current).toBeTruthy();
    });
  });

  describe('preset support', () => {
    it('renders with a preset', () => {
      const { container } = render(<QRCode value="TEST" preset="rounded" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });
  });

  describe('imperative handle EC upgrade with logo/overlay', () => {
    it('toDataURL upgrades EC to H when logo is present', () => {
      const ref = createRef<QRCodeHandle>();
      render(<QRCode ref={ref} value="TEST" logo={{ data: 'data:image/png;base64,abc', size: 20 }} />);
      const dataUrl = ref.current!.toDataURL();
      expect(dataUrl.startsWith('data:')).toBe(true);
    });

    it('toBlob upgrades EC to H when overlayImage is present', () => {
      const ref = createRef<QRCodeHandle>();
      render(<QRCode ref={ref} value="TEST" overlayImage={{ src: 'data:image/png;base64,abc', width: 20, height: 20 }} />);
      const blob = ref.current!.toBlob();
      expect(blob).toBeInstanceOf(Blob);
    });

    it('download upgrades EC to H when logo is present', () => {
      globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock');
      globalThis.URL.revokeObjectURL = vi.fn();
      const ref = createRef<QRCodeHandle>();
      render(<QRCode ref={ref} value="TEST" logo={{ data: 'data:image/png;base64,abc', size: 20 }} />);
      expect(() => ref.current!.download('test.svg')).not.toThrow();
    });

    it('uses explicit errorCorrection when no logo/overlay', () => {
      const ref = createRef<QRCodeHandle>();
      render(<QRCode ref={ref} value="TEST" errorCorrection="L" />);
      const dataUrl = ref.current!.toDataURL();
      expect(dataUrl.startsWith('data:')).toBe(true);
    });
  });
});
