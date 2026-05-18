// School logo handling. Ported from v1.x with the same constraints:
//   - PNG / JPEG / WebP only (SVG excluded — SVG documents can contain
//     <script> tags, so a hostile import via the schoolLogo field could
//     otherwise inject JS. PNG/JPEG/WebP are pure rasters and safe).
//   - Auto-downscale to max 400px on the longest side so the encoded data
//     URI fits comfortably under the 50 KB schema-merger string cap.
//   - PNG first (preserves transparency); fall back to JPEG with white
//     background if PNG comes out over ~45 KB.
//
// `safeLogoSrc` is the render-time guard — anything from imported JSON
// goes through it before being assigned to `<img src>`.

const SAFE_LOGO_PATTERN = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/;
const MAX_DIMENSION_PX = 400;
const PNG_SIZE_THRESHOLD = 45_000;
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
const ACCEPTED_MIMES = /^image\/(png|jpeg|jpg|webp)$/i;

/** Returns the input string if it parses as a safe raster data URI, else "". */
export function safeLogoSrc(value: unknown): string {
  return typeof value === 'string' && SAFE_LOGO_PATTERN.test(value) ? value : '';
}

export type UploadError =
  | 'wrong-type'
  | 'too-large'
  | 'decode-failed'
  | 'canvas-unsupported';

export type UploadResult = { ok: true; dataUrl: string } | { ok: false; reason: UploadError };

/**
 * Reads an image File, downscales it to fit within 400x400, and returns it as
 * a base64 data URI. Tries PNG first; falls back to JPEG with a white
 * background if the PNG exceeds ~45 KB.
 */
export async function uploadAndResize(file: File): Promise<UploadResult> {
  if (!ACCEPTED_MIMES.test(file.type)) return { ok: false, reason: 'wrong-type' };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, reason: 'too-large' };

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('read'));
    reader.readAsDataURL(file);
  });

  let img: HTMLImageElement;
  try {
    img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('decode'));
      el.src = dataUrl;
    });
  } catch {
    return { ok: false, reason: 'decode-failed' };
  }

  const ratio = Math.min(MAX_DIMENSION_PX / img.width, MAX_DIMENSION_PX / img.height, 1);
  const w = Math.max(1, Math.round(img.width * ratio));
  const h = Math.max(1, Math.round(img.height * ratio));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { ok: false, reason: 'canvas-unsupported' };

  ctx.drawImage(img, 0, 0, w, h);
  let out = canvas.toDataURL('image/png');

  if (out.length > PNG_SIZE_THRESHOLD) {
    // Re-render with white background and JPEG-encode for size.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    out = canvas.toDataURL('image/jpeg', 0.85);
  }

  if (!safeLogoSrc(out)) return { ok: false, reason: 'decode-failed' };
  return { ok: true, dataUrl: out };
}

export function uploadErrorMessage(reason: UploadError): string {
  switch (reason) {
    case 'wrong-type':
      return 'Please choose a PNG, JPEG or WebP image. (SVG is not supported.)';
    case 'too-large':
      return 'That image is larger than 2 MB. Please pick a smaller source file — the tool downscales automatically, but the source must be under 2 MB.';
    case 'decode-failed':
      return 'That file is not a valid image, or your browser cannot decode it.';
    case 'canvas-unsupported':
      return 'Your browser does not support image resizing. Please use a more recent browser.';
  }
}
