// Cover-page helpers shared by every builder. Keeps the format of the
// metadata strip and the operational statement consistent across the five
// reports so the cover pages read as a family.

import type { PlanState } from '~/data/plan-schema';

/** UK academic year window derived from a single ISO date, e.g. "2026-09-12"
 *  → "2026–27", "2026-03-12" → "2025–26". An empty / unparseable date
 *  returns an empty string so the renderer drops the value silently. */
export function academicYear(isoDate: string | undefined | null): string {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return '';
  // Aug onwards = next academic year.
  const startYear = d.getMonth() >= 7 ? d.getFullYear() : d.getFullYear() - 1;
  const endYY = String((startYear + 1) % 100).padStart(2, '0');
  return `${startYear}–${endYY}`; // en-dash
}

/** Short, human label for the Cyber Essentials status. Returns an empty
 *  string for "Not started" / "Working towards" / unset so the metadata
 *  line can drop the slot silently. */
export function ceStatusForCover(meta: PlanState['meta']): string {
  const status = (meta.ceStatus ?? '').trim();
  if (status === 'Cyber Essentials') return 'Cyber Essentials Certified';
  if (status === 'Cyber Essentials Plus') return 'Cyber Essentials Plus Certified';
  return '';
}

/** Format a UK date string ("2027-05-17" → "17 May 2027"). Unparseable
 *  inputs returned verbatim so the user sees whatever they entered. */
export function formatUkDate(isoDate: string | undefined | null): string {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}

/** Default operational statement for a Cyber Incident Response Plan.
 *  Builders may override; this is the boilerplate. */
export const DEFAULT_OPERATIONAL_STATEMENT =
  "This document defines the school's operational response procedures for cyber incidents including ransomware, service disruption, and data compromise.";

/** Format a date as "Month YYYY" — e.g. "2026-05-15" → "May 2026". Used as
 *  the cover's prepared-date line. Falls back to the current month if the
 *  input is empty or unparseable. */
export function preparedMonthYear(today: Date): string {
  return new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(today);
}

/** Single inline metadata row for the cover. Empty values drop out so the
 *  rendered line never reads "Approved [blank]". Builders for derived
 *  reports (Governor / ActionPlan / etc.) can pass `approvedKey` to label
 *  the planDate appropriately for their audience ("Issued" rather than
 *  "Approved" for a tabletop summary, say). */
export function coverMetaForPlan(
  plan: PlanState,
  opts: { approvedLabel?: string } = {},
): { value: string }[] {
  const row: { value: string }[] = [];
  const approvedLabel = opts.approvedLabel ?? 'Approved';
  if (plan.meta.planVersion) row.push({ value: `Version ${plan.meta.planVersion}` });
  if (plan.meta.planDate) row.push({ value: `${approvedLabel} ${formatUkDate(plan.meta.planDate)}` });
  if (plan.meta.nextReview) row.push({ value: `Next review ${formatUkDate(plan.meta.nextReview)}` });
  return row;
}
