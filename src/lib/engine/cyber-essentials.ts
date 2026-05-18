// Cyber Essentials rules — pure date arithmetic for the CE / CE Plus / annual
// renewal cycle. Ported from v1.x ceStatusHtml() as a pure helper that returns
// structured data; rendering happens in components.
//
// Rules (matches IASME's published guidance):
//   - CE Plus must be taken on the same scope within 3 months of CE.
//     We surface a deadline countdown only while in that window.
//   - CE and CE Plus both expire 12 months after certification. We only
//     surface the renewal countdown when it's approaching (<60 days) or
//     already lapsed — otherwise it would be noise year-round.

import type { PlanState } from '~/data/plan-schema';

export type Severity = 'green' | 'amber' | 'red';

export interface CeStatusSummary {
  /** True if any CE info should be rendered. False = render nothing. */
  visible: boolean;
  /** Status label as the user entered it (e.g. "Cyber Essentials Plus"). */
  statusLabel: string;
  /** ISO date string if cert date was set and parseable, else empty. */
  certDate: string;
  /** Optional CE Plus 3-month deadline countdown (only for "Cyber Essentials" status, while in window). */
  cePlusDeadline?: { date: string; daysLeft: number; severity: Severity };
  /** Optional annual renewal countdown — only surfaced when approaching or lapsed. */
  renewalDeadline?:
    | { lapsed: true; date: string; daysSince: number }
    | { lapsed: false; date: string; daysLeft: number; severity: Severity };
}

const DAY_MS = 86_400_000;

export function getCeStatusSummary(meta: PlanState['meta'], today = new Date()): CeStatusSummary {
  const statusLabel = (meta.ceStatus ?? '').trim();
  if (!statusLabel) {
    return { visible: false, statusLabel: '', certDate: '' };
  }

  const certDateStr = (meta.ceCertDate ?? '').trim();
  const isCertified = statusLabel === 'Cyber Essentials' || statusLabel === 'Cyber Essentials Plus';

  // Status set but not certified, or no cert date — show only the status label.
  if (!isCertified || !certDateStr) {
    return { visible: true, statusLabel, certDate: certDateStr };
  }

  const cd = new Date(certDateStr);
  if (Number.isNaN(cd.getTime())) {
    return { visible: true, statusLabel, certDate: certDateStr };
  }

  const result: CeStatusSummary = { visible: true, statusLabel, certDate: certDateStr };

  // CE Plus deadline (only when status is plain "Cyber Essentials", only
  // while actually inside the 3-month window). Bounded on BOTH sides: the
  // deadline must be in the future (`daysLeft >= 0`) AND within 90 days
  // (`daysLeft <= 90`) — otherwise the cert date is in the future and
  // hasn't opened the window yet.
  if (statusLabel === 'Cyber Essentials') {
    const deadline = new Date(cd);
    deadline.setMonth(deadline.getMonth() + 3);
    const daysLeft = Math.floor((deadline.getTime() - today.getTime()) / DAY_MS);
    if (daysLeft >= 0 && daysLeft <= 90) {
      result.cePlusDeadline = {
        date: deadline.toISOString().slice(0, 10),
        daysLeft,
        severity: daysLeft < 28 ? 'amber' : 'green',
      };
    }
  }

  // Annual renewal — only surface when approaching (<60 days) or lapsed.
  const renewal = new Date(cd);
  renewal.setFullYear(renewal.getFullYear() + 1);
  const renewalIso = renewal.toISOString().slice(0, 10);
  const daysLeft = Math.floor((renewal.getTime() - today.getTime()) / DAY_MS);
  if (daysLeft < 0) {
    result.renewalDeadline = { lapsed: true, date: renewalIso, daysSince: -daysLeft };
  } else if (daysLeft < 60) {
    result.renewalDeadline = {
      lapsed: false,
      date: renewalIso,
      daysLeft,
      severity: daysLeft < 28 ? 'red' : 'amber',
    };
  }

  return result;
}
