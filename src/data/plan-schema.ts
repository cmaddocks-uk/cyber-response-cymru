// Initial plan state. Acts as both the runtime default and as the schema that
// `deepMergeSchema` validates user JSON imports against — every saved-plan
// file in the wild follows this shape, so DO NOT rename fields or change
// types without a deliberate migration story for old saves.
//
// Field names match v1.7.0 exactly so JSON files from the v1.x build load
// cleanly into v2.

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TeamMember {
  name: string;
  role: string;
  phone: string;
  email: string;
  alt: string;
}

export interface OtherSupplier {
  name: string;
  service: string;
  phone: string;
  email: string;
}

export interface AssetRow {
  name: string;
  supplier: string;
  dataHeld: string;
  hosting: string;
  rto: string;
  priority: string;
  incidentContact: string;
  lastExport: string;
  notes: string;
}

export interface PlaybookFlag {
  enabled: boolean;
  notes: string;
}

// All nine playbooks present in v1.7.0. Adding one is a code change; removing
// one breaks loaded saves, so don't.
export type PlaybookKey =
  | 'ransomware'
  | 'dataBreach'
  | 'accountCompromise'
  | 'phishing'
  | 'bec'
  | 'aiExtortion'
  | 'denialOfService'
  | 'insiderThreat'
  | 'saasSupplierIncident';

export interface PlanState {
  meta: {
    schoolName: string;
    trustName: string;
    urn: string;
    planVersion: string;
    planDate: string;
    nextReview: string;
    approvedBy: string;
    approverRole: string;
    ceStatus: string;
    ceCertDate: string;
    schoolLogo: string;
  };
  team: {
    leadName: string;
    leadRole: string;
    leadPhone: string;
    leadEmail: string;
    leadAlt: string;
    deputyName: string;
    deputyRole: string;
    deputyPhone: string;
    deputyEmail: string;
    deputyAlt: string;
    itLeadName: string;
    itLeadRole: string;
    itLeadPhone: string;
    itLeadEmail: string;
    itLeadAlt: string;
    dpoName: string;
    dpoOrg: string;
    dpoPhone: string;
    dpoEmail: string;
    dpoAlt: string;
    commsLeadName: string;
    commsLeadRole: string;
    commsLeadPhone: string;
    commsLeadEmail: string;
    commsLeadAlt: string;
    members: TeamMember[];
  };
  external: {
    itProvider: { name: string; contact: string; phone: string; email: string; outOfHours: string };
    ncscReport: string;
    actionFraud: string;
    ico: string;
    rpa: string;
    cyberInsurer: string;
    welshGovContact: string;
    rocuCyberProtect: string;
    localAuthority: string;
    miSupplier: string;
    broadbandSupplier: string;
    legalAdviser: string;
    otherSuppliers: OtherSupplier[];
  };
  severity: { s1Desc: string; s2Desc: string; s3Desc: string; s4Desc: string };
  escalation: {
    decisionTakeOffline: string;
    decisionTakeOfflineDeputy: string;
    decisionEngageExternal: string;
    decisionEngageExternalDeputy: string;
    decisionRansomware: string;
    decisionPress: string;
    decisionPressDeputy: string;
    decisionICO: string;
    decisionICODeputy: string;
    conferenceLine: string;
  };
  playbooks: Record<PlaybookKey, PlaybookFlag>;
  comms: {
    primaryChannelDown: string;
    alternateChannel: string;
    parentTemplate: string;
    staffTemplate: string;
    icoTemplate: string;
    governorTemplate: string;
    websiteHoldingPage: string;
  };
  assets: { systems: AssetRow[]; biaNotes: string };
  recovery: {
    rto: string;
    rpo: string;
    backupLocations: string;
    backupOwner: string;
    backupTestFrequency: string;
    priorityRestoreOrder: string;
  };
  review: { reviewLead: string; reviewDeadline: string; formLocation: string; learningProcess: string };
  maintenance: {
    owner: string;
    reviewFrequency: string;
    lastReviewed: string;
    nextReview: string;
    distribution: string;
    offlineCopyLocation: string;
  };
}

export type ScenarioId =
  | 'active-learning-trust'
  | 'fylde-coast'
  | 'example-c-bec'
  | 'example-d-account-compromise'
  | 'example-e-insider'
  | 'example-f-cloud-ransomcloud';

