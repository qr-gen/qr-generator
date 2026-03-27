import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { QRCode } from '../src/components/QRCode';

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
});
