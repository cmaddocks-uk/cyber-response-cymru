// Verdict band rule — given a readiness totals snapshot, decide which band
// the school is in. The band is universal; audience-specific wording lives
// in the selectors that consume it (so Readiness Summary and Governor Report
// can phrase the same band differently for their audiences without
// duplicating the threshold logic).
//
// Thresholds match v1.7.0 byte-for-byte. Don't change without thinking about
// every surface that displays a verdict — they all derive from this rule.

import type { ReadinessTotals } from './readiness-scoring';

export type VerdictBand = 'strong' | 'reasonable' | 'significant' | 'incomplete';

export type VerdictTone = 'success' | 'warning' | 'danger' | 'muted';

export function computeVerdictBand(totals: ReadinessTotals): VerdictBand {
  if (totals.answered < totals.questionCount) return 'incomplete';
  if (totals.red === 0 && totals.amber <= 2) return 'strong';
  if (totals.red <= 2) return 'reasonable';
  return 'significant';
}

export function bandToTone(band: VerdictBand): VerdictTone {
  switch (band) {
    case 'strong':
      return 'success';
    case 'reasonable':
      return 'warning';
    case 'significant':
      return 'danger';
    case 'incomplete':
      return 'muted';
  }
}

// ---------------------------------------------------------------------------
// ICO maturity band — also universal. Wording matches the ICO toolkit's audit
// framework so it's consistent regardless of which surface it appears on.
// ---------------------------------------------------------------------------
export interface MaturityBand {
  band: 'Not assessed' | 'Initial' | 'Developing' | 'Established' | 'Embedded';
  description: string;
}

export function computeMaturityBand(totals: ReadinessTotals): MaturityBand {
  if (totals.answered < totals.questionCount) {
    return {
      band: 'Not assessed',
      description: 'Complete the full readiness check to receive an ICO maturity rating.',
    };
  }
  if (totals.pct < 40) {
    return {
      band: 'Initial',
      description:
        'Core controls are missing or ad-hoc. Most ICO toolkit baseline expectations are not yet met.',
    };
  }
  if (totals.pct < 65) {
    return {
      band: 'Developing',
      description:
        'Foundations exist but coverage is partial and consistency is patchy. Several ICO baseline controls still need formal implementation.',
    };
  }
  if (totals.pct < 85) {
    return {
      band: 'Established',
      description:
        'Most ICO baseline controls are in place and operating. Some areas still need embedding into routine practice and assurance.',
    };
  }
  return {
    band: 'Embedded',
    description:
      'Controls are in place, evidenced, reviewed and integrated with data-protection and governance routines. Maintain the cadence.',
  };
}
