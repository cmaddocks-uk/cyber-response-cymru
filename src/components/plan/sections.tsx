// All eleven Plan Builder sections. One file because:
//   - they share the same `(plan, updatePlan)` prop shape, so the helper
//     patterns are uniform;
//   - co-location makes it easy to scan all sections side by side when
//     tweaking layout / wording;
//   - each section is short enough that file overhead would outweigh the
//     "one concept per file" benefit.
//
// Pattern per section:
//   1. extract a small typed updater for the slice
//   2. render a series of <FieldShell>-style inputs (TextField, TextAreaField,
//      SelectField from ./Field), plus any section-specific bits (repeaters,
//      callouts).
//
// Schema lives in `~/data/plan-schema`. Don't rename fields here — the JSON
// import path depends on the shape matching v1.x verbatim.

import { useRef, type ReactNode } from 'react';
import type {
  AssetRow,
  OtherSupplier,
  PlanState,
  PlaybookFlag,
  PlaybookKey,
  TeamMember,
} from '~/data/plan-schema';
import { PLAYBOOKS, PLAYBOOK_BY_KEY } from '~/data/playbooks';
import { COMMS_TEMPLATE_BY_FIELD, type CommsField } from '~/data/comms-templates';
import { safeLogoSrc, uploadAndResize, uploadErrorMessage } from '~/lib/logo';
import { TextField, TextAreaField, SelectField, FieldGrid } from './Field';

export type Updater = (producer: (p: PlanState) => PlanState) => void;

interface SectionProps {
  plan: PlanState;
  updatePlan: Updater;
}

// =============================================================================
// 1. SCHOOL DETAILS
// =============================================================================
export function MetaSection({ plan, updatePlan }: SectionProps) {
  const set = <K extends keyof PlanState['meta']>(key: K, value: PlanState['meta'][K]) => {
    updatePlan((p) => ({ ...p, meta: { ...p.meta, [key]: value } }));
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const logoSrc = safeLogoSrc(plan.meta.schoolLogo);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-uploading the same filename
    if (!file) return;
    const result = await uploadAndResize(file);
    if (!result.ok) {
      alert(uploadErrorMessage(result.reason));
      return;
    }
    set('schoolLogo', result.dataUrl);
  };

  return (
    <div className="card">
      <h2 className="m-0 mb-1 text-xl font-bold text-navy">School details</h2>
      <p className="m-0 mb-3 text-sm text-muted">Identifying information for the front of your plan.</p>
      <FieldGrid>
        <TextField label="School / college name" value={plan.meta.schoolName} onChange={(v) => set('schoolName', v)} />
        <TextField label="Trust / federation (if applicable)" value={plan.meta.trustName} onChange={(v) => set('trustName', v)} />
        <TextField label="URN" hint="Unique Reference Number" value={plan.meta.urn} onChange={(v) => set('urn', v)} />
        <TextField label="Plan version" hint="e.g. 1.0, 2.1" value={plan.meta.planVersion} onChange={(v) => set('planVersion', v)} />
        <TextField label="Plan date" type="date" value={plan.meta.planDate} onChange={(v) => set('planDate', v)} />
        <TextField label="Next review date" hint="Recommended: annual" type="date" value={plan.meta.nextReview} onChange={(v) => set('nextReview', v)} />
        <TextField label="Approved by (name)" hint="Headteacher / CEO / Chair of Governors" value={plan.meta.approvedBy} onChange={(v) => set('approvedBy', v)} />
        <TextField label="Approver role" value={plan.meta.approverRole} onChange={(v) => set('approverRole', v)} />
        <SelectField
          label="Cyber Essentials status"
          hint="NCSC-backed certification scheme. See About page for details."
          value={plan.meta.ceStatus}
          onChange={(v) => set('ceStatus', v)}
          options={['', 'Not started', 'Working towards', 'Cyber Essentials', 'Cyber Essentials Plus']}
        />
        <TextField
          label="CE certification date (if applicable)"
          hint="If status is 'Cyber Essentials', the CE Plus deadline is auto-calculated (cert date + 3 months)."
          type="date"
          value={plan.meta.ceCertDate}
          onChange={(v) => set('ceCertDate', v)}
        />
      </FieldGrid>

      <h3 className="mt-5 text-base font-bold text-navy">School logo (optional)</h3>
      <p className="m-0 mb-2 text-[13px] text-muted">
        PNG, JPEG or WebP — auto-resized to max 400px so it doesn't bloat your saved plan.
        Appears centred above the title on the printed plan and the governor report. Stays in
        your browser like everything else — never uploaded anywhere.
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleLogoUpload}
        className="hidden"
      />
      <div className="mt-2 flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-md border border-line bg-white px-3 py-1.5 text-[13px] font-semibold text-navy transition hover:bg-[#f0f4fa]"
        >
          📁 {logoSrc ? 'Replace logo…' : 'Choose logo file…'}
        </button>
        {logoSrc && (
          <button
            type="button"
            onClick={() => set('schoolLogo', '')}
            className="rounded-md border border-[#f4c5c0] bg-white px-3 py-1.5 text-[13px] font-semibold text-danger transition hover:bg-danger-soft"
          >
            🗑️ Remove logo
          </button>
        )}
      </div>
      {logoSrc && (
        <div className="mt-2.5 inline-block rounded-lg border border-line bg-[#f7f9fc] p-3">
          <div className="mb-1.5 text-[11px] uppercase tracking-[.04em] text-muted">Preview</div>
          <img
            src={logoSrc}
            alt="School logo preview"
            className="block max-h-20 max-w-[240px] object-contain"
          />
        </div>
      )}
    </div>
  );
}

