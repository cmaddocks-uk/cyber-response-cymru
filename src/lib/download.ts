// Browser-side download helpers. Used by every toolbar that triggers a file
// save (JSON working data, Word document, etc.).

/** Filesystem-safe slug from arbitrary input. Caps length so file managers
 *  don't choke on a 400-character filename. */
export function slugify(input: string, maxLength = 40): string {
  return input
    .replace(/[^a-z0-9]+/gi, '-')
    .toLowerCase()
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength);
}

/** Triggers a browser download of a text Blob with the given filename. */
export function downloadText(text: string, filename: string, mime = 'application/json'): void {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
