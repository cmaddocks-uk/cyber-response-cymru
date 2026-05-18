import { describe, it, expect } from 'vitest';
import { getCeStatusSummary } from '~/lib/engine/cyber-essentials';
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

describe('getCeStatusSummary', () => {
  it('hides everything when no status', () => {
    const s = getCeStatusSummary(baseMeta({}), TODAY);
    expect(s.visible).toBe(false);
  });

  it('shows label only when status set but no cert date', () => {
    const s = getCeStatusSummary(
      baseMeta({ ceStatus: 'Cyber Essentials', ceCertDate: '' }),
      TODAY,
    );
    expect(s.visible).toBe(true);
    expect(s.statusLabel).toBe('Cyber Essentials');
    expect(s.cePlusDeadline).toBeUndefined();
    expect(s.renewalDeadline).toBeUndefined();
  });

  it('handles an unparseable cert date as label-only', () => {
    const s = getCeStatusSummary(
      baseMeta({ ceStatus: 'Cyber Essentials', ceCertDate: 'not a date' }),
      TODAY,
    );
    expect(s.cePlusDeadline).toBeUndefined();
    expect(s.renewalDeadline).toBeUndefined();
  });

  it('CE certified one month ago ⇒ CE Plus countdown surfaces, severity green (>=28 days left)', () => {
    const s = getCeStatusSummary(
      baseMeta({ ceStatus: 'Cyber Essentials', ceCertDate: '2026-04-15' }),
      TODAY,
    );
    expect(s.cePlusDeadline?.severity).toBe('green');
    expect(s.cePlusDeadline?.daysLeft).toBeGreaterThanOrEqual(28);
  });

  it('CE certified ~2.5 months ago ⇒ CE Plus deadline amber (<28 days)', () => {
    const s = getCeStatusSummary(
      baseMeta({ ceStatus: 'Cyber Essentials', ceCertDate: '2026-03-01' }),
      TODAY,
    );
    expect(s.cePlusDeadline?.severity).toBe('amber');
    expect(s.cePlusDeadline?.daysLeft).toBeLessThan(28);
  });

  it('CE Plus does not surface a CE Plus deadline (irrelevant)', () => {
    const s = getCeStatusSummary(
      baseMeta({ ceStatus: 'Cyber Essentials Plus', ceCertDate: '2026-04-15' }),
      TODAY,
    );
    expect(s.cePlusDeadline).toBeUndefined();
  });

  it('CE Plus window expired (>3 months) ⇒ no deadline surfaced', () => {
    const s = getCeStatusSummary(
      baseMeta({ ceStatus: 'Cyber Essentials', ceCertDate: '2025-12-01' }),
      TODAY,
    );
    expect(s.cePlusDeadline).toBeUndefined();
  });

  it('CE Plus window NOT yet open (future cert date) ⇒ no deadline surfaced (regression)', () => {
    // Pre-v2.5.3 bug: a future cert produced a cePlusDeadline with hundreds
    // of days remaining. The window only exists after certification.
    const s = getCeStatusSummary(
      baseMeta({ ceStatus: 'Cyber Essentials', ceCertDate: '2027-11-30' }),
      TODAY,
    );
    expect(s.cePlusDeadline).toBeUndefined();
  });

  it('renewal more than 60 days away ⇒ no renewal countdown', () => {
    const s = getCeStatusSummary(
      baseMeta({ ceStatus: 'Cyber Essentials Plus', ceCertDate: '2026-01-01' }),
      TODAY,
    );
    expect(s.renewalDeadline).toBeUndefined();
  });

  it('renewal <60 days away, >=28 ⇒ amber', () => {
    const s = getCeStatusSummary(
      baseMeta({ ceStatus: 'Cyber Essentials Plus', ceCertDate: '2025-06-15' }),
      TODAY,
    );
    expect(s.renewalDeadline?.lapsed).toBe(false);
    if (s.renewalDeadline?.lapsed === false) {
      expect(s.renewalDeadline.severity).toBe('amber');
      expect(s.renewalDeadline.daysLeft).toBeGreaterThanOrEqual(28);
      expect(s.renewalDeadline.daysLeft).toBeLessThan(60);
    }
  });

  it('renewal <28 days away ⇒ red', () => {
    const s = getCeStatusSummary(
      baseMeta({ ceStatus: 'Cyber Essentials Plus', ceCertDate: '2025-06-01' }),
      TODAY,
    );
    expect(s.renewalDeadline?.lapsed).toBe(false);
    if (s.renewalDeadline?.lapsed === false) {
      expect(s.renewalDeadline.severity).toBe('red');
    }
  });

  it('certified more than a year ago ⇒ lapsed with days-since count', () => {
    const s = getCeStatusSummary(
      baseMeta({ ceStatus: 'Cyber Essentials', ceCertDate: '2025-01-01' }),
      TODAY,
    );
    expect(s.renewalDeadline?.lapsed).toBe(true);
    if (s.renewalDeadline?.lapsed === true) {
      expect(s.renewalDeadline.daysSince).toBeGreaterThan(0);
    }
  });
});
