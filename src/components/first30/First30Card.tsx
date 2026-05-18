// First 30 Minutes — single-A4 laminate-and-pin rapid response card.
// Distinct from the multi-page Word export of the same data: that uses the
// document-model pipeline (build-first30 → DocumentRenderer/Word). This card
// is purpose-built for one A4 sheet that goes on a wall.
//
// Pure presentation. All data derivation lives in `getFirst30Data` at
// `~/lib/selectors/first30-card`. No business logic in this file.

import type { PlanState } from '~/data/plan-schema';
import { getFirst30Data, type First30Contact as Contact } from '~/lib/selectors/first30-card';

interface Props {
  plan: PlanState;
}

function ContactRow({ label, contact }: { label: string; contact: Contact }) {
  const hasName = contact.name && contact.name.trim();
  const hasPhone = contact.phone && contact.phone.trim();
  if (!hasName && !hasPhone) {
    return (
      <div className="f30-contact-row">
        <span className="f30-lbl">{label}:</span>
        <span className="f30-val f30-val-empty">[not set]</span>
      </div>
    );
  }
  return (
    <div className="f30-contact-row">
      <span className="f30-lbl">{label}:</span>
      <span className="f30-val">
        {hasName && contact.name}
        {hasName && hasPhone && ' · '}
        {hasPhone && contact.phone}
      </span>
    </div>
  );
}

function TextContactRow({ label, value }: { label: string; value: string | null }) {
  if (!value) {
    return (
      <div className="f30-contact-row">
        <span className="f30-lbl">{label}:</span>
        <span className="f30-val f30-val-empty">[not set]</span>
      </div>
    );
  }
  return (
    <div className="f30-contact-row">
      <span className="f30-lbl">{label}:</span>
      <span className="f30-val">{value}</span>
    </div>
  );
}

export function First30Card({ plan }: Props) {
  const { phase1, phase2, phase3 } = getFirst30Data(plan);

  return (
    <div className="first30-card">
      {/* HEADER */}
      <div className="f30-header">
        <div>
          <h1 className="f30-title">
            🚨 FIRST 30 MINUTES — Cyber Incident
            <small>
              {plan.meta.schoolName || '[School / college name]'}
              {plan.meta.trustName ? ` · ${plan.meta.trustName}` : ''}
            </small>
          </h1>
        </div>
        <div className="f30-meta">
          <strong>Plan version {plan.meta.planVersion || '1.0'}</strong>
          <br />
          Updated {plan.meta.planDate || '[date not set]'}
          <br />
          Approved by {plan.meta.approvedBy || '[approver]'}
        </div>
      </div>

      {/* THREE PHASES */}
      <div className="f30-timeline">
        <div className="f30-phase f30-p1">
          <span className="f30-clock">⏱ 0–5 MIN</span>
          <h3>First responder (whoever spotted it)</h3>
          <ul>
            <li>Disconnect affected device(s) — pull cables, disable WiFi</li>
            <li>
              <strong>Do NOT power off</strong> (preserves forensic evidence)
            </li>
            <li>Stop using the device. Tell colleagues to stop using theirs</li>
            <li>
              Call SLT digital lead by <strong>phone</strong> — not email
            </li>
          </ul>
          <div className="f30-contacts">
            <ContactRow label="SLT digital lead" contact={phase1.sltLead} />
            <ContactRow label="Deputy" contact={phase1.deputy} />
          </div>
        </div>

        <div className="f30-phase f30-p2">
          <span className="f30-clock">⏱ 5–15 MIN</span>
          <h3>SLT digital lead</h3>
          <ul>
            <li>Convene the Cyber Incident Response Team (CIRT) — names below</li>
            <li>
              Assess severity: <strong>S1</strong> whole school down · <strong>S2</strong> major
              impact · <strong>S3</strong> limited · <strong>S4</strong> minor
            </li>
            <li>Open the incident log: time, who, what, decisions made</li>
            <li>Disable any compromised accounts / forced password reset</li>
          </ul>
          <div className="f30-contacts">
            <ContactRow label="IT Lead" contact={phase2.itLead} />
            <ContactRow label="Comms Lead" contact={phase2.commsLead} />
            <ContactRow label="DPO" contact={phase2.dpo} />
            <ContactRow label="SLT Sponsor" contact={phase2.sltSponsor} />
          </div>
        </div>

        <div className="f30-phase f30-p3">
          <span className="f30-clock">⏱ 15–30 MIN</span>
          <h3>Incident lead</h3>
          <ul>
            <li>
              If <strong>S1/S2</strong>: call your local authority cyber lead / insurer (record the
              number in External Contacts)
            </li>
            <li>
              If <strong>personal data</strong> involved: start the ICO 72-hour clock
            </li>
            <li>
              If <strong>criminal</strong>: Action Fraud{' '}
              <span className="f30-phone">0300 123 2040</span>
            </li>
            <li>Brief Headteacher: keep school open or send children home?</li>
            <li>Issue first parent communication — even just "we're aware"</li>
          </ul>
          <div className="f30-contacts">
            <TextContactRow label="IT support / MSP" value={phase3.itSupport} />
            <TextContactRow label="LA cyber lead / insurer" value={phase3.insurer} />
            <TextContactRow label="Broadband supplier" value={phase3.broadband} />
            <TextContactRow label="External DPO" value={phase3.externalDpo} />
          </div>
        </div>
      </div>

      {/* DO NOT + ESCALATION CHAIN */}
      <div className="f30-row">
        <div className="f30-block f30-donot">
          <h4>❌ Do NOT</h4>
          <ul>
            <li>Pay any ransom (NCSC and Welsh Government strongly advise against)</li>
            <li>Power off affected devices (loses forensic evidence)</li>
            <li>Contact or negotiate with the attackers</li>
            <li>Communicate via email systems that may be compromised</li>
            <li>Wipe or restore systems before forensic snapshot</li>
          </ul>
        </div>
        <div className="f30-block f30-escalation">
          <h4>🚨 Escalation chain</h4>
          <ol>
            <li>
              <strong>Internal:</strong> SLT digital lead → Headteacher → Chair of Governors
            </li>
            <li>
              <strong>Insurer:</strong> local authority cyber cover / cyber insurer (record line in
              External Contacts)
            </li>
            <li>
              <strong>Regulator:</strong> ICO breach reporting (within 72h if data involved)
            </li>
            <li>
              <strong>Crime:</strong> Action Fraud <span className="f30-phone">0300 123 2040</span>{' '}
              + report to NCSC
            </li>
            <li>
              <strong>Regional support:</strong> TARIAN (S Wales / Gwent / Dyfed-Powys) or NWROCU
              (N Wales) Cyber PROTECT team — free advice
            </li>
          </ol>
        </div>
      </div>

      {/* FOOTER */}
      <div className="f30-footer">
        <div>
          <strong>Print, laminate, post:</strong> by the Head's office, in the network room, in the
          bursar's drawer.
        </div>
        <div className="text-right">
          Cyber Incident Response Planner · cmaddocks-uk.github.io/cyber-response-cymru
        </div>
      </div>
    </div>
  );
}
