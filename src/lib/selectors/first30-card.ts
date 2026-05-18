// First 30 Minutes card selector. Derives the contact list and the per-phase
// data the card renders. Keeps the SLT-Sponsor fallback rule (regex-match
// against additional members) out of the React component so it's testable.

import type { PlanState } from '~/data/plan-schema';

export interface First30Contact {
  name?: string;
  phone?: string;
}

export interface First30Data {
  /** Phase 1 (0–5 min): first responder contacts. */
  phase1: { sltLead: First30Contact; deputy: First30Contact };
  /** Phase 2 (5–15 min): CIRT convene contacts. */
  phase2: {
    itLead: First30Contact;
    commsLead: First30Contact;
    dpo: First30Contact;
    sltSponsor: First30Contact;
  };
  /** Phase 3 (15–30 min): external escalation contacts as free-text rows. */
  phase3: {
    itSupport: string | null;
    insurer: string | null;
    broadband: string | null;
    externalDpo: string | null;
  };
}

/** Matches role descriptions that look like a senior sponsor — Head, Principal,
 *  CEO, Chair (of governors), Executive. */
const SPONSOR_ROLE_PATTERN = /head|principal|exec|ceo|chair|sponsor/i;

export function getFirst30Data(plan: PlanState): First30Data {
  const t = plan.team;
  const ext = plan.external;

  return {
    phase1: {
      sltLead: { name: t.leadName, phone: t.leadPhone },
      deputy: { name: t.deputyName, phone: t.deputyPhone },
    },
    phase2: {
      itLead: { name: t.itLeadName, phone: t.itLeadPhone },
      commsLead: { name: t.commsLeadName, phone: t.commsLeadPhone },
      dpo: { name: t.dpoName, phone: t.dpoPhone },
      sltSponsor: findSltSponsor(plan),
    },
    phase3: {
      itSupport: itSupportText(ext.itProvider),
      insurer: nonEmpty(ext.rpa) ?? nonEmpty(ext.cyberInsurer),
      broadband: nonEmpty(ext.broadbandSupplier),
      externalDpo: externalDpoText(t),
    },
  };
}

/** SLT Sponsor isn't a named CIRT role — best-effort match against the team's
 *  additional members (Head / Principal / CEO / Chair / Exec / Sponsor), then
 *  fall back to the plan's "Approved by" name. */
export function findSltSponsor(plan: PlanState): First30Contact {
  const member = (plan.team.members ?? []).find((m) =>
    SPONSOR_ROLE_PATTERN.test(m.role ?? ''),
  );
  if (member) return { name: member.name, phone: member.phone };
  return { name: plan.meta.approvedBy, phone: '' };
}

function nonEmpty(value: string | undefined | null): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function itSupportText(itp: PlanState['external']['itProvider']): string | null {
  if (!itp.name && !itp.contact && !itp.phone) return null;
  return [itp.name, itp.contact, itp.phone].filter(Boolean).join(' · ');
}

function externalDpoText(team: PlanState['team']): string | null {
  // External DPO is signalled by having an organisation name filled in.
  // Without that we treat the DPO as internal and don't surface a duplicate row.
  if (!team.dpoOrg || team.dpoOrg.trim() === '') return null;
  if (!team.dpoName && !team.dpoPhone) return null;
  return [team.dpoName, team.dpoOrg, team.dpoPhone].filter(Boolean).join(' · ');
}
