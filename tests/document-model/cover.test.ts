import { describe, it, expect } from 'vitest';
import { fitWithin, derivePreparedBy } from '~/lib/document-model/components/cover';
import {
  academicYear,
  ceStatusForCover,
  formatUkDate,
  preparedMonthYear,
  coverMetaForPlan,
} from '~/lib/document-model/cover-helpers';
import { initialIncident } from '~/data/plan-schema';

describe('fitWithin — logo aspect-ratio preservation', () => {
  it('square logo fits the shorter side of a wide box', () => {
    expect(fitWithin(800, 800, 220, 140)).toEqual({ width: 140, height: 140 });
  });

  it('wide banner is constrained by width', () => {
    expect(fitWithin(1000, 200, 220, 140)).toEqual({ width: 220, height: 44 });
  });

  it('tall portrait is constrained by height', () => {
    expect(fitWithin(200, 1000, 220, 140)).toEqual({ width: 28, height: 140 });
  });

  it('already-small image keeps its native dimensions (no upscale)', () => {
    expect(fitWithin(100, 80, 220, 140)).toEqual({ width: 100, height: 80 });
  });

  it('unknown dimensions fall back to the bounding box', () => {
    expect(fitWithin(undefined, undefined, 220, 140)).toEqual({ width: 220, height: 140 });
    expect(fitWithin(0, 0, 220, 140)).toEqual({ width: 220, height: 140 });
  });
});

describe('academicYear', () => {
  it('Sep–Dec dates start the academic year', () => {
    expect(academicYear('2026-09-01')).toBe('2026–27');
    expect(academicYear('2026-12-31')).toBe('2026–27');
  });

  it('Jan–Jul dates belong to the previous academic year', () => {
    expect(academicYear('2026-03-01')).toBe('2025–26');
    expect(academicYear('2027-05-17')).toBe('2026–27');
  });

  it('returns empty for missing or unparseable dates', () => {
    expect(academicYear('')).toBe('');
    expect(academicYear(undefined)).toBe('');
    expect(academicYear('not a date')).toBe('');
  });
});

describe('ceStatusForCover', () => {
  const baseMeta = {
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
  };

  it('returns a "Certified" suffix when CE / CE Plus is set', () => {
    expect(ceStatusForCover({ ...baseMeta, ceStatus: 'Cyber Essentials' })).toBe('Cyber Essentials Certified');
    expect(ceStatusForCover({ ...baseMeta, ceStatus: 'Cyber Essentials Plus' })).toBe('Cyber Essentials Plus Certified');
  });

  it('returns empty for unset / not-started / working-towards', () => {
    expect(ceStatusForCover({ ...baseMeta, ceStatus: '' })).toBe('');
    expect(ceStatusForCover({ ...baseMeta, ceStatus: 'Not started' })).toBe('');
    expect(ceStatusForCover({ ...baseMeta, ceStatus: 'Working towards' })).toBe('');
  });
});

describe('formatUkDate', () => {
  it('formats ISO dates as UK long-form ("17 May 2027")', () => {
    expect(formatUkDate('2027-05-17')).toBe('17 May 2027');
    expect(formatUkDate('2026-01-01')).toBe('1 January 2026');
  });

  it('returns empty for missing / null', () => {
    expect(formatUkDate('')).toBe('');
    expect(formatUkDate(undefined)).toBe('');
  });

  it('returns input verbatim if unparseable', () => {
    expect(formatUkDate('not a date')).toBe('not a date');
  });
});

describe('preparedMonthYear', () => {
  it('formats a Date as Month + Year', () => {
    expect(preparedMonthYear(new Date('2026-05-15T12:00:00Z'))).toBe('May 2026');
    expect(preparedMonthYear(new Date('2027-01-03T00:00:00Z'))).toBe('January 2027');
  });
});

describe('derivePreparedBy', () => {
  it('takes the school name before the trust separator', () => {
    expect(derivePreparedBy('Park Community School · Anytown MAT')).toBe('Park Community School');
  });

  it('returns the subtitle verbatim if there is no separator', () => {
    expect(derivePreparedBy('Park Community School')).toBe('Park Community School');
  });

  it('returns empty when no subtitle', () => {
    expect(derivePreparedBy(undefined)).toBe('');
    expect(derivePreparedBy('')).toBe('');
  });
});

describe('coverMetaForPlan', () => {
  it('emits Version + Approved + Next review when all set', () => {
    const incident = initialIncident();
    incident.plan.meta.planVersion = '1.0';
    incident.plan.meta.planDate = '2026-05-15';
    incident.plan.meta.nextReview = '2027-05-17';
    expect(coverMetaForPlan(incident.plan)).toEqual([
      { value: 'Version 1.0' },
      { value: 'Approved 15 May 2026' },
      { value: 'Next review 17 May 2027' },
    ]);
  });

  it('drops empty fields silently', () => {
    const incident = initialIncident();
    incident.plan.meta.planVersion = '1.0';
    // Clear the planDate default — initialPlan() sets it to today's ISO date.
    incident.plan.meta.planDate = '';
    incident.plan.meta.nextReview = '';
    expect(coverMetaForPlan(incident.plan)).toEqual([{ value: 'Version 1.0' }]);
  });

  it('honours a custom approvedLabel', () => {
    const incident = initialIncident();
    incident.plan.meta.planVersion = '';
    incident.plan.meta.planDate = '2026-05-15';
    incident.plan.meta.nextReview = '';
    expect(coverMetaForPlan(incident.plan, { approvedLabel: 'Issued' })).toEqual([
      { value: 'Issued 15 May 2026' },
    ]);
  });
});
