import { describe, it, expect } from 'vitest';
import { getCeGovernorQuestion } from '~/lib/engine/ce-governor-question';
import type { PlanState } from '~/data/plan-schema';

type Meta = PlanState['meta'];

const baseMeta = (over: Partial<Meta>): Meta => ({
  schoolName: '',
  trustName: '',
  urn: '',
  planVersion: '',
  planDate: '',
  nextReview: '',
  approvedBy: '',
  approverRole: '',
  ceStatus: '',
  ceCertDate: '',
  schoolLogo: '',
  ...over,
});

const TODAY = new Date('2026-05-15T12:00:00Z');

describe('getCeGovernorQuestion', () => {
  it('returns a planning question when status is empty', () => {
    const q = getCeGovernorQuestion(baseMeta({}), TODAY);
    expect(q).toMatch(/clear plan and named owner/i);
  });

  it('treats "Not started" and "Working towards" as not-yet-certified', () => {
    expect(getCeGovernorQuestion(baseMeta({ ceStatus: 'Not started' }), TODAY)).toMatch(
      /clear plan/i,
    );
    expect(getCeGovernorQuestion(baseMeta({ ceStatus: 'Working towards' }), TODAY)).toMatch(
      /clear plan/i,
    );
  });

  it('asks about tracking when status set but no cert date', () => {
    const q = getCeGovernorQuestion(
      baseMeta({ ceStatus: 'Cyber Essentials Plus', ceCertDate: '' }),
      TODAY,
    );
    expect(q).toMatch(/renewal cycle is being tracked/i);
  });

  it('returns null when cert date is unparseable', () => {
    const q = getCeGovernorQuestion(
      baseMeta({ ceStatus: 'Cyber Essentials', ceCertDate: 'not a date' }),
      TODAY,
    );
    expect(q).toBeNull();
  });

  it('flags a lapsed certification with day count', () => {
    const q = getCeGovernorQuestion(
      baseMeta({ ceStatus: 'Cyber Essentials', ceCertDate: '2025-01-01' }),
      TODAY,
    );
    expect(q).toMatch(/lapsed/i);
  });

  it('flags renewal <60 days away', () => {
    const q = getCeGovernorQuestion(
      baseMeta({ ceStatus: 'Cyber Essentials Plus', ceCertDate: '2025-06-15' }),
      TODAY,
    );
    expect(q).toMatch(/renewal is approaching/i);
  });

  it('flags CE-only in the 3-month CE Plus window', () => {
    const q = getCeGovernorQuestion(
      baseMeta({ ceStatus: 'Cyber Essentials', ceCertDate: '2026-04-15' }),
      TODAY,
    );
    expect(q).toMatch(/Cyber Essentials Plus/i);
    expect(q).toMatch(/3-month window/);
  });

  it('returns null when in good standing (CE Plus, mid-cycle)', () => {
    const q = getCeGovernorQuestion(
      baseMeta({ ceStatus: 'Cyber Essentials Plus', ceCertDate: '2026-01-01' }),
      TODAY,
    );
    expect(q).toBeNull();
  });

  it('CE-only with a FUTURE cert date does NOT flag the 3-month window (regression)', () => {
    // Pre-v2.5.3 bug: a future-dated cert produced "643 days remaining"
    // inside the CE Plus window message. The window can't open before
    // certification — flag the date as bad instead.
    const q = getCeGovernorQuestion(
      baseMeta({ ceStatus: 'Cyber Essentials', ceCertDate: '2027-11-30' }),
      TODAY,
    );
    expect(q).not.toMatch(/3-month window/);
    expect(q).toMatch(/date is recorded in the future/i);
  });

  it('CE-only with a long-past cert date and renewal still away returns null (window already closed)', () => {
    // Cert 200 days ago, renewal 165 days away → outside 3-month window and
    // outside the <60-day renewal alert; should be silent.
    const q = getCeGovernorQuestion(
      baseMeta({ ceStatus: 'Cyber Essentials', ceCertDate: '2025-10-29' }),
      TODAY,
    );
    expect(q).toBeNull();
  });
});
