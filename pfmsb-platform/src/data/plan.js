// Content source: "PFMSB 2027 Action Plan · 12-Month Roadmap" (21 slides).
// All KPI values are proposed Year 1 targets or gates, not PFMSB actual results.

export const PROGRAMME = {
  name: 'PFMSB 2027 Action Plan',
  title: '12-Month Transformation Roadmap',
  titleMs: 'Pelan Hala Tuju Transformasi 12 Bulan',
  summary:
    'Five phases to build the capabilities, controls and commercial reach PFMSB needs to deliver reliable property and facilities services, and to win work beyond PR1MA.',
  months: 12,
};

export const CLUSTERS = [
  {
    id: 'A',
    name: 'Core Service Delivery',
    priority: 'Critical',
    lead: 'Operations Lead',
    functions: [1, 2, 8],
    hue: 'leaf',
  },
  {
    id: 'B',
    name: 'Business Growth',
    priority: 'Critical',
    lead: 'Business Development Lead',
    functions: [3, 4, 5],
    hue: 'sun',
  },
  {
    id: 'C',
    name: 'Corporate Enablement',
    priority: 'High',
    lead: 'Corporate Services Lead',
    functions: [6, 7, 11, 12],
    hue: 'sky',
  },
  {
    id: 'D',
    name: 'Performance & Digitalisation',
    priority: 'High',
    lead: 'Database & Reporting Lead',
    functions: [9, 10],
    hue: 'iris',
  },
];

// sample: illustrative maturity score (1–5) used only to demo the interface.
export const FUNCTIONS = [
  { id: 1, name: 'Property management', cluster: 'A', sample: 2 },
  { id: 2, name: 'Facilities management', cluster: 'A', sample: 3 },
  { id: 3, name: 'Project & contract management', cluster: 'B', sample: 2 },
  { id: 4, name: 'Tender & business development', cluster: 'B', sample: 1 },
  { id: 5, name: 'Commercial & pricing', cluster: 'B', sample: 2 },
  { id: 6, name: 'Finance & tax', cluster: 'C', sample: 3 },
  { id: 7, name: 'Procurement & vendors', cluster: 'C', sample: 2 },
  { id: 8, name: 'Operations & mobilisation', cluster: 'A', sample: 2 },
  { id: 9, name: 'HSSE & quality', cluster: 'D', sample: 3 },
  { id: 10, name: 'Technology & reporting', cluster: 'D', sample: 1 },
  { id: 11, name: 'Human capital', cluster: 'C', sample: 2 },
  { id: 12, name: 'Governance & legal', cluster: 'C', sample: 3 },
];

export const PHASES = [
  {
    id: 1,
    short: 'Foundation',
    name: 'Foundation & Readiness Assessment',
    nameMs: 'Fasa 1',
    start: 1,
    end: 2,
    intent: 'Know where PFMSB stands today across all 12 functions, so later decisions rest on evidence.',
    summary: 'Assess all 12 functions, find gaps, set baseline KPIs',
    activities: [
      'Assess current organisational capabilities against all 12 functions.',
      'Identify manpower, competency and licensing gaps.',
      'Review existing contracts, financial performance and operational processes.',
      'Establish baseline KPIs and business targets.',
      'Identify immediate business opportunities.',
    ],
    focus: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    focusLabel: 'All 12 functions assessed',
    deliverable: 'PFMSB Capability Gap Assessment and Transformation Plan',
  },
  {
    id: 2,
    short: 'Core capability',
    name: 'Core Capability Development',
    nameMs: 'Fasa 2',
    start: 3,
    end: 4,
    intent: 'Build the service, commercial and people foundations PFMSB needs before it runs a pilot.',
    summary: 'Strengthen core services, SOPs, pricing and vendor framework',
    activities: [
      'Strengthen Property Management and Facilities Management.',
      'Establish Project and Contract Management procedures.',
      'Develop standard operating procedures (SOPs).',
      'Establish cost library, schedule of rates and pricing methodology.',
      'Build vendor prequalification and procurement framework.',
      'Develop competency matrix and workforce requirements.',
    ],
    focus: [1, 2, 3, 5, 7, 8, 11],
    deliverable: 'Operational and Commercial Readiness Framework',
  },
  {
    id: 3,
    short: 'Pilot & market entry',
    name: 'Pilot Implementation & Market Entry',
    nameMs: 'Fasa 3',
    start: 5,
    end: 7,
    intent: 'Prove the model on real PR1MA sites while starting to win work outside PR1MA.',
    summary: 'Run a pilot on PR1MA sites and start bidding for work',
    activities: [
      'Implement standardised FM operations at selected PR1MA developments.',
      'Pilot the 30/60/90-day mobilisation framework.',
      'Launch tender and business development initiatives.',
      'Prepare technical and commercial tender submissions.',
      'Implement financial reporting, project costing and SLA monitoring.',
      'Test PropKita/CMMS integration and operational dashboards.',
    ],
    focus: [2, 4, 5, 6, 8, 9, 10],
    deliverable: 'Successful pilot operations and first external business opportunities',
  },
  {
    id: 4,
    short: 'Commercial expansion',
    name: 'Commercial Expansion',
    nameMs: 'Fasa 4',
    start: 8,
    end: 10,
    intent:
      'Win and deliver external IFM (Integrated Facilities Management) and property management contracts profitably.',
    summary: 'Bid for external work and grow beyond PR1MA',
    activities: [
      'Participate in external IFM and property management tenders.',
      'Expand services beyond PR1MA developments.',
      'Strengthen contract management and client relationship management.',
      'Implement ISO and HSSE improvement programmes.',
      'Monitor project profitability and operational performance.',
      'Review manpower deployment and subcontractor performance.',
    ],
    focus: [1, 2, 3, 4, 5, 6, 7, 8, 9, 11],
    deliverable: 'Expanded business portfolio and secured external contracts',
  },
  {
    id: 5,
    short: 'Performance review',
    name: 'Performance Review & Institutionalisation',
    nameMs: 'Fasa 5',
    start: 11,
    end: 12,
    intent: 'Check results against the plan, make what works permanent, and set up the next three years.',
    summary: 'Review results, reassess maturity, make the gains permanent and plan Years 2–3',
    activities: [
      'Evaluate achievement against business plan KPIs.',
      'Review profitability, cash flow and contract performance.',
      'Conduct capability maturity reassessment.',
      'Close remaining competency and compliance gaps.',
      'Prepare the next three-year business expansion plan.',
    ],
    focus: [3, 6, 11, 12],
    focusLabel: 'All 12 reassessed',
    deliverable: 'PFMSB Business Performance Report and Year 2–3 Growth Plan',
  },
];

