import { useRef, useState } from 'react';
import { QRCode } from '@qr-kit/react';
import type { QRCodeHandle } from '@qr-kit/react';
import { formatWifi, formatVCard, formatCalendarEvent, formatSMS, formatEmail, formatGeo } from '@qr-kit/core';

// Tiny 8x8 PNG logo as data URI (a simple blue square)
const SAMPLE_LOGO = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAE0lEQVQYV2Nk+M/wn4EIwMgAAFadBAkLhvdIAAAAAElFTkSuQmCC';

export function App() {
  const qrRef = useRef<QRCodeHandle>(null);
  const [activeSection, setActiveSection] = useState<string>('basic');

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <h1 style={{ borderBottom: '2px solid #eee', paddingBottom: 12 }}>
        QR Kit — React Example
      </h1>
      <p style={{ color: '#666' }}>
        Comprehensive demo of all @qr-kit/react features including Phase 1-4 capabilities.
      </p>

      {/* Navigation */}
      <nav style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {['basic', 'shapes', 'colors', 'finders', 'logo', 'overlay', 'frame', 'phase4', 'dataHelpers', 'presets', 'download'].map(section => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            style={{
              padding: '8px 16px',
              border: activeSection === section ? '2px solid #333' : '1px solid #ccc',
              borderRadius: 8,
              background: activeSection === section ? '#333' : '#fff',
              color: activeSection === section ? '#fff' : '#333',
              cursor: 'pointer',
              fontWeight: activeSection === section ? 600 : 400,
            }}
          >
            {section.charAt(0).toUpperCase() + section.slice(1)}
          </button>
        ))}
      </nav>

      {/* Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>

        {/* ===== BASIC ===== */}
        {activeSection === 'basic' && <>
          <Card title="Default">
            <QRCode value="https://example.com" />
          </Card>

          <Card title="Custom Size (128px)">
            <QRCode value="https://example.com" size={128} />
          </Card>

          <Card title="Custom Size (400px)">
            <QRCode value="https://example.com" size={400} />
          </Card>

          <Card title="High Error Correction">
            <QRCode value="https://example.com" errorCorrection="H" />
          </Card>

          <Card title="Custom Colors">
            <QRCode
              value="https://example.com"
              fgColor="#1a1a2e"
              bgColor="#e8e8e8"
            />
          </Card>

          <Card title="Background Opacity">
            <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', padding: 10, borderRadius: 8 }}>
              <QRCode
                value="https://example.com"
                bgOpacity={0.85}
                bgColor="#ffffff"
              />
            </div>
          </Card>

          <Card title="Transparent Background">
            <div style={{ background: 'repeating-conic-gradient(#ddd 0% 25%, #fff 0% 50%) 50%/20px 20px', padding: 10 }}>
              <QRCode
                value="https://example.com"
                bgColor="transparent"
                fgColor="#333333"
                size={200}
              />
            </div>
          </Card>

          <Card title="Border Radius">
            <QRCode
              value="https://example.com"
              borderRadius={20}
              bgColor="#f0f0f0"
            />
          </Card>
        </>}

        {/* ===== SHAPES ===== */}
        {activeSection === 'shapes' && <>
          <Card title="Square (default)">
            <QRCode value="https://example.com" shape="square" />
          </Card>

          <Card title="Rounded">
            <QRCode value="https://example.com" shape="rounded" />
          </Card>

          <Card title="Dots">
            <QRCode value="https://example.com" shape="dots" />
          </Card>

          <Card title="Diamond">
            <QRCode value="https://example.com" shape="diamond" />
          </Card>

          <Card title="Module Scale 0.7">
            <QRCode
              value="https://example.com"
              shape="dots"
              moduleScale={0.7}
            />
          </Card>

          <Card title="Module Scale 0.5 + Diamond">
            <QRCode
              value="https://example.com"
              shape="diamond"
              moduleScale={0.5}
            />
          </Card>
        </>}

        {/* ===== COLORS ===== */}
        {activeSection === 'colors' && <>
          <Card title="Linear Gradient (45deg)">
            <QRCode
              value="https://example.com"
              fgColor={{
                type: 'linear',
                colors: ['#667eea', '#764ba2'],
                angle: 45,
              }}
            />
          </Card>

          <Card title="Linear Gradient (0deg)">
            <QRCode
              value="https://example.com"
              fgColor={{
                type: 'linear',
                colors: ['#f093fb', '#f5576c'],
                angle: 0,
              }}
            />
          </Card>

          <Card title="Radial Gradient">
            <QRCode
              value="https://example.com"
              fgColor={{
                type: 'radial',
                colors: ['#4facfe', '#00f2fe'],
              }}
            />
          </Card>

          <Card title="3-Color Gradient">
            <QRCode
              value="https://example.com"
              fgColor={{
                type: 'linear',
                colors: ['#ff6b6b', '#feca57', '#48dbfb'],
                angle: 135,
              }}
            />
          </Card>

          <Card title="Dark Mode">
            <div style={{ background: '#1a1a2e', padding: 10, borderRadius: 8 }}>
              <QRCode
                value="https://example.com"
                fgColor="#e0e0e0"
                bgColor="#1a1a2e"
              />
            </div>
          </Card>
        </>}

        {/* ===== FINDERS ===== */}
        {activeSection === 'finders' && <>
          <Card title="Circle Finders">
            <QRCode
              value="https://example.com"
              finderShape="circle"
              shape="dots"
            />
          </Card>

          <Card title="Rounded Finders">
            <QRCode
              value="https://example.com"
              finderShape="rounded"
              shape="rounded"
            />
          </Card>

          <Card title="Finder Color">
            <QRCode
              value="https://example.com"
              finderColor="#e94560"
              shape="dots"
              finderShape="circle"
            />
          </Card>

          <Card title="Independent Outer/Inner Colors">
            <QRCode
              value="https://example.com"
              finderOuterColor="#e94560"
              finderInnerColor="#0f3460"
              shape="rounded"
            />
          </Card>

          <Card title="Independent Outer/Inner Shapes">
            <QRCode
              value="https://example.com"
              finderOuterShape="rounded"
              finderInnerShape="circle"
              finderOuterColor="#6c5ce7"
              finderInnerColor="#fd79a8"
              shape="rounded"
            />
          </Card>

          <Card title="Gradient Finder Colors">
            <QRCode
              value="https://example.com"
              finderColor={{
                type: 'linear',
                colors: ['#ee5a24', '#f368e0'],
                angle: 90,
              }}
              shape="dots"
              finderShape="circle"
            />
          </Card>
        </>}

        {/* ===== LOGO ===== */}
        {activeSection === 'logo' && <>
          <Card title="Logo (center)">
            <QRCode
              value="https://example.com"
              logo={{
                src: SAMPLE_LOGO,
                width: 40,
                height: 40,
              }}
            />
            <p style={{ fontSize: 12, color: '#888', marginTop: 8 }}>EC auto-upgraded to H</p>
          </Card>

          <Card title="Logo + Rounded Shape">
            <QRCode
              value="https://example.com"
              logo={{
                src: SAMPLE_LOGO,
                width: 50,
                height: 50,
                padding: 10,
              }}
              shape="rounded"
              finderShape="rounded"
              fgColor="#2d3436"
            />
          </Card>

          <Card title="Logo + Circle Finders">
            <QRCode
              value="https://example.com"
              logo={{
                src: SAMPLE_LOGO,
                width: 40,
                height: 40,
              }}
              shape="dots"
              finderShape="circle"
              finderColor="#e94560"
            />
          </Card>

          <Card title="Logo + Gradient">
            <QRCode
              value="https://example.com"
              logo={{
                src: SAMPLE_LOGO,
                width: 45,
                height: 45,
              }}
              fgColor={{
                type: 'linear',
                colors: ['#6c5ce7', '#a29bfe'],
                angle: 45,
              }}
              finderShape="circle"
            />
          </Card>

          <Card title="Logo + Border Radius">
            <QRCode
              value="https://example.com"
              logo={{
                src: SAMPLE_LOGO,
                width: 40,
                height: 40,
              }}
              borderRadius={16}
              shape="rounded"
              bgColor="#f8f9fa"
            />
          </Card>
        </>}

        {/* ===== OVERLAY ===== */}
        {activeSection === 'overlay' && <>
          <Card title="Overlay Image">
            <QRCode
              value="https://example.com"
              overlayImage={{
                src: SAMPLE_LOGO,
                opacity: 0.15,
              }}
              shape="dots"
              moduleScale={0.8}
            />
            <p style={{ fontSize: 12, color: '#888', marginTop: 8 }}>Image behind modules, EC auto-H</p>
          </Card>

          <Card title="Overlay + Finder Background">
            <QRCode
              value="https://example.com"
              overlayImage={{
                src: SAMPLE_LOGO,
                opacity: 0.2,
                finderBackgroundColor: '#ffffff',
              }}
              finderShape="circle"
              shape="dots"
            />
          </Card>
        </>}

        {/* ===== FRAME ===== */}
        {activeSection === 'frame' && <>
          <Card title="Square Frame">
            <QRCode
              value="https://example.com"
              frame={{
                style: 'square',
                color: '#333333',
                thickness: 3,
              }}
              size={240}
            />
          </Card>

          <Card title="Frame + Label">
            <QRCode
              value="https://example.com"
              frame={{
                style: 'rounded',
                color: '#e94560',
                thickness: 3,
                label: 'Scan Me',
                labelPosition: 'bottom',
                labelColor: '#e94560',
                labelFontSize: 14,
                padding: 8,
              }}
              size={240}
              finderColor="#e94560"
            />
          </Card>

          <Card title="Frame + Top Label">
            <QRCode
              value="https://example.com"
              frame={{
                style: 'square',
                color: '#2d3436',
                thickness: 2,
                label: 'Visit our site',
                labelPosition: 'top',
                labelColor: '#2d3436',
                labelFontSize: 12,
                padding: 10,
              }}
              size={240}
              shape="rounded"
            />
          </Card>
        </>}

        {/* ===== PHASE 4 FEATURES ===== */}
        {activeSection === 'phase4' && <>
          <Card title="Margin Color">
            <QRCode
              value="https://example.com"
              marginColor="#e94560"
              bgColor="#ffffff"
              fgColor="#1a1a2e"
            />
            <p style={{ fontSize: 12, color: '#888', marginTop: 8 }}>Red quiet zone, white inner bg</p>
          </Card>

          <Card title="Margin Color + Dark Theme">
            <QRCode
              value="https://example.com"
              marginColor="#2d3436"
              bgColor="#dfe6e9"
              fgColor="#2d3436"
            />
          </Card>

          <Card title="Alignment Pattern Color">
            <QRCode
              value="HELLO WORLD THIS IS A LONGER STRING FOR QR"
              alignmentColor="#e94560"
              fgColor="#2d3436"
              finderColor="#6c5ce7"
            />
            <p style={{ fontSize: 12, color: '#888', marginTop: 8 }}>V3 QR: red alignment, purple finders</p>
          </Card>

          <Card title="Timing Pattern Color">
            <QRCode
              value="https://example.com"
              timingColor="#00b894"
              fgColor="#2d3436"
            />
            <p style={{ fontSize: 12, color: '#888', marginTop: 8 }}>Green timing patterns</p>
          </Card>

          <Card title="All Pattern Colors">
            <QRCode
              value="HELLO WORLD THIS IS A LONGER STRING FOR QR"
              fgColor="#2d3436"
              finderOuterColor="#6c5ce7"
              finderInnerColor="#a29bfe"
              alignmentColor="#e94560"
              timingColor="#00b894"
            />
            <p style={{ fontSize: 12, color: '#888', marginTop: 8 }}>Every pattern type colored independently</p>
          </Card>

          <Card title="SVG Path Optimization">
            <QRCode
              value="https://example.com"
              shape="square"
              optimizeSvg={true}
              fgColor="#2d3436"
            />
            <p style={{ fontSize: 12, color: '#888', marginTop: 8 }}>Merged adjacent modules into paths</p>
          </Card>

          <Card title="Margin Color + Logo">
            <QRCode
              value="https://example.com"
              marginColor="#1a1a2e"
              bgColor="#ffffff"
              fgColor="#1a1a2e"
              logo={{
                src: SAMPLE_LOGO,
                width: 40,
                height: 40,
              }}
              finderShape="circle"
              shape="dots"
            />
          </Card>

          <Card title="Gradient Alignment Color">
            <QRCode
              value="HELLO WORLD THIS IS A LONGER STRING FOR QR"
              alignmentColor={{
                type: 'radial',
                colors: ['#ff6b6b', '#feca57'],
              }}
              fgColor="#2d3436"
            />
          </Card>
        </>}

        {/* ===== DATA HELPERS ===== */}
        {activeSection === 'dataHelpers' && <>
          <Card title="WiFi Network">
            <QRCode
              value={formatWifi({ ssid: 'CafeGuest', password: 's3cret', encryption: 'WPA' })}
              shape="rounded"
              finderShape="rounded"
              fgColor="#2d3436"
              size={220}
            />
            <p style={{ fontSize: 12, color: '#888', marginTop: 8 }}>Scan to join WiFi</p>
          </Card>

          <Card title="Contact vCard">
            <QRCode
              value={formatVCard({ firstName: 'Jane', lastName: 'Doe', phone: '+1234567890', email: 'jane@example.com', organization: 'Acme Inc' })}
              shape="dots"
              finderShape="circle"
              fgColor="#6c5ce7"
              size={220}
            />
            <p style={{ fontSize: 12, color: '#888', marginTop: 8 }}>Scan to add contact</p>
          </Card>

          <Card title="Calendar Event">
            <QRCode
              value={formatCalendarEvent({ title: 'Launch Party', start: '2026-04-01T18:00', end: '2026-04-01T22:00', location: 'HQ' })}
              fgColor="#e94560"
              size={220}
            />
            <p style={{ fontSize: 12, color: '#888', marginTop: 8 }}>Scan to add event</p>
          </Card>

          <Card title="SMS">
            <QRCode
              value={formatSMS({ phone: '+1234567890', message: 'Hello from QR Kit!' })}
              shape="rounded"
              fgColor="#00b894"
              size={220}
            />
            <p style={{ fontSize: 12, color: '#888', marginTop: 8 }}>Scan to send SMS</p>
          </Card>

          <Card title="Email">
            <QRCode
              value={formatEmail({ to: 'hello@example.com', subject: 'Hello!', body: 'Sent from a QR code' })}
              fgColor="#0984e3"
              size={220}
            />
            <p style={{ fontSize: 12, color: '#888', marginTop: 8 }}>Scan to compose email</p>
          </Card>

          <Card title="Geo Location">
            <QRCode
              value={formatGeo({ latitude: 37.7749, longitude: -122.4194 })}
              shape="diamond"
              fgColor="#fdcb6e"
              bgColor="#2d3436"
              size={220}
            />
            <p style={{ fontSize: 12, color: '#888', marginTop: 8 }}>Scan to open in maps</p>
          </Card>
        </>}

        {/* ===== PRESETS ===== */}
        {activeSection === 'presets' && <>
          {(['default', 'minimal', 'rounded', 'dots', 'sharp', 'elegant'] as const).map(preset => (
            <Card key={preset} title={`Preset: ${preset}`}>
              <QRCode
                value="https://example.com"
                preset={preset}
                size={200}
              />
            </Card>
          ))}

          <Card title="Preset + Override">
            <QRCode
              value="https://example.com"
              preset="elegant"
              fgColor="#e94560"
              size={200}
            />
            <p style={{ fontSize: 12, color: '#888', marginTop: 8 }}>elegant preset + custom fgColor</p>
          </Card>
        </>}

        {/* ===== DOWNLOAD ===== */}
        {activeSection === 'download' && <>
          <Card title="Download via Ref">
            <QRCode
              ref={qrRef}
              value="https://example.com"
              shape="rounded"
              finderShape="circle"
              fgColor="#6c5ce7"
              size={220}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <button
                onClick={() => qrRef.current?.download('my-qr.png')}
                style={btnStyle}
              >
                Download PNG
              </button>
              <button
                onClick={() => {
                  const url = qrRef.current?.toDataURL();
                  if (url) console.log('Data URL:', url.slice(0, 80) + '...');
                  alert('Data URL logged to console');
                }}
                style={btnStyle}
              >
                Get Data URL
              </button>
            </div>
          </Card>
        </>}
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '6px 14px',
  border: '1px solid #ccc',
  borderRadius: 6,
  background: '#fff',
  cursor: 'pointer',
  fontSize: 13,
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: 12,
      padding: 20,
      background: '#fff',
    }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15, color: '#333' }}>{title}</h3>
      {children}
    </div>
  );
}