// =============================================================================
// 2. RESPONSE TEAM
// =============================================================================
export function TeamSection({ plan, updatePlan }: SectionProps) {
  const set = <K extends keyof PlanState['team']>(key: K, value: PlanState['team'][K]) => {
    updatePlan((p) => ({ ...p, team: { ...p.team, [key]: value } }));
  };

  const setMember = (idx: number, key: keyof TeamMember, value: string) => {
    updatePlan((p) => ({
      ...p,
      team: {
        ...p.team,
        members: p.team.members.map((m, i) => (i === idx ? { ...m, [key]: value } : m)),
      },
    }));
  };

  const addMember = () => {
    updatePlan((p) => ({
      ...p,
      team: { ...p.team, members: [...p.team.members, { name: '', role: '', phone: '', email: '', alt: '' }] },
    }));
  };

  const removeMember = (idx: number) => {
    updatePlan((p) => ({
      ...p,
      team: { ...p.team, members: p.team.members.filter((_, i) => i !== idx) },
    }));
  };

  const roleBlock = (
    title: string,
    keys: {
      name: keyof PlanState['team'];
      role: keyof PlanState['team'];
      phone: keyof PlanState['team'];
      email: keyof PlanState['team'];
      alt: keyof PlanState['team'];
    },
  ) => (
    <>
      <h3 className="mt-5 text-base font-bold text-navy">{title}</h3>
      <FieldGrid>
        <TextField label="Name" value={String(plan.team[keys.name] ?? '')} onChange={(v) => set(keys.name, v as never)} />
        <TextField label="Role" value={String(plan.team[keys.role] ?? '')} onChange={(v) => set(keys.role, v as never)} />
        <TextField label="Phone" type="tel" value={String(plan.team[keys.phone] ?? '')} onChange={(v) => set(keys.phone, v as never)} />
        <TextField label="Email" type="email" value={String(plan.team[keys.email] ?? '')} onChange={(v) => set(keys.email, v as never)} />
        <TextField label="Alternative contact" hint="Second contact method (NCSC recommendation)" value={String(plan.team[keys.alt] ?? '')} onChange={(v) => set(keys.alt, v as never)} />
      </FieldGrid>
    </>
  );

  return (
    <div className="card">
      <h2 className="m-0 mb-1 text-xl font-bold text-navy">Response team</h2>
      <p className="m-0 mb-3 text-sm text-muted">
        The internal Cyber Incident Response Team (CIRT). NCSC recommends at least two contact methods per role and named deputies for every key position.
      </p>

      {roleBlock('Incident response lead (typically SLT Digital Lead)', {
        name: 'leadName', role: 'leadRole', phone: 'leadPhone', email: 'leadEmail', alt: 'leadAlt',
      })}
      {roleBlock('Deputy lead', {
        name: 'deputyName', role: 'deputyRole', phone: 'deputyPhone', email: 'deputyEmail', alt: 'deputyAlt',
      })}
      {roleBlock('Technical lead (in-house IT or external provider)', {
        name: 'itLeadName', role: 'itLeadRole', phone: 'itLeadPhone', email: 'itLeadEmail', alt: 'itLeadAlt',
      })}
      {roleBlock('Data Protection Officer (DPO)', {
        name: 'dpoName', role: 'dpoOrg', phone: 'dpoPhone', email: 'dpoEmail', alt: 'dpoAlt',
      })}
      {roleBlock('Communications lead', {
        name: 'commsLeadName', role: 'commsLeadRole', phone: 'commsLeadPhone', email: 'commsLeadEmail', alt: 'commsLeadAlt',
      })}

      <h3 className="mt-5 text-base font-bold text-navy">Additional team members</h3>
      <p className="text-sm text-muted">
        Add anyone else who would be on the response call — e.g. business manager, headteacher, governor liaison, MIS administrator.
      </p>
      {plan.team.members.length === 0 ? (
        <p className="text-sm italic text-muted">No additional members added yet.</p>
      ) : (
        <div className="space-y-2.5">
          {plan.team.members.map((m, idx) => (
            <RepeaterRow key={idx} onRemove={() => removeMember(idx)}>
              <FieldGrid>
                <TextField label="Name" value={m.name} onChange={(v) => setMember(idx, 'name', v)} />
                <TextField label="Role" value={m.role} onChange={(v) => setMember(idx, 'role', v)} />
                <TextField label="Phone" type="tel" value={m.phone} onChange={(v) => setMember(idx, 'phone', v)} />
                <TextField label="Email" type="email" value={m.email} onChange={(v) => setMember(idx, 'email', v)} />
                <TextField label="Alternative contact" value={m.alt} onChange={(v) => setMember(idx, 'alt', v)} />
              </FieldGrid>
            </RepeaterRow>
          ))}
        </div>
      )}
      <button type="button" onClick={addMember} className="mt-2 rounded-md border border-line bg-white px-3 py-1.5 text-[13px] font-semibold text-navy transition hover:bg-[#f0f4fa]">
        + Add team member
      </button>
    </div>
  );
}