export const GATES = [
  {
    id: 'g1',
    month: 2,
    phase: 1,
    deliverable: 'Capability Gap Assessment and Transformation Plan',
    checks: ['Gaps and baseline KPIs agreed', 'Targets set'],
  },
  {
    id: 'g2',
    month: 4,
    phase: 2,
    deliverable: 'Operational and Commercial Readiness Framework',
    checks: [
      'Procedures, SOPs and pricing in place',
      'Vendor framework and competency matrix ready',
      'Ready to pilot',
    ],
  },
  {
    id: 'g3',
    month: 7,
    phase: 3,
    deliverable: 'Successful pilot and first external opportunities',
    checks: [
      'Pilot results reviewed',
      'First external opportunities identified',
      'Dashboards and SLA monitoring working',
    ],
  },
  {
    id: 'g4',
    month: 10,
    phase: 4,
    deliverable: 'Expanded portfolio and secured external contracts',
    checks: [
      'External contracts secured',
      'Profitability and performance monitored',
      'HSSE and ISO programmes running',
    ],
  },
  {
    id: 'g5',
    month: 12,
    phase: 5,
    deliverable: 'Performance Report and Year 2–3 Growth Plan',
    checks: ['KPIs checked against plan', 'Maturity reassessed', 'Year 2–3 plan approved'],
  },
];

export const KPIS = [
  {
    name: 'Capability baseline',
    evidence: 'All 12 functions scored; evidence and gap register',
    target: '100% of 12 functions scored by end of M2',
  },
  {
    name: 'Readiness framework',
    evidence: 'Gate checklist across people, process, tools and risk',
    target: '≥90% of critical launch criteria met before the pilot',
  },
  {
    name: 'Pilot results',
    evidence: 'KPI and SLA definitions, owners and data sources',
    target: '≥95% KPI data completeness by end of the pilot',
  },
  {
    name: 'Commercial portfolio',
    evidence: 'Tender log, submissions and contracts secured',
    target: 'Target set from the Phase 1 baseline, to be confirmed',
  },
  {
    name: 'Performance and growth',
    evidence: 'Maturity reassessment and Business Performance Report',
    target: 'All 12 functions re-scored; Year 2–3 plan approved',
  },
  {
    name: 'Governance',
    evidence: 'Decision, risk, issue and action logs',
    target: 'Monthly review; actions tracked to closure',
  },
];

export const SUCCESS = [
  { value: '12/12', label: 'Functions have an owner, baseline score and gap actions' },
  { value: '4', label: 'Capability clusters covered by approved plans' },
  { value: '≥90%', label: 'Critical pilot launch criteria passed before go-live' },
  { value: '≥95%', label: 'KPI data completeness by end of the pilot (Phase 3)' },
  { value: '100%', label: 'Material risks and decisions logged with accountable owners' },
  { value: '1', label: 'Evidence-based Year 2–3 growth plan and investment recommendation' },
];

