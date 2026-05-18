// Single source of truth for the top navigation.
//
// `href` values are written WITHOUT a leading base path; the TopBar component
// prepends `import.meta.env.BASE_URL` at render time so the same array works
// whether the site is served from `/` (custom domain) or `/cyber-response`
// (GitHub Pages project site).

export interface TabDef {
  label: string;
  href: string;
  /** True when the page is interactive and still a stub in the Astro rebuild. */
  stub?: boolean;
}

// Workflow-ordered as a linear timeline: assess → build → view → priorities → test → derived-cards → meta.
// Action Plan sits after Your Plan as a "having seen the plan, what's left to action" follow-up.
// `stub: true` is metadata only — currently unused by the UI, kept for future use
// (e.g. a "still to port" indicator during the v2 migration).
export const TABS: TabDef[] = [
  { label: 'Home', href: '/' },
  { label: 'Readiness Check', href: '/readiness' },
  { label: 'Plan Builder', href: '/plan' },
  { label: 'Your Plan', href: '/output' },
  { label: 'Action Plan', href: '/action-plan', stub: true },
  { label: 'Tabletop Exercises', href: '/tabletop', stub: true },
  { label: 'First 30 Minutes', href: '/first-30', stub: true },
  { label: 'Governor Reports', href: '/governor', stub: true },
  { label: 'Changelog', href: '/changelog' },
  { label: 'About', href: '/about' },
];

/**
 * Resolve a tab href against the site's base path. Use this anywhere you'd
 * otherwise hardcode `/cyber-response/foo` — keeps the base path change in
 * `astro.config.mjs` the single source of truth.
 */
export function withBase(href: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (href === '/') return base + '/';
  return base + href;
}

/**
 * Does `current` (an Astro.url.pathname) match this tab? Handles the
 * trailing-slash variants and the base-path prefix.
 */
export function isActive(href: string, current: string): boolean {
  const target = withBase(href).replace(/\/$/, '');
  const path = current.replace(/\/$/, '');
  if (target === '' && (path === '' || path === '/')) return true;
  return path === target;
}