// =============================================================================
// 3. EXTERNAL CONTACTS
// =============================================================================
export function ExternalSection({ plan, updatePlan }: SectionProps) {
  const set = <K extends keyof PlanState['external']>(key: K, value: PlanState['external'][K]) => {
    updatePlan((p) => ({ ...p, external: { ...p.external, [key]: value } }));
  };
  const setItp = <K extends keyof PlanState['external']['itProvider']>(key: K, value: string) => {
    updatePlan((p) => ({
      ...p,
      external: { ...p.external, itProvider: { ...p.external.itProvider, [key]: value } },
    }));
  };
  const setSupplier = (idx: number, key: keyof OtherSupplier, value: string) => {
    updatePlan((p) => ({
      ...p,
      external: {
        ...p.external,
        otherSuppliers: p.external.otherSuppliers.map((s, i) => (i === idx ? { ...s, [key]: value } : s)),
      },
    }));
  };
  const addSupplier = () => {
    updatePlan((p) => ({
      ...p,
      external: { ...p.external, otherSuppliers: [...p.external.otherSuppliers, { name: '', service: '', phone: '', email: '' }] },
    }));
  };
  const removeSupplier = (idx: number) => {
    updatePlan((p) => ({
      ...p,
      external: { ...p.external, otherSuppliers: p.external.otherSuppliers.filter((_, i) => i !== idx) },
    }));
  };

  return (
    <div className="card">
      <h2 className="m-0 mb-1 text-xl font-bold text-navy">External contacts</h2>
      <p className="m-0 mb-3 text-sm text-muted">
        Authorities, regulators and service providers you may need to contact during an incident.
      </p>

      <h3 className="mt-3 text-base font-bold text-navy">IT support provider (primary)</h3>
      <FieldGrid>
        <TextField label="Provider name" value={plan.external.itProvider.name} onChange={(v) => setItp('name', v)} />
        <TextField label="Account / contact name" value={plan.external.itProvider.contact} onChange={(v) => setItp('contact', v)} />
        <TextField label="Phone" type="tel" value={plan.external.itProvider.phone} onChange={(v) => setItp('phone', v)} />
        <TextField label="Email" type="email" value={plan.external.itProvider.email} onChange={(v) => setItp('email', v)} />
        <TextField label="Out-of-hours / emergency" value={plan.external.itProvider.outOfHours} onChange={(v) => setItp('outOfHours', v)} />
      </FieldGrid>

      <Callout tone="info" className="mt-2">
        <p className="m-0 text-[13px]">
          <strong>Important:</strong> If personal data is or may be involved, you must report to the ICO within{' '}
          <strong>72 hours</strong> of becoming aware of the breach.
        </p>
      </Callout>

      <h3 className="mt-5 text-base font-bold text-navy">UK reporting routes</h3>
      <TextField label="NCSC incident reporting" value={plan.external.ncscReport} onChange={(v) => set('ncscReport', v)} />
      <TextField label="Report Fraud" value={plan.external.actionFraud} onChange={(v) => set('actionFraud', v)} />
      <TextField label="ICO (data breach)" value={plan.external.ico} onChange={(v) => set('ico', v)} />
      <TextField label="Welsh Government / consortium digital education contact" hint="If applicable — your regional consortium or Welsh Gov digital lead" value={plan.external.welshGovContact} onChange={(v) => set('welshGovContact', v)} />
      <TextField label="ROCU Cyber PROTECT (TARIAN / NWROCU)" hint="TARIAN: South Wales, Gwent, Dyfed-Powys · NWROCU: North Wales — free pre-incident advice, training and exercises" value={plan.external.rocuCyberProtect} onChange={(v) => set('rocuCyberProtect', v)} />

      <h3 className="mt-5 text-base font-bold text-navy">Insurance &amp; cover</h3>
      <TextField label="Local authority cyber cover / insurance arrangement" hint="LA cyber lead, scheme name and 24/7 incident line" value={plan.external.rpa} onChange={(v) => set('rpa', v)} />
      <TextField label="Cyber insurance (if commercial)" hint="Insurer name, policy number, 24/7 incident line" value={plan.external.cyberInsurer} onChange={(v) => set('cyberInsurer', v)} />

      <h3 className="mt-5 text-base font-bold text-navy">Other key contacts</h3>
      <FieldGrid>
        <TextField label="Local authority" hint="LA cyber lead or SPOC" value={plan.external.localAuthority} onChange={(v) => set('localAuthority', v)} />
        <TextField label="MIS supplier (SIMS, Bromcom, Arbor)" value={plan.external.miSupplier} onChange={(v) => set('miSupplier', v)} />
        <TextField label="Broadband / connectivity supplier" value={plan.external.broadbandSupplier} onChange={(v) => set('broadbandSupplier', v)} />
        <TextField label="Legal adviser" value={plan.external.legalAdviser} onChange={(v) => set('legalAdviser', v)} />
      </FieldGrid>

      <h3 className="mt-5 text-base font-bold text-navy">Other suppliers to notify</h3>
      <p className="text-sm text-muted">
        Any cloud provider, MIS host, finance provider or other third party whose systems or data may be affected.
      </p>
      {plan.external.otherSuppliers.length === 0 ? (
        <p className="text-sm italic text-muted">No additional suppliers added yet.</p>
      ) : (
        <div className="space-y-2.5">
          {plan.external.otherSuppliers.map((s, idx) => (
            <RepeaterRow key={idx} onRemove={() => removeSupplier(idx)}>
              <FieldGrid>
                <TextField label="Supplier" value={s.name} onChange={(v) => setSupplier(idx, 'name', v)} />
                <TextField label="Service / why notify" value={s.service} onChange={(v) => setSupplier(idx, 'service', v)} />
                <TextField label="Phone" type="tel" value={s.phone} onChange={(v) => setSupplier(idx, 'phone', v)} />
                <TextField label="Email" type="email" value={s.email} onChange={(v) => setSupplier(idx, 'email', v)} />
              </FieldGrid>
            </RepeaterRow>
          ))}
        </div>
      )}
      <button type="button" onClick={addSupplier} className="mt-2 rounded-md border border-line bg-white px-3 py-1.5 text-[13px] font-semibold text-navy transition hover:bg-[#f0f4fa]">
        + Add supplier
      </button>
    </div>
  );
}