export const MATURITY = [
  { level: 1, name: 'Initial', text: 'Ad hoc; ownership or evidence unclear' },
  { level: 2, name: 'Defined', text: 'Process and owner documented' },
  { level: 3, name: 'Implemented', text: 'People, tools and controls in use' },
  { level: 4, name: 'Measured', text: 'Performance reviewed against targets' },
  { level: 5, name: 'Optimised', text: 'Improvement proven and sustained' },
];

export const DIMENSIONS = ['Capability', 'Licences', 'Delivery evidence', 'Risk', 'Measurable performance'];

export const RISKS = [
  {
    name: 'Scope and mandate',
    must: 'Confirm service scope, customer promise and decision rights',
    control: 'Charter signed; change control active',
    icon: 'Compass',
  },
  {
    name: 'Licences and compliance',
    must: 'Validate the regulatory pathway and professional coverage',
    control: 'Compliance checklist before bids / mobilisation',
    icon: 'BadgeCheck',
  },
  {
    name: 'People capacity',
    must: 'Prioritise critical roles and competency gaps',
    control: 'Hiring and training plan tied to phase gates',
    icon: 'Users',
  },
  {
    name: 'Cost and cash',
    must: 'Build the cost library, working capital and bonding view',
    control: 'Finance review before bid / launch approval',
    icon: 'Wallet',
  },
  {
    name: 'Data and systems',
    must: 'Set minimum asset and service data standards',
    control: 'Data owner, definitions and completeness checks',
    icon: 'Database',
  },
  {
    name: 'Third-party delivery',
    must: 'Qualify vendors and monitor HSSE / service evidence',
    control: 'Due diligence and performance review cadence',
    icon: 'Handshake',
  },
];

export const DECISIONS = [
  'Confirm the PFMSB mandate, initial service scope and Year 1 ambition',
  'Appoint the senior leader, plan coordinator and accountable owners for all 12 functions',
  'Approve the Phase 1 baseline and assessment work, including access to evidence and stakeholders',
  'Set the pilot selection criteria, risk appetite and scale / stop authority',
  'Validate the proposed KPI definitions, thresholds, data owners and review cadence',
  'Confirm the resource envelope and the approval path for hiring, tools and vendor onboarding',
];

export const GOVERNANCE = [
  { body: 'Board of Directors', role: 'Strategic direction and approval' },
  { body: 'Steering Committee', role: 'Monthly · approves scope, funding, gates and exceptions' },
  { body: 'Senior Management', role: 'Owns outcomes · unblocks cross-functional dependencies' },
  { body: 'Plan Coordinator', role: 'Meets weekly · integrated schedule, risks, actions and KPIs' },
];

export const RHYTHM = [
  { cadence: 'Weekly', name: 'Workstream review', text: 'Milestones, blockers and decisions needed' },
  { cadence: 'Monthly', name: 'SteerCo', text: 'KPI trends, risk exposure, spend and gate status' },
  { cadence: 'Quarterly', name: 'Assurance', text: 'Sample evidence, HSSE, contract and financial controls' },
];

export const GLOSSARY = [
  { term: 'Baseline', text: 'Where PFMSB stands today, measured with evidence before we change anything.' },
  { term: 'Stage gate', text: 'A checkpoint. Management confirms the evidence before the next phase starts.' },
  { term: 'Pilot', text: 'A small, real trial of our service delivery before we expand.' },
  { term: 'Mobilisation', text: 'Getting people, tools and vendors ready to start a new service.' },
  { term: 'KPI', text: 'Key performance indicator: a number that shows if we are on track.' },
  { term: 'Maturity score', text: 'A 1 to 5 rating of how well a function works, based on evidence.' },
  { term: 'PMO', text: 'Programme Management Office. Keeps the plan, risks and actions on track.' },
  { term: 'SteerCo', text: 'Steering Committee. Approves scope, funding and gate decisions each month.' },
  { term: 'HSSE', text: 'Health, Safety, Security and Environment controls at every site.' },
];

export const TAKEAWAYS = [
  'Name owners across all 12 functions',
  'Use stage gates and evidence to control readiness',
  'Scale only after pilot review and corrective action',
];

export const fnById = (id) => FUNCTIONS.find((f) => f.id === id);
export const clusterById = (id) => CLUSTERS.find((c) => c.id === id);
export const phaseForMonth = (m) => PHASES.find((p) => m >= p.start && m <= p.end);

// Focus state of a function in a phase, mirroring slide 7.
export function focusState(fnId, phase) {
  if (phase.id === 1) return 'assess';
  if (phase.id === 5) return phase.focus.includes(fnId) ? 'focus' : 'reassess';
  return phase.focus.includes(fnId) ? 'focus' : null;
}
