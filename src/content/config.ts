import { defineCollection, z } from 'astro:content';

// Each changelog entry is a markdown file at src/content/changelog/<version>.md
// with frontmatter:
//
//   version: "1.7.0"
//   date: 2026-05-10
//   summary: "Asset register & Business Impact Analysis, SaaS-supplier-incident playbook..."
//   bump: minor   # major | minor | patch
//
// The page at src/pages/changelog.astro reads them with getCollection() and
// renders them newest-first as collapsible <details> blocks. Adding a new
// version is now "drop a new markdown file" — no editing the page template.

const changelog = defineCollection({
  type: 'content',
  schema: z.object({
    version: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    bump: z.enum(['major', 'minor', 'patch']).optional(),
    /** Release-type badges shown next to the version on the changelog page.
     *  Optional — if omitted, the page infers a single badge from `bump`
     *  (major→Breaking, minor→Feature, patch→Fix). */
    tags: z
      .array(z.enum(['Feature', 'Fix', 'Security', 'UI', 'Breaking']))
      .optional(),
  }),
});

export const collections = { changelog };
