import { describe, it, expect } from 'vitest';
import { getFirst30Data, findSltSponsor } from '~/lib/selectors/first30-card';
import { initialIncident } from '~/data/plan-schema';

describe('getFirst30Data', () => {
  it('produces three phases mirroring the team and external slices', () => {
    const incident = initialIncident();
    incident.plan.team.leadName = 'Alice';
    incident.plan.team.leadPhone = '01234';
    incident.plan.team.itLeadName = 'Bob';
    incident.plan.team.commsLeadName = 'Carol';

    const d = getFirst30Data(incident.plan);
    expect(d.phase1.sltLead.name).toBe('Alice');
    expect(d.phase1.sltLead.phone).toBe('01234');
    expect(d.phase2.itLead.name).toBe('Bob');
    expect(d.phase2.commsLead.name).toBe('Carol');
  });

  it('insurer falls back from rpa → cyberInsurer', () => {
    const incident = initialIncident();
    incident.plan.external.cyberInsurer = 'Acme Cyber Ltd';
    expect(getFirst30Data(incident.plan).phase3.insurer).toBe('Acme Cyber Ltd');

    incident.plan.external.rpa = 'RPA';
    expect(getFirst30Data(incident.plan).phase3.insurer).toBe('RPA');
  });

  it('IT support row is null when itProvider is empty', () => {
    const incident = initialIncident();
    expect(getFirst30Data(incident.plan).phase3.itSupport).toBeNull();
  });

  it('IT support row joins name/contact/phone with " · "', () => {
    const incident = initialIncident();
    incident.plan.external.itProvider.name = 'School IT Co';
    incident.plan.external.itProvider.phone = '01234';
    const row = getFirst30Data(incident.plan).phase3.itSupport;
    expect(row).toContain('School IT Co');
    expect(row).toContain('01234');
    expect(row).toContain(' · ');
  });

  it('External DPO row only appears when dpoOrg is set', () => {
    const incident = initialIncident();
    incident.plan.team.dpoName = 'Eve';
    incident.plan.team.dpoPhone = '01234';
    expect(getFirst30Data(incident.plan).phase3.externalDpo).toBeNull();

    incident.plan.team.dpoOrg = 'External DPO Ltd';
    expect(getFirst30Data(incident.plan).phase3.externalDpo).toContain('External DPO Ltd');
  });
});

describe('findSltSponsor', () => {
  it('matches a team member with a senior-role keyword', () => {
    const incident = initialIncident();
    incident.plan.team.members = [
      { name: 'Mr Random', role: 'Caretaker', phone: '', email: '', alt: '' },
      { name: 'Mrs Head', role: 'Headteacher', phone: '01234', email: '', alt: '' },
    ];
    expect(findSltSponsor(incident.plan).name).toBe('Mrs Head');
  });

  it('matches Principal / CEO / Chair / Exec / Sponsor case-insensitively', () => {
    const incident = initialIncident();
    const cases = ['principal', 'CEO of Trust', 'Chair of Governors', 'Exec Head', 'SLT Sponsor'];
    for (const role of cases) {
      incident.plan.team.members = [{ name: 'X', role, phone: '', email: '', alt: '' }];
      expect(findSltSponsor(incident.plan).name).toBe('X');
    }
  });

  it('falls back to meta.approvedBy when no senior role found', () => {
    const incident = initialIncident();
    incident.plan.team.members = [
      { name: 'Mr Random', role: 'Caretaker', phone: '', email: '', alt: '' },
    ];
    incident.plan.meta.approvedBy = 'Mrs Approver';
    expect(findSltSponsor(incident.plan).name).toBe('Mrs Approver');
  });

  it('returns empty name when no members and no approver', () => {
    const incident = initialIncident();
    expect(findSltSponsor(incident.plan).name).toBe('');
  });
});