export interface TabletopState {
  activeScenario: ScenarioId | '';
  currentStep: number;
  scenarioAnswers: Record<ScenarioId, Record<string, string>>;
  completed: Record<ScenarioId, string>;
}

// Readiness state: question id -> score 0..3
export type ReadinessState = Record<string, number>;

// The top-level state tree. Called "Incident" conceptually — a school's whole
// cyber-incident posture: their readiness self-assessment, their written
// response plan, and any tabletop runs they've done. Runtime shape is
// identical to v1.x's AppState — the keys (`plan`, `readiness`, `tabletop`)
// must not be renamed or saved JSON exports stop loading.
export interface Incident {
  readiness: ReadinessState;
  plan: PlanState;
  tabletop: TabletopState;
}

// ---------------------------------------------------------------------------
// Initial values
// ---------------------------------------------------------------------------

export function initialPlan(): PlanState {
  return {
    meta: {
      schoolName: '',
      trustName: '',
      urn: '',
      planVersion: '1.0',
      planDate: new Date().toISOString().slice(0, 10),
      nextReview: '',
      approvedBy: '',
      approverRole: '',
      ceStatus: '',
      ceCertDate: '',
      schoolLogo: '',
    },
    team: {
      leadName: '',
      leadRole: 'Senior Leadership Team Digital Lead',
      leadPhone: '',
      leadEmail: '',
      leadAlt: '',
      deputyName: '',
      deputyRole: '',
      deputyPhone: '',
      deputyEmail: '',
      deputyAlt: '',
      itLeadName: '',
      itLeadRole: '',
      itLeadPhone: '',
      itLeadEmail: '',
      itLeadAlt: '',
      dpoName: '',
      dpoOrg: '',
      dpoPhone: '',
      dpoEmail: '',
      dpoAlt: '',
      commsLeadName: '',
      commsLeadRole: '',
      commsLeadPhone: '',
      commsLeadEmail: '',
      commsLeadAlt: '',
      members: [],
    },
    external: {
      itProvider: { name: '', contact: '', phone: '', email: '', outOfHours: '' },
      ncscReport: 'https://report.ncsc.gov.uk/ – phone 0300 020 0973',
      actionFraud: '0300 123 2040 – reportfraud.police.uk',
      ico: '0303 123 1113 – ico.org.uk/for-organisations/report-a-breach (within 72 hours of becoming aware of a personal data breach)',
      rpa: '',
      cyberInsurer: '',
      welshGovContact: '',
      rocuCyberProtect: '',
      localAuthority: '',
      miSupplier: '',
      broadbandSupplier: '',
      legalAdviser: '',
      otherSuppliers: [],
    },
    severity: {
      s1Desc:
        'Critical: total or near-total loss of teaching, MIS, finance or safeguarding systems; confirmed compromise of personal data; ransomware confirmed.',
      s2Desc:
        'Major: significant disruption to multiple systems or year groups; suspected (not yet confirmed) data compromise; significant phishing or account compromise.',
      s3Desc:
        'Moderate: localised disruption to one system or area; isolated account compromise with no data loss; failed phishing attempts targeting staff.',
      s4Desc:
        'Minor: single user or device affected; suspicious activity blocked by existing controls; awareness/training-related events.',
    },
    escalation: {
      decisionTakeOffline: '',
      decisionTakeOfflineDeputy: '',
      decisionEngageExternal: '',
      decisionEngageExternalDeputy: '',
      decisionRansomware:
        'Ransom must NOT be paid. Decision to be referred to local authority cyber lead / insurer immediately. NCSC and Welsh Government strongly advise against payment.',
      decisionPress: '',
      decisionPressDeputy: '',
      decisionICO: '',
      decisionICODeputy: '',
      conferenceLine: '',
    },
    playbooks: {
      ransomware: { enabled: true, notes: '' },
      dataBreach: { enabled: true, notes: '' },
      accountCompromise: { enabled: true, notes: '' },
      phishing: { enabled: true, notes: '' },
      bec: { enabled: true, notes: '' },
      aiExtortion: { enabled: true, notes: '' },
      denialOfService: { enabled: false, notes: '' },
      insiderThreat: { enabled: false, notes: '' },
      saasSupplierIncident: { enabled: true, notes: '' },
    },
    comms: {
      primaryChannelDown: '',
      alternateChannel: '',
      parentTemplate: '',
      staffTemplate: '',
      icoTemplate: '',
      governorTemplate: '',
      websiteHoldingPage: '',
    },
    assets: {
      systems: [
        {
          name: 'MIS (pupil records)',
          supplier: '',
          dataHeld: 'Pupil records, attendance, contacts, ALN/ASN, FSM, safeguarding flags',
          hosting: 'SaaS',
          rto: '<1 day',
          priority: '1 — Critical',
          incidentContact: '',
          lastExport: '',
          notes: '',
        },
        {
          name: 'Email & productivity',
          supplier: '',
          dataHeld: 'All staff and pupil email, shared documents, calendars',
          hosting: 'SaaS',
          rto: '<4 hours',
          priority: '1 — Critical',
          incidentContact: '',
          lastExport: '',
          notes: '',
        },
        {
          name: 'Safeguarding system',
          supplier: '',
          dataHeld: 'Safeguarding concerns, chronologies, restricted access records',
          hosting: 'SaaS',
          rto: '<1 day',
          priority: '1 — Critical',
          incidentContact: '',
          lastExport: '',
          notes: '',
        },
        {
          name: 'Finance / payroll',
          supplier: '',
          dataHeld: 'Bank details, supplier payments, payroll, budget',
          hosting: '',
          rto: '<3 days',
          priority: '1 — Critical',
          incidentContact: '',
          lastExport: '',
          notes: '',
        },
        {
          name: 'Parent comms / payments',
          supplier: '',
          dataHeld: 'Parent contact details, payment data, dinner money, trip payments',
          hosting: 'SaaS',
          rto: '<3 days',
          priority: '2 — High',
          incidentContact: '',
          lastExport: '',
          notes: '',
        },
        {
          name: 'Network & wifi',
          supplier: '',
          dataHeld: 'Connectivity for all school systems',
          hosting: 'On-prem',
          rto: '<4 hours',
          priority: '1 — Critical',
          incidentContact: '',
          lastExport: '',
          notes: '',
        },
        {
          name: 'Hwb-hosted services',
          supplier: 'Welsh Government / HWB',
          dataHeld: 'Welsh Gov digital learning platform — Office 365, Adobe, J2e, etc.',
          hosting: 'SaaS',
          rto: '<1 day',
          priority: '2 — High',
          incidentContact: 'hwb@gov.wales',
          lastExport: '',
          notes: '',
        },
        {
          name: 'Telephony',
          supplier: '',
          dataHeld: 'Inbound/outbound calls; safeguarding-critical for emergencies',
          hosting: '',
          rto: '<1 day',
          priority: '2 — High',
          incidentContact: '',
          lastExport: '',
          notes: '',
        },
      ],
      biaNotes: '',
    },
    recovery: {
      rto: '',
      rpo: '',
      backupLocations: '',
      backupOwner: '',
      backupTestFrequency: 'Termly',
      priorityRestoreOrder:
        '1. Safeguarding records & access\n2. MIS / SIMS / Bromcom / Arbor\n3. Finance system\n4. Email & communications\n5. Teaching applications\n6. General file shares',
    },
    review: {
      reviewLead: '',
      reviewDeadline: 'Within 4 weeks of incident closure',
      formLocation: '',
      learningProcess: '',
    },
    maintenance: {
      owner: '',
      reviewFrequency: 'Annual, plus after any incident or significant change',
      lastReviewed: '',
      nextReview: '',
      distribution: '',
      offlineCopyLocation: '',
    },
  };
}

function emptyScenarioAnswers(): Record<ScenarioId, Record<string, string>> {
  return {
    'active-learning-trust': {},
    'fylde-coast': {},
    'example-c-bec': {},
    'example-d-account-compromise': {},
    'example-e-insider': {},
    'example-f-cloud-ransomcloud': {},
  };
}

function emptyCompleted(): Record<ScenarioId, string> {
  return {
    'active-learning-trust': '',
    'fylde-coast': '',
    'example-c-bec': '',
    'example-d-account-compromise': '',
    'example-e-insider': '',
    'example-f-cloud-ransomcloud': '',
  };
}

export function initialTabletop(): TabletopState {
  return {
    activeScenario: '',
    currentStep: 0,
    scenarioAnswers: emptyScenarioAnswers(),
    completed: emptyCompleted(),
  };
}

export function initialIncident(): Incident {
  return {
    readiness: {},
    plan: initialPlan(),
    tabletop: initialTabletop(),
  };
}
