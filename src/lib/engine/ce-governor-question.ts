// State-aware Cyber Essentials assurance question for the Governor Report.
// Returns null when CE is comfortably in good standing (no question needed).
//
// Branches: not-yet-certified, status-set-but-no-date, lapsed certification,
// renewal approaching (<60 days), CE-only in 3-month CE Plus window.

import type { PlanState } from '~/data/plan-schema';

const DAY_MS = 86_400_000;

export function getCeGovernorQuestion(
  meta: PlanState['meta'],
  today = new Date(),
): string | null {
  const status = (meta.ceStatus ?? '').trim();
  const certDate = (meta.ceCertDate ?? '').trim();

  // Not yet certified — broad planning question.
  if (!status || status === 'Not started' || status === 'Working towards') {
    return 'How do you assure yourselves that the school has a clear plan and named owner for Cyber Essentials certification, with a target date appropriate to its scale, procurement and local authority cyber cover requirements?';
  }

  // Status set but no date — encourage tracking.
  if ((status === 'Cyber Essentials' || status === 'Cyber Essentials Plus') && !certDate) {
    return `Cyber Essentials status is recorded as ${status}, but no certification date is entered. How do you assure yourselves that the renewal cycle is being tracked and managed?`;
  }

  const cd = new Date(certDate);
  if (Number.isNaN(cd.getTime())) return null;

  // Annual renewal — has it lapsed?
  const renewal = new Date(cd);
  renewal.setFullYear(renewal.getFullYear() + 1);
  const renewalDaysLeft = Math.floor((renewal.getTime() - today.getTime()) / DAY_MS);

  if (renewalDaysLeft < 0) {
    return `The Cyber Essentials certification appears to have lapsed (renewal was due ${-renewalDaysLeft} day${
      -renewalDaysLeft === 1 ? '' : 's'
    } ago). Why has it lapsed, and what is the timeline for recertification?`;
  }

  if (renewalDaysLeft < 60) {
    return `Cyber Essentials renewal is approaching (${renewalDaysLeft} day${
      renewalDaysLeft === 1 ? '' : 's'
    } remaining). How do you assure yourselves that the renewal will be completed on time, with no risk of a lapse?`;
  }

  // Future-dated cert — most likely a data-entry mistake. Don't pretend
  // they're inside a window that hasn't opened yet; ask for clarification.
  if (renewalDaysLeft > 365) {
    return `The Cyber Essentials certification date is recorded in the future (${certDate}). Please verify the date — IASME issues a certification date in the past, never the future.`;
  }

  // Cyber Essentials only — in the 3-month CE Plus window?
  // The window opens at the CE cert date and closes 90 days later. Bound on
  // BOTH sides: `>= 0` (deadline not yet passed) AND `<= 90` (we're actually
  // inside the 90-day window — not standing 600 days before it opens).
  if (status === 'Cyber Essentials') {
    const cePlusDeadline = new Date(cd);
    cePlusDeadline.setMonth(cePlusDeadline.getMonth() + 3);
    const cePlusDaysLeft = Math.floor((cePlusDeadline.getTime() - today.getTime()) / DAY_MS);
    if (cePlusDaysLeft >= 0 && cePlusDaysLeft <= 90) {
      return `The school is in the 3-month window to take Cyber Essentials Plus on the same scope of certification (${cePlusDaysLeft} day${
        cePlusDaysLeft === 1 ? '' : 's'
      } remaining). How do you assure yourselves that CE Plus is being progressed, and who is leading that work?`;
    }
  }

  // Comfortably in good standing — silent.
  return null;
}
