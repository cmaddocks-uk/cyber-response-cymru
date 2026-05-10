const fs = require('fs');
const { JSDOM } = require('jsdom');

let html = fs.readFileSync('index.html', 'utf8');

// Inject a tail script that exposes internals on window for testing only
const exposeTail = `
<script>
window.__T = {
  state: () => state,
  setState: (s) => { state = s; },
  SECTIONS, READINESS,
  goTab, setReadiness, renderReadinessResult, generatePlan, addMember,
  showSection, initState
};
</script>
`;
html = html.replace('</body>', exposeTail + '</body>');

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  url: 'http://localhost/',
});

const { window } = dom;
const doc = window.document;
// Suppress scrollTo errors
window.scrollTo = () => {};

setTimeout(() => {
  const T = window.__T;
  const issues = [];

  // 1. Check tabs exist
  const tabBtns = doc.querySelectorAll('nav.tabs button');
  if(tabBtns.length !== 10) issues.push(`Expected 10 tab buttons, got ${tabBtns.length}`);

  // 2. Check readiness questions render
  const readinessCards = doc.querySelectorAll('#readinessQuestions .card');
  if(readinessCards.length !== 12) issues.push(`Expected 12 readiness cards, got ${readinessCards.length}`);

  // 3. Check section nav
  const sectionBtns = doc.querySelectorAll('#sectionNav button');
  if(sectionBtns.length !== 10) issues.push(`Expected 10 plan sections, got ${sectionBtns.length}`);

  // 4. goTab
  try {
    T.goTab('plan');
    if(doc.getElementById('tab-plan').classList.contains('hidden')) issues.push('goTab(plan) did not unhide');
  } catch(e) { issues.push('goTab error: ' + e.message); }

  // 5. setReadiness
  try {
    T.setReadiness('R1', 3);
    if(T.state().readiness.R1 !== 3) issues.push('setReadiness did not store value');
  } catch(e) { issues.push('setReadiness error: ' + e.message); }

  // 6. All answered triggers result
  try {
    for(const q of T.READINESS) T.state().readiness[q.id] = 2;
    T.renderReadinessResult();
    const card = doc.getElementById('readinessResultCard');
    if(card.style.display !== 'block') issues.push('Result card did not show after answering all');
  } catch(e) { issues.push('renderReadinessResult error: ' + e.message); }

  // 7. Plan generation
  try {
    T.state().plan.meta.schoolName = "Test School";
    T.generatePlan();
    const out = doc.getElementById('planOutput').innerHTML;
    if(!out.includes('Test School')) issues.push('Plan output did not include school name');
    if(!out.includes('Cyber Incident Response Plan')) issues.push('Plan output missing title');
    if(out.length < 5000) issues.push('Plan output suspiciously short: ' + out.length);
  } catch(e) { issues.push('generatePlan error: ' + e.message); }

  // 8. Member add
  try {
    const before = T.state().plan.team.members.length;
    T.addMember();
    if(T.state().plan.team.members.length !== before + 1) issues.push('addMember did not increase array');
  } catch(e) { issues.push('addMember error: ' + e.message); }

  // 9. State serialisation
  try {
    const json = JSON.stringify(T.state());
    const parsed = JSON.parse(json);
    if(!parsed.plan) issues.push('State serialisation failed');
    if(!parsed.plan.meta) issues.push('Plan meta missing');
    if(!parsed.plan.team) issues.push('Plan team missing');
    if(!parsed.plan.playbooks) issues.push('Plan playbooks missing');
  } catch(e) { issues.push('State serialise error: ' + e.message); }

  // 10. All SECTIONS render
  for(const s of T.SECTIONS) {
    try {
      T.showSection(s.id);
    } catch(e) { issues.push(`showSection(${s.id}) error: ${e.message}`); }
  }

  // 11. Required IDs
  const requiredIds = ['readinessProgress','readinessStatus','readinessQuestions','planSections','sectionNav','planOutput'];
  for(const id of requiredIds) {
    if(!doc.getElementById(id)) issues.push(`Missing required #${id}`);
  }

  // 12. Empty plan placeholders
  try {
    T.setState(T.initState());
    T.generatePlan();
    const out = doc.getElementById('planOutput').innerHTML;
    if(!out.includes('to be completed')) issues.push('Empty plan should show "to be completed" placeholders');
  } catch(e) { issues.push('Empty plan generation error: ' + e.message); }

  // 13. Verify playbook generation produces all 6 playbooks when enabled
  try {
    const s = T.initState();
    Object.keys(s.plan.playbooks).forEach(k => s.plan.playbooks[k].enabled = true);
    T.setState(s);
    T.generatePlan();
    const out = doc.getElementById('planOutput').innerHTML;
    const expected = ['Ransomware','Personal data breach','Account compromise','Phishing campaign','Denial of service','Insider threat'];
    for(const e of expected) if(!out.includes(e)) issues.push(`Playbook missing: ${e}`);
  } catch(e) { issues.push('Playbook test error: ' + e.message); }

  // 14. Severity table renders
  try {
    T.showSection('severity');
    const sevTextareas = doc.querySelectorAll('table.sev textarea');
    if(sevTextareas.length !== 4) issues.push(`Expected 4 severity textareas, got ${sevTextareas.length}`);
  } catch(e) { issues.push('Severity render error: ' + e.message); }

  if(issues.length === 0) {
    console.log('✅ All 14 test groups passed');
  } else {
    console.log('❌ Issues found:');
    issues.forEach(i => console.log('  -', i));
    process.exit(1);
  }
}, 500);