// =============================================================================
// 4. SEVERITY & TRIAGE
// =============================================================================
export function SeveritySection({ plan, updatePlan }: SectionProps) {
  const set = <K extends keyof PlanState['severity']>(key: K, value: string) => {
    updatePlan((p) => ({ ...p, severity: { ...p.severity, [key]: value } }));
  };

  return (
    <div className="card">
      <h2 className="m-0 mb-1 text-xl font-bold text-navy">Severity &amp; triage</h2>
      <p className="m-0 mb-3 text-sm text-muted">
        Severity drives who is involved and how fast. NCSC recommends grading against three axes:{' '}
        <strong>availability</strong>, <strong>confidentiality</strong> and <strong>integrity</strong>.
      </p>

      <SeverityRow level={1} label="Critical" color="danger" value={plan.severity.s1Desc} onChange={(v) => set('s1Desc', v)} />
      <SeverityRow level={2} label="Major" color="warning" value={plan.severity.s2Desc} onChange={(v) => set('s2Desc', v)} />
      <SeverityRow level={3} label="Moderate" color="warning" value={plan.severity.s3Desc} onChange={(v) => set('s3Desc', v)} />
      <SeverityRow level={4} label="Minor" color="success" value={plan.severity.s4Desc} onChange={(v) => set('s4Desc', v)} />

      <Callout tone="info" className="mt-4">
        <h4 className="m-0 mb-1 text-sm font-bold text-navy-2">Triage rule of thumb</h4>
        <p className="m-0 text-[13px]">
          If any of the following are true, treat as Severity 1 or 2 until disproved — ransomware suspected, MIS or safeguarding system unavailable, evidence of personal data exposure, multiple staff accounts compromised, or loss of confidence in network integrity.
        </p>
      </Callout>
    </div>
  );
}

function SeverityRow({
  level, label, color, value, onChange,
}: { level: number; label: string; color: 'danger' | 'warning' | 'success'; value: string; onChange: (v: string) => void }) {
  const bg = color === 'danger' ? 'bg-danger-soft text-danger' : color === 'warning' ? 'bg-warning-soft text-warning' : 'bg-success-soft text-success';
  return (
    <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-[140px_1fr]">
      <div className={`flex items-start justify-center rounded-md px-2 py-2 font-bold ${bg}`}>
        {level} — {label}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[80px] w-full resize-y rounded-md border border-line bg-white px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-[3px] focus:ring-accent/15"
      />
    </div>
  );
}

// =============================================================================
// 5. ESCALATION & AUTHORITY
// =============================================================================
export function EscalationSection({ plan, updatePlan }: SectionProps) {
  const set = <K extends keyof PlanState['escalation']>(key: K, value: string) => {
    updatePlan((p) => ({ ...p, escalation: { ...p.escalation, [key]: value } }));
  };

  return (
    <div className="card">
      <h2 className="m-0 mb-1 text-xl font-bold text-navy">Escalation &amp; decision authority</h2>
      <p className="m-0 mb-3 text-sm text-muted">
        Critical decisions need named decision-makers — and named deputies for when those people are unavailable.
      </p>

      <DecisionPair
        title="Authority to take systems offline"
        primary={plan.escalation.decisionTakeOffline}
        deputy={plan.escalation.decisionTakeOfflineDeputy}
        onPrimaryChange={(v) => set('decisionTakeOffline', v)}
        onDeputyChange={(v) => set('decisionTakeOfflineDeputy', v)}
      />
      <DecisionPair
        title="Authority to engage external incident responders"
        primaryHint="Contact your local authority cyber lead / insurer first — they may have appointed responders"
        primary={plan.escalation.decisionEngageExternal}
        deputy={plan.escalation.decisionEngageExternalDeputy}
        onPrimaryChange={(v) => set('decisionEngageExternal', v)}
        onDeputyChange={(v) => set('decisionEngageExternalDeputy', v)}
      />
      <DecisionPair
        title="Authority to communicate with press"
        primaryHint="Typically Headteacher / CEO"
        primary={plan.escalation.decisionPress}
        deputy={plan.escalation.decisionPressDeputy}
        onPrimaryChange={(v) => set('decisionPress', v)}
        onDeputyChange={(v) => set('decisionPressDeputy', v)}
      />
      <DecisionPair
        title="Authority to notify the ICO"
        primaryHint="Typically DPO with SLT sign-off"
        primary={plan.escalation.decisionICO}
        deputy={plan.escalation.decisionICODeputy}
        onPrimaryChange={(v) => set('decisionICO', v)}
        onDeputyChange={(v) => set('decisionICODeputy', v)}
      />

      <h3 className="mt-5 text-base font-bold text-navy">Ransomware / extortion decision</h3>
      <TextAreaField label="Policy statement" value={plan.escalation.decisionRansomware} onChange={(v) => set('decisionRansomware', v)} />

      <h3 className="mt-5 text-base font-bold text-navy">Conference call / bridge line</h3>
      <TextField
        label="Always-available conference number"
        hint="NCSC requirement: at least one always-available number for urgent incident calls"
        value={plan.escalation.conferenceLine}
        onChange={(v) => set('conferenceLine', v)}
      />
    </div>
  );
}

function DecisionPair({
  title, primaryHint, primary, deputy, onPrimaryChange, onDeputyChange,
}: { title: string; primaryHint?: string; primary: string; deputy: string; onPrimaryChange: (v: string) => void; onDeputyChange: (v: string) => void }) {
  return (
    <>
      <h3 className="mt-5 text-base font-bold text-navy">{title}</h3>
      <FieldGrid>
        <TextField label="Primary decision-maker" hint={primaryHint ?? 'Name and role'} value={primary} onChange={onPrimaryChange} />
        <TextField label="Deputy" value={deputy} onChange={onDeputyChange} />
      </FieldGrid>
    </>
  );
}

