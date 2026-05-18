// Defence-in-depth HTML escape. React handles escaping for normal renders, so
// the only places this gets used in v2 are:
//   - Word / .doc export (we stringify HTML ourselves)
//   - Anywhere `set:html` / `dangerouslySetInnerHTML` is the only option
//
// Covers more than the strict minimum (&, <, >, ", ') — also escapes /, `, =
// which can break out of unquoted attributes and HTML comments. Matches the
// v1.7.0 implementation byte-for-byte; the test suite covers each character.

const REPLACEMENTS: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

export function escapeHtml(input: unknown): string {
  if (input === null || input === undefined) return '';
  return String(input).replace(/[&<>"'/`=]/g, (c) => REPLACEMENTS[c] ?? c);
}
