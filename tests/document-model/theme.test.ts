import { describe, it, expect } from 'vitest';
import { PALETTE, SEVERITY_TOKENS, cssHex, severityCss, FONTS, TYPE } from '~/lib/document-model/theme';

describe('theme', () => {
  it('palette hex values are 6-char hex without leading #', () => {
    for (const v of Object.values(PALETTE)) {
      expect(v).toMatch(/^[0-9A-Fa-f]{6}$/);
    }
  });

  it('every severity has fill/text/edge/rowTint plus grayscale letter + symbol', () => {
    for (const sev of ['red', 'amber', 'green', 'navy', 'muted'] as const) {
      const t = SEVERITY_TOKENS[sev];
      expect(t.fill).toMatch(/^[0-9A-F]{6}$/i);
      expect(t.text).toMatch(/^[0-9A-F]{6}$/i);
      expect(t.edge).toMatch(/^[0-9A-F]{6}$/i);
      expect(t.rowTint).toMatch(/^[0-9A-F]{6}$/i);
      expect(['R', 'A', 'G', 'N', '·']).toContain(t.letter);
      expect(['●', '○']).toContain(t.symbol);
    }
  });

  it('cssHex prepends "#"', () => {
    expect(cssHex('0B2545')).toBe('#0B2545');
  });

  it('severityCss returns css-prefixed tokens', () => {
    const c = severityCss('red');
    expect(c.fill.startsWith('#')).toBe(true);
    expect(c.text.startsWith('#')).toBe(true);
    expect(c.edge.startsWith('#')).toBe(true);
    expect(c.rowTint.startsWith('#')).toBe(true);
  });

  it('exposes font family + type scale', () => {
    expect(FONTS.display).toBe('Fraunces');
    expect(FONTS.body).toBe('IBM Plex Sans');
    expect(TYPE.coverTitle.docx).toBeGreaterThan(TYPE.body.docx);
    expect(TYPE.h1.docx).toBeGreaterThan(TYPE.h3.docx);
  });
});
