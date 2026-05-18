/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      // Mirrors the CSS custom-property palette from the v1.x single-file build
      // so utility classes like bg-navy / text-accent / border-line work the
      // same way the old `var(--navy)` etc. did.
      colors: {
        navy: { DEFAULT: '#0b2545', 2: '#13315c' },
        accent: '#1f6feb',
        ink: '#0f172a',
        muted: '#5b6a82',
        line: '#e3e8ef',
        // Status palette — RAG + their light tints, used for callouts,
        // severity rows, readiness dots.
        success: { DEFAULT: '#0a8a3a', soft: '#e7f5ec' },
        warning: { DEFAULT: '#b45309', soft: '#fdf3e2' },
        danger: { DEFAULT: '#b42318', soft: '#fbe9e7' },
      },
      fontFamily: {
        // Body text — IBM Plex Sans first, then Inter, then the system cascade.
        sans: [
          'IBM Plex Sans',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        // Display / headings — Fraunces gives the printed report a civic /
        // school-prospectus feel without being stuffy.
        display: [
          'Fraunces',
          'Georgia',
          'Cambria',
          'Times New Roman',
          'serif',
        ],
        mono: ['ui-monospace', 'Consolas', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,.04), 0 4px 12px rgba(15,23,42,.06)',
      },
      borderRadius: {
        card: '10px',
      },
    },
  },
  plugins: [],
};
