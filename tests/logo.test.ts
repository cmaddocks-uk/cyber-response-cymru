import { describe, it, expect } from 'vitest';
import { safeLogoSrc, uploadErrorMessage } from '~/lib/logo';

// Minimal valid base64-PNG body for the regex check. Content doesn't need to
// be a real PNG — safeLogoSrc only validates the MIME prefix + base64 chars.
const TINY_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

describe('safeLogoSrc', () => {
  it('accepts a well-formed data:image/png;base64 URI', () => {
    const uri = `data:image/png;base64,${TINY_PNG}`;
    expect(safeLogoSrc(uri)).toBe(uri);
  });

  it('accepts JPEG and WebP', () => {
    expect(safeLogoSrc(`data:image/jpeg;base64,${TINY_PNG}`)).not.toBe('');
    expect(safeLogoSrc(`data:image/webp;base64,${TINY_PNG}`)).not.toBe('');
  });

  it('rejects SVG (script injection vector)', () => {
    expect(safeLogoSrc(`data:image/svg+xml;base64,${TINY_PNG}`)).toBe('');
  });

  it('rejects GIF (not in allowlist)', () => {
    expect(safeLogoSrc(`data:image/gif;base64,${TINY_PNG}`)).toBe('');
  });

  it('rejects http(s) URLs even if they end in a raster extension', () => {
    expect(safeLogoSrc('https://example.com/logo.png')).toBe('');
  });

  it('rejects bare base64 without the data: prefix', () => {
    expect(safeLogoSrc(TINY_PNG)).toBe('');
  });

  it('rejects malformed base64 characters', () => {
    expect(safeLogoSrc('data:image/png;base64,!!!not-base64!!!')).toBe('');
  });

  it('rejects non-strings without throwing', () => {
    expect(safeLogoSrc(null)).toBe('');
    expect(safeLogoSrc(undefined)).toBe('');
    expect(safeLogoSrc(42 as unknown)).toBe('');
    expect(safeLogoSrc({} as unknown)).toBe('');
  });
});

describe('uploadErrorMessage', () => {
  it('returns a human message for every documented error code', () => {
    expect(uploadErrorMessage('wrong-type')).toMatch(/png|jpeg|webp/i);
    expect(uploadErrorMessage('too-large')).toMatch(/2 ?mb/i);
    expect(uploadErrorMessage('decode-failed')).toMatch(/decode/i);
    expect(uploadErrorMessage('canvas-unsupported')).toMatch(/browser/i);
  });
});