// =============================================================================
// 6. PLAYBOOKS
// =============================================================================
export function PlaybooksSection({ plan, updatePlan }: SectionProps) {
  const togglePlaybook = (key: PlaybookKey) => {
    updatePlan((p) => ({
      ...p,
      playbooks: { ...p.playbooks, [key]: { ...p.playbooks[key], enabled: !p.playbooks[key].enabled } },
    }));
  };
  const setNotes = (key: PlaybookKey, notes: string) => {
    updatePlan((p) => ({
      ...p,
      playbooks: { ...p.playbooks, [key]: { ...p.playbooks[key], notes } },
    }));
  };
  const insertTemplate = (key: PlaybookKey) => {
    const pb = PLAYBOOK_BY_KEY[key];
    if (!pb?.template) return;
    const current = plan.playbooks[key].notes;
    if (current.trim() && !confirm("This will replace what you've already written. Continue?")) {
      return;
    }
    setNotes(key, pb.template);
  };

  return (
    <div className="card">
      <h2 className="m-0 mb-1 text-xl font-bold text-navy">Playbooks</h2>
      <p className="m-0 mb-3 text-sm text-muted">
        NCSC recommends starting with playbooks for the top 3-5 most likely incident types. The
        plan output already includes the generic step-by-step actions for each type — the textarea
        below is for your <strong>school-specific</strong> details (named contacts, locations,
        account numbers, decisions). Use the fill-in-the-blanks template to capture the things
        that are unique to your setup.
      </p>

      {PLAYBOOKS.map((pb) => {
        const flag: PlaybookFlag = plan.playbooks[pb.key];
        return (
          <div
            key={pb.key}
            className="mt-5 border-t border-line pt-4 first:mt-0 first:border-t-0 first:pt-0"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h3 className="m-0 flex-1 text-base font-bold text-navy">{pb.title}</h3>
              <label className="flex items-center gap-1.5 text-[13px] text-navy-2">
                <input
                  type="checkbox"
                  checked={flag.enabled}
                  onChange={() => togglePlaybook(pb.key)}
                />
                Include in plan
              </label>
            </div>
            <p className="m-0 mt-1 text-[13px] text-muted">{pb.desc}</p>

            {flag.enabled && (
              <>
                {pb.whyMatters && (
                  <div className="mt-2.5 rounded-md border-l-4 border-accent bg-[#eaf2fd] px-3.5 py-2.5">
                    <div className="mb-1 text-[11px] font-bold uppercase tracking-[.04em] text-navy">
                      Why this matters in Welsh schools
                    </div>
                    <p
                      className="m-0 text-[13px] leading-[1.55] text-ink [&_a]:text-accent [&_a]:underline"
                      // Compile-time trusted HTML — see src/data/playbooks.ts header.
                      dangerouslySetInnerHTML={{ __html: pb.whyMatters }}
                    />
                  </div>
                )}

                {pb.examples.length > 0 && (
                  <details className="mt-2.5 rounded-md border border-[#f4dba0] bg-[#fff8ec] px-3.5 py-2.5">
                    <summary className="cursor-pointer text-[13px] font-bold text-navy-2 hover:text-warning">
                      💡 Examples to consider when filling in your local notes
                    </summary>
                    <ul className="mb-1 mt-2 list-disc pl-5 text-[13px] text-ink">
                      {pb.examples.map((ex, i) => (
                        <li
                          key={i}
                          className="mb-1"
                          // Examples may contain inline <strong>/<em> from v1.x — compile-time trusted.
                          dangerouslySetInnerHTML={{ __html: ex }}
                        />
                      ))}
                    </ul>
                    {pb.template && (
                      <div className="mt-2 border-t border-dashed border-[#f4dba0] pt-2">
                        <div className="mb-1 text-[12px] font-bold text-navy-2">
                          FILL-IN-THE-BLANKS TEMPLATE
                        </div>
                        <p className="m-0 mb-1.5 text-[12px] leading-[1.5] text-ink">
                          A skeleton with bracketed placeholders to prompt school-specific
                          information. Replace each{' '}
                          <code className="rounded bg-white px-1">[bracketed item]</code> with your
                          actual details — don't leave them as placeholders in the final plan.
                        </p>
                        <button
                          type="button"
                          onClick={() => insertTemplate(pb.key)}
                          className="mb-1.5 rounded-md border border-line bg-white px-3 py-1.5 text-[12px] font-semibold text-navy transition hover:bg-[#f0f4fa]"
                        >
                          📋 Insert template into the textarea below
                        </button>
                        <pre className="m-0 max-h-[240px] overflow-auto whitespace-pre-wrap rounded border border-[#f4dba0] bg-white p-2.5 font-mono text-[11px] leading-[1.5] text-ink">
                          {pb.template}
                        </pre>
                      </div>
                    )}
                  </details>
                )}

                <div className="mt-2.5">
                  <TextAreaField
                    label="Local steps and notes"
                    hint="School-specific actions, contacts and dependencies. Generic step-by-step actions are added automatically in the output."
                    value={flag.notes}
                    onChange={(v) => setNotes(pb.key, v)}
                  />
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

// =============================================================================
// 7. COMMUNICATIONS
// =============================================================================
export function CommsSection({ plan, updatePlan }: SectionProps) {
  const set = <K extends keyof PlanState['comms']>(key: K, value: string) => {
    updatePlan((p) => ({ ...p, comms: { ...p.comms, [key]: value } }));
  };

  const templateField = (field: CommsField, label: string, hint: string) => {
    const template = COMMS_TEMPLATE_BY_FIELD[field];
    const current = plan.comms[field];

    const insertDraft = () => {
      if (!template?.draft) return;
      if (current.trim() && !confirm("This will replace what you've already written. Continue?")) {
        return;
      }
      set(field, template.draft);
    };

    return (
      <label className="mb-3.5 block">
        <span className="mb-1 block text-sm font-semibold text-navy-2">{label}</span>
        <span className="mb-1.5 block min-h-[16px] text-xs text-muted">{hint}</span>
        {template && template.examples.length > 0 && (
          <details className="mb-2 rounded-md border border-[#f4dba0] bg-[#fff8ec] px-3.5 py-2.5">
            <summary className="cursor-pointer text-[13px] font-bold text-navy-2 hover:text-warning">
              💡 {template.examplesTitle}
            </summary>
            <ul className="mb-1 mt-2 list-disc pl-5 text-[13px] text-ink">
              {template.examples.map((ex, i) => (
                <li key={i} className="mb-1">
                  {ex}
                </li>
              ))}
            </ul>
            {template.draft && (
              <div className="mt-2 border-t border-dashed border-[#f4dba0] pt-2">
                <div className="mb-1 text-[12px] font-bold text-navy-2">SAMPLE DRAFT</div>
                <p className="m-0 mb-1.5 text-[12px] leading-[1.5] text-ink">
                  A skeleton with bracketed placeholders. Replace each{' '}
                  <code className="rounded bg-white px-1">[bracketed item]</code> with your details
                  before using.
                </p>
                <button
                  type="button"
                  onClick={insertDraft}
                  className="mb-1.5 rounded-md border border-line bg-white px-3 py-1.5 text-[12px] font-semibold text-navy transition hover:bg-[#f0f4fa]"
                >
                  📋 Use this draft as a starting point
                </button>
                <pre className="m-0 max-h-[240px] overflow-auto whitespace-pre-wrap rounded border border-[#f4dba0] bg-white p-2.5 text-[11px] leading-[1.5] text-ink">
                  {template.draft}
                </pre>
              </div>
            )}
          </details>
        )}
        <textarea
          value={current}
          onChange={(e) => set(field, e.target.value)}
          className="min-h-[80px] w-full resize-y rounded-md border border-line bg-white px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-[3px] focus:ring-accent/15"
        />
      </label>
    );
  };

  return (
    <div className="card">
      <h2 className="m-0 mb-1 text-xl font-bold text-navy">Communications</h2>
      <p className="m-0 mb-3 text-sm text-muted">
        Pre-prepared communication templates save hours during a real incident. Drafting a parent letter while the incident is ongoing is a bad time.
      </p>

      <h3 className="mt-3 text-base font-bold text-navy">Communication channels</h3>
      <TextField
        label="Primary channel (likely to be unavailable in a major incident)"
        hint="e.g. school email, internal Teams, MIS messaging"
        value={plan.comms.primaryChannelDown}
        onChange={(v) => set('primaryChannelDown', v)}
      />
      <TextField
        label="Alternate / out-of-band channel"
        hint="e.g. WhatsApp group, personal email, SMS gateway, phone tree"
        value={plan.comms.alternateChannel}
        onChange={(v) => set('alternateChannel', v)}
      />

      {templateField(
        'websiteHoldingPage',
        'Holding page for school website',
        'Short, factual statement that can be put up while the incident is being investigated. Cleared by SLT in advance.',
      )}
      {templateField(
        'parentTemplate',
        'Parent / carer letter template',
        'Pre-approved by SLT and DPO. Should explain what happened, what the school is doing, and how updates will be provided.',
      )}
      {templateField('staffTemplate', 'Staff briefing template', 'Internal-only message. Should include what staff can/cannot say externally.')}
      {templateField(
        'icoTemplate',
        'ICO notification template',
        'For use within 72 hours of becoming aware of a personal data breach.',
      )}
      {templateField('governorTemplate', 'Governor / trustee briefing template', 'Confidential. Sufficient detail for governance oversight without compromising the response.')}

      <Callout tone="warn" className="mt-4">
        <h4 className="m-0 mb-1 text-sm font-bold text-navy-2">What to avoid in any external communication</h4>
        <ul className="m-0 list-disc pl-5 text-[13px]">
          <li>Speculation about who is responsible or what the cause was</li>
          <li>Specific technical details that could aid the attacker or other attackers</li>
          <li>Definitive statements before facts are confirmed</li>
          <li>Anything not cleared by the comms lead, DPO and SLT</li>
        </ul>
      </Callout>
    </div>
  );
}

// =============================================================================
// 8. CRITICAL SYSTEMS & IMPACT (Assets)
// =============================================================================
export function AssetsSection({ plan, updatePlan }: SectionProps) {
  const setRow = (idx: number, key: keyof AssetRow, value: string) => {
    updatePlan((p) => ({
      ...p,
      assets: { ...p.assets, systems: p.assets.systems.map((r, i) => (i === idx ? { ...r, [key]: value } : r)) },
    }));
  };
  const addRow = () => {
    updatePlan((p) => ({
      ...p,
      assets: {
        ...p.assets,
        systems: [
          ...p.assets.systems,
          { name: '', supplier: '', dataHeld: '', hosting: '', rto: '', priority: '', incidentContact: '', lastExport: '', notes: '' },
        ],
      },
    }));
  };
  const removeRow = (idx: number) => {
    updatePlan((p) => ({
      ...p,
      assets: { ...p.assets, systems: p.assets.systems.filter((_, i) => i !== idx) },
    }));
  };
  const setBia = (value: string) => {
    updatePlan((p) => ({ ...p, assets: { ...p.assets, biaNotes: value } }));
  };

  const HOSTING = ['', 'SaaS / cloud (supplier-hosted)', 'On-prem / self-hosted', 'Hybrid'];
  const RTO = ['', '<1 hour', '<4 hours', '<1 day', '<3 days', '<1 week', '>1 week'];
  const PRIORITY = ['', '1 — Critical', '2 — High', '3 — Medium', '4 — Low'];

  return (
    <div className="card">
      <h2 className="m-0 mb-1 text-xl font-bold text-navy">Critical systems &amp; impact</h2>
      <p className="m-0 mb-3 text-sm text-muted">
        Asset register + quick Business Impact Analysis. List the systems your school depends on, what they hold, and how quickly you'd need them back.
      </p>

      <Callout tone="info" className="mb-3">
        <p className="m-0 text-[13px]">
          <strong>SaaS systems (Arbor / SIMS / Bromcom / ParentPay / CPOMS / M365 / Google Workspace):</strong>
          {' '}even when your supplier hosts the data, <strong>you remain the data controller under UK GDPR</strong>. The 72-hour ICO notification clock falls on <em>you</em>, not them.
        </p>
      </Callout>

      {plan.assets.systems.length === 0 ? (
        <p className="text-sm italic text-muted">No systems added yet — start with your MIS, email, finance and safeguarding systems.</p>
      ) : (
        <div className="space-y-2.5">
          {plan.assets.systems.map((row, idx) => (
            <RepeaterRow key={idx} onRemove={() => removeRow(idx)}>
              <FieldGrid>
                <TextField label="System name" value={row.name} onChange={(v) => setRow(idx, 'name', v)} />
                <TextField
                  label="Supplier / product"
                  placeholder="e.g. Arbor, SIMS, Bromcom, M365, Google Workspace, ParentPay, CPOMS"
                  value={row.supplier}
                  onChange={(v) => setRow(idx, 'supplier', v)}
                />
              </FieldGrid>
              <TextAreaField label="What data it holds" value={row.dataHeld} onChange={(v) => setRow(idx, 'dataHeld', v)} />
              <FieldGrid>
                <SelectField label="Hosting" value={row.hosting} onChange={(v) => setRow(idx, 'hosting', v)} options={HOSTING} />
                <SelectField label="Recovery time objective (RTO)" value={row.rto} onChange={(v) => setRow(idx, 'rto', v)} options={RTO} />
              </FieldGrid>
              <FieldGrid>
                <SelectField label="Recovery priority" value={row.priority} onChange={(v) => setRow(idx, 'priority', v)} options={PRIORITY} />
                <TextField
                  label="Supplier incident contact"
                  placeholder="24/7 phone or breach-notification email"
                  value={row.incidentContact}
                  onChange={(v) => setRow(idx, 'incidentContact', v)}
                />
              </FieldGrid>
              <TextField
                label="Last data export held by school"
                placeholder="Critical for SaaS — without this you can't act independently if the supplier is breached"
                value={row.lastExport}
                onChange={(v) => setRow(idx, 'lastExport', v)}
              />
              <TextField label="Notes" value={row.notes} onChange={(v) => setRow(idx, 'notes', v)} />
            </RepeaterRow>
          ))}
        </div>
      )}
      <button type="button" onClick={addRow} className="mt-2 rounded-md border border-line bg-white px-3 py-1.5 text-[13px] font-semibold text-navy transition hover:bg-[#f0f4fa]">
        + Add system
      </button>

      <h3 className="mt-5 text-base font-bold text-navy">Business Impact Analysis — narrative</h3>
      <TextAreaField
        label="BIA narrative"
        hint="A short narrative for governors and insurers describing how extended loss of these systems would affect teaching, finance, safeguarding and reputation."
        value={plan.assets.biaNotes}
        onChange={setBia}
      />
    </div>
  );
}

// =============================================================================
// 9. RECOVERY & BACKUPS
// =============================================================================
export function RecoverySection({ plan, updatePlan }: SectionProps) {
  const set = <K extends keyof PlanState['recovery']>(key: K, value: string) => {
    updatePlan((p) => ({ ...p, recovery: { ...p.recovery, [key]: value } }));
  };

  return (
    <div className="card">
      <h2 className="m-0 mb-1 text-xl font-bold text-navy">Recovery &amp; backups</h2>
      <p className="m-0 mb-3 text-sm text-muted">
        NCSC recommends the 3-2-1 rule: at least 3 copies of important data, on at least 2 different types of media, with at least 1 stored off-site or immutable.
      </p>

      <FieldGrid>
        <TextField
          label="Recovery Time Objective (RTO)"
          hint="How long you can tolerate being without core systems. e.g. '24 hours for MIS, 48 hours for email'"
          value={plan.recovery.rto}
          onChange={(v) => set('rto', v)}
        />
        <TextField
          label="Recovery Point Objective (RPO)"
          hint="Maximum acceptable data loss. e.g. '24 hours'"
          value={plan.recovery.rpo}
          onChange={(v) => set('rpo', v)}
        />
      </FieldGrid>

      <TextAreaField
        label="Backup locations and types"
        hint="Where backups are held, who hosts them, and which are immutable / air-gapped."
        value={plan.recovery.backupLocations}
        onChange={(v) => set('backupLocations', v)}
      />
      <TextField label="Backup owner" hint="Named person responsible for backups and restoration testing" value={plan.recovery.backupOwner} onChange={(v) => set('backupOwner', v)} />
      <SelectField
        label="Backup test frequency"
        hint="NCSC recommends termly minimum"
        value={plan.recovery.backupTestFrequency}
        onChange={(v) => set('backupTestFrequency', v)}
        options={['Weekly', 'Monthly', 'Termly', 'Annually', 'Not currently tested']}
      />

      <h3 className="mt-3 text-base font-bold text-navy">Priority restoration order</h3>
      <TextAreaField
        label="Order of system restoration"
        hint="Typically safeguarding records first, then MIS, finance, and so on."
        value={plan.recovery.priorityRestoreOrder}
        onChange={(v) => set('priorityRestoreOrder', v)}
      />
    </div>
  );
}

// =============================================================================
// 10. POST-INCIDENT REVIEW
// =============================================================================
export function ReviewSection({ plan, updatePlan }: SectionProps) {
  const set = <K extends keyof PlanState['review']>(key: K, value: string) => {
    updatePlan((p) => ({ ...p, review: { ...p.review, [key]: value } }));
  };

  return (
    <div className="card">
      <h2 className="m-0 mb-1 text-xl font-bold text-navy">Post-incident review</h2>
      <p className="m-0 mb-3 text-sm text-muted">
        NCSC and most LA cyber cover arrangements require lessons learned to be captured and fed back into the plan. The point is not the document — it is the change.
      </p>

      <FieldGrid>
        <TextField label="Review lead" hint="Typically the SLT digital lead" value={plan.review.reviewLead} onChange={(v) => set('reviewLead', v)} />
        <TextField label="Review deadline" value={plan.review.reviewDeadline} onChange={(v) => set('reviewDeadline', v)} />
      </FieldGrid>
      <TextField label="Where the review form is stored" hint="Both online and offline locations" value={plan.review.formLocation} onChange={(v) => set('formLocation', v)} />
      <TextAreaField
        label="How learnings are fed back into the plan"
        hint="Who updates the plan? When does it get re-approved? How is the change communicated?"
        value={plan.review.learningProcess}
        onChange={(v) => set('learningProcess', v)}
      />

      <Callout tone="info" className="mt-3">
        <h4 className="m-0 mb-1 text-sm font-bold text-navy-2">Standard review questions</h4>
        <p className="m-0 mb-1.5 text-[13px]">A post-incident review should answer at minimum:</p>
        <ul className="m-0 list-disc pl-5 text-[13px]">
          <li>What happened, when, and how was it detected?</li>
          <li>What was the impact (operational, data, reputational, financial)?</li>
          <li>What worked well in the response?</li>
          <li>What didn't work, and why?</li>
          <li>What changes to the plan, controls or training are needed?</li>
          <li>Who is accountable for each change, and by when?</li>
        </ul>
      </Callout>
    </div>
  );
}

// =============================================================================
// 11. PLAN MAINTENANCE
// =============================================================================
export function MaintenanceSection({ plan, updatePlan }: SectionProps) {
  const set = <K extends keyof PlanState['maintenance']>(key: K, value: string) => {
    updatePlan((p) => ({ ...p, maintenance: { ...p.maintenance, [key]: value } }));
  };

  return (
    <div className="card">
      <h2 className="m-0 mb-1 text-xl font-bold text-navy">Plan maintenance</h2>
      <p className="m-0 mb-3 text-sm text-muted">
        A plan that is not maintained is a plan you cannot rely on. NCSC and most LA cyber cover arrangements expect this to be reviewed annually as a minimum, plus after any incident or significant change.
      </p>

      <FieldGrid>
        <TextField label="Plan owner" hint="Named person responsible" value={plan.maintenance.owner} onChange={(v) => set('owner', v)} />
        <TextField label="Review frequency" value={plan.maintenance.reviewFrequency} onChange={(v) => set('reviewFrequency', v)} />
        <TextField label="Last reviewed" type="date" value={plan.maintenance.lastReviewed} onChange={(v) => set('lastReviewed', v)} />
        <TextField label="Next review due" type="date" value={plan.maintenance.nextReview} onChange={(v) => set('nextReview', v)} />
      </FieldGrid>
      <TextAreaField label="Distribution list" hint="Who has a copy and where are they stored?" value={plan.maintenance.distribution} onChange={(v) => set('distribution', v)} />
      <TextField
        label="Offline copy location"
        hint="NCSC and most LA cyber cover arrangements expect a hard copy stored off-network. Where is yours?"
        value={plan.maintenance.offlineCopyLocation}
        onChange={(v) => set('offlineCopyLocation', v)}
      />

      <Callout tone="warn" className="mt-3">
        <h4 className="m-0 mb-1 text-sm font-bold text-navy-2">Print and store offline</h4>
        <p className="m-0 text-[13px]">
          When you have completed and approved your plan, print a hard copy and store it somewhere accessible <em>without</em> needing the network. Multiple online incidents in Welsh schools have been worsened by the response plan being inside the encrypted file share.
        </p>
      </Callout>
    </div>
  );
}

// =============================================================================
// Shared helpers (RepeaterRow + Callout)
// =============================================================================
function RepeaterRow({ children, onRemove }: { children: ReactNode; onRemove: () => void }) {
  return (
    <div className="relative rounded-md border border-line bg-[#fafbfc] p-3">
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 rounded px-1.5 text-lg leading-none text-danger hover:bg-danger-soft"
        aria-label="Remove this row"
        title="Remove this row"
      >
        ×
      </button>
      {children}
    </div>
  );
}

function Callout({
  children,
  tone = 'info',
  className = '',
}: { children: ReactNode; tone?: 'info' | 'warn'; className?: string }) {
  const palette = tone === 'warn' ? 'border-warning bg-warning-soft' : 'border-accent bg-[#eaf2fd]';
  return (
    <div className={`rounded-md border-l-4 px-4 py-3 ${palette} ${className}`}>{children}</div>
  );
}
