import { configuration, strategies, stationNames } from './scenarios.js';
import { evaluate, validate, reversal, sensitivities, inputRules } from './engine.js';
import { createFactory } from './factory.js';
import { number, money, percent, recommendationText, comparisonHTML, constraintHTML, sensitivityHTML, reversalHTML, buildReportData, reportHTML } from './report.js';
const $ = id => document.getElementById(id);
// One authoritative state. Input controls hold drafts; outputs share one validated calculation.
const state = { assumptions: configuration(), decision: null, selectedId: 0, station: 1, revision: 0, valid: false, report: null, demo: null };
let timer, demoTimer;
const fields = [
  ['hours', 'Annual operating hours', 'h/year'], ['demand', 'Annual market demand', 'units/year'], ['price', 'Selling price', 'USD/unit'], ['variableCost', 'Non-energy variable cost', 'USD/unit'], ['electricity', 'Electricity tariff', 'USD/kWh'], ['budget', 'Available CAPEX budget', 'USD'], ['discount', 'Discount rate', '%'], ['horizon', 'Investment horizon', 'years'], ['target', 'Minimum capacity improvement', '%'], ['energyAllowance', 'Maximum absolute energy increase', '%'], ['emissions', 'Optional emissions factor', 'kg CO₂e/kWh · unverified']
].map(([key, label, unit]) => ({ key, label, unit, min: inputRules[key][0] * (key === 'discount' ? 100 : 1), max: inputRules[key][1] * (key === 'discount' ? 100 : 1) }));
const groups = [['General assumptions', fields]];
const machineFields = [];
for (let i = 0; i < 4; i++) for (const [key, label, unit, min, max] of [['capacities', 'capacity', 'units/h', .001, 1e7], ['powers', 'power', 'kW', 0, 1e6]]) machineFields.push({ key: `baseline.${key}.${i}`, label: `${String.fromCharCode(65+i)} · ${stationNames[i]} ${label}`, unit, min, max });
groups.push(['Baseline machines', machineFields]);
for (let i = 0; i < 3; i++) groups.push([strategies[i+1].name, [['capex', 'Initial CAPEX', 'USD', 0, 1e12], ['capacityB', 'Machine B effective capacity', 'units/h', .001, 1e7], ['powerB', 'Machine B operating power', 'kW', 0, 1e6], ['fixed', 'Incremental fixed OPEX', 'USD/year', 0, 1e12]].map(([key, label, unit, min, max]) => ({ key: `investments.${i}.${key}`, label, unit, min, max }))]);
const allFields = groups.flatMap(g => g[1]);
const inputId = key => `input-${key.replaceAll('.', '-')}`;
const get = (object, key) => key.split('.').reduce((v, k) => v[k], object);
function set(object, key, value) { const parts = key.split('.'); const last = parts.pop(); parts.reduce((v, k) => v[k], object)[last] = value; }
$('inputs').innerHTML = groups.map(([title, items], i) => `<details ${i === 0 ? 'open' : ''}><summary>${title}</summary><div class="inputs">${items.map(f => `<label for="${inputId(f.key)}">${f.label}<span>${f.unit}</span><input id="${inputId(f.key)}" name="${f.key}" type="number" step="${f.key === 'horizon' ? 1 : 'any'}" min="${f.min}" max="${f.max}" ${f.key === 'emissions' ? '' : 'required'} aria-describedby="error-${inputId(f.key)}"><small class="field-error" id="error-${inputId(f.key)}"></small></label>`).join('')}</div></details>`).join('');
function fillInputs() { for (const f of allFields) { const v = get(state.assumptions, f.key); $(inputId(f.key)).value = v === null ? '' : f.key === 'discount' ? v * 100 : v; } }
function status(text) { state.status = text; $('calculation-status').textContent = text; $('calculation-status').dataset.status = text; $('calculation-revision').textContent = `Revision ${state.revision}${state.valid ? ' · ' + new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kuala_Lumpur' }) : ' · last valid configuration'}`; }
function suppressDecision() {
  state.valid = false; factory.setValidity(false); $('report-open').disabled = true; $('report-print').disabled = true;
  $('verdict').innerHTML = '<h3>Recommendation unavailable</h3><p>Inputs are incomplete or awaiting validation. Displayed calculations use the last valid configuration.</p>';
  for (const id of ['constraint-table','comparison-table','sensitivity-table']) $(id).dataset.stale = 'true';
  if ($('report-dialog').open) $('report-content').innerHTML = '<p role="alert">Inputs changed. Report unavailable until the configuration is valid and recalculated.</p>';
}
function recalculate() {
  clearTimeout(timer);
  const candidate = structuredClone(state.assumptions); let invalid = false;
  for (const f of allFields) {
    const input = $(inputId(f.key)), raw = input.value.trim();
    const value = raw === '' && f.key === 'emissions' ? null : raw === '' ? NaN : Number(raw);
    const error = value === null ? '' : !Number.isFinite(value) ? 'Enter a complete number.' : value < f.min || value > f.max ? `Use ${f.min} to ${f.max}.` : f.key === 'horizon' && !Number.isInteger(value) ? 'Use whole years.' : '';
    input.setAttribute('aria-invalid', String(Boolean(error))); $(`error-${inputId(f.key)}`).textContent = error;
    if (error) invalid = true; set(candidate, f.key, f.key === 'discount' ? value / 100 : value);
  }
  if (invalid) { suppressDecision(); $('input-error').textContent = 'Invalid input. Fix the marked fields. Results are based on the last valid configuration.'; status('Invalid input'); return; }
  try {
    validate(candidate); const decision = evaluate(candidate);
    state.assumptions = candidate; state.decision = decision; state.revision++; state.valid = true;
    $('input-error').textContent = ''; for (const id of ['constraint-table','comparison-table','sensitivity-table']) $(id).dataset.stale = 'false'; $('report-open').disabled = false; $('report-print').disabled = false;
    render(); status('Results up to date');
  } catch (error) { suppressDecision(); $('input-error').textContent = `${error.message} Results use the last valid configuration.`; status('Calculation failed'); console.error(error); }
}
function schedule(e) { if (!e.target.matches('input')) return; suppressDecision(); status('Calculating'); clearTimeout(timer); timer = setTimeout(recalculate, e.type === 'change' ? 0 : 140); }
$('assumptions-form').addEventListener('input', schedule);
$('assumptions-form').addEventListener('change', schedule);
$('assumptions-form').addEventListener('submit', e => { e.preventDefault(); recalculate(); });
$('reset-assumptions').addEventListener('click', () => { if (state.demo) exitDemo(); state.assumptions = configuration(); fillInputs(); recalculate(); });
$('strategy-tabs').innerHTML = strategies.map(s => `<button data-strategy="${s.id}" aria-pressed="${s.id === 0}"><span>0${s.id}</span>${s.short}</button>`).join('');
$('strategy-tabs').addEventListener('click', e => { const button = e.target.closest('[data-strategy]'); if (button) { state.selectedId = Number(button.dataset.strategy); render(); } });
const factory = createFactory($('factory'), i => { state.station = i; renderInspector(); });
function renderInspector() {
  if (!state.decision) return;
  const r = state.decision.results[state.selectedId], i = state.station; factory.update(r, i, state.valid);
  $('inspector-title').textContent = `${String.fromCharCode(65+i)} / ${stationNames[i]}`;
  $('machine-image').src = `./assets/factory/machine-${String.fromCharCode(97+i)}.png`; $('machine-image').alt = `${stationNames[i]} illustrative equipment asset`;
  $('inspector-body').innerHTML = `<p class="status-tag ${r.bottlenecks.includes(i) ? 'amber-text' : ''}">${r.bottlenecks.includes(i) ? 'LINE BOTTLENECK' : 'AVAILABLE STATION CAPACITY'}</p><dl><div><dt>Effective capacity</dt><dd>${number(r.capacities[i])}<small>units/h</small></dd></div><div><dt>Average power</dt><dd>${number(r.powers[i],2)}<small>kW</small></dd></div><div><dt>Sales utilisation</dt><dd>${percent(r.utilisation[i]*100)}</dd></div><div><dt>Above line throughput</dt><dd>${number(r.capacities[i]-r.throughput)}<small>units/h</small></dd></div></dl><p class="fine-print">Unused station capacity is not proven financial waste. Effective capacities already include operational losses.</p>`;
}
function render() {
  const a = state.assumptions, d = state.decision, r = d.results[state.selectedId], base = d.results[0];
  for (const b of $('strategy-tabs').children) b.setAttribute('aria-pressed', String(Number(b.dataset.strategy) === state.selectedId));
  $('factory-label').textContent = `${state.demo ? 'DEMO' : 'SCENARIO'} / ${r.name.toUpperCase()}`; renderInspector();
  $('line-summary').innerHTML = [['Throughput',r.throughput,'units/h','throughput'],['Annual capacity',r.annualCapacity,'units','capacity'],['Annual sales',r.sales,'units','sales'],['Annual electricity',r.energy,'kWh','energy']].map(([label,v,unit,key]) => `<div><span>${label}</span><strong data-metric="${key}" data-value="${v}">${number(v)} <small>${unit}</small></strong></div>`).join('');
  const letters = x => x.bottlenecks.map(i => String.fromCharCode(65+i)).join(' + ');
  $('capacity-notes').innerHTML = `<p><strong>Current constraint: ${letters(r)} · ${number(r.throughput)} units/h.</strong> ${state.selectedId ? `Bottleneck migration: baseline ${letters(base)} → ${letters(r)}.` : `Baseline bottleneck${base.bottlenecks.length > 1 ? 's' : ''}: ${letters(base)}.`}</p><p>${r.bottlenecks.length > 1 ? `Improving one tied station alone adds zero throughput. Joint headroom to the next station: ${number(r.jointHidden)} units/h.` : `Headroom before the next constraint: ${number(r.hidden)} units/h; recovery requires an engineering intervention.`} ${r.excessB > 0 ? `B has ${number(r.excessB)} units/h above line throughput; this is not a measured financial loss.` : ''}</p>`;
  $('comparison-table').innerHTML = comparisonHTML(d.results); $('constraint-table').innerHTML = constraintHTML(d.results);
  $('verdict').innerHTML = `<p class="status-tag">${d.recommendation ? 'FEASIBLE INVESTMENT' : 'NO FEASIBLE INVESTMENT'}</p><h3>${d.recommendation ? d.recommendation.name : 'No investment meets every constraint'}</h3><p>${recommendationText(d)}</p><p class="fine-print">Ranked by highest incremental NPV, lower CAPEX, then stable strategy ID. Do Nothing is the reference.</p>`;
  $('financial-summary').innerHTML = `<p class="eyebrow">SELECTED / ${r.short.toUpperCase()}</p><dl>${[['Initial CAPEX',money(r.capex)],['Incremental NPV',money(r.npv)],['Annual incremental cash flow',money(r.cash)],['Simple payback',r.payback === null ? 'N/A' : number(r.payback,2)+' years'],['Capital efficiency',r.efficiency === null ? 'N/A' : number(r.efficiency,2)+'×']].map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
  $('mandate-values').textContent = `≥ ${percent(a.target)} capacity · ≤ ${percent(a.energyAllowance)} energy growth · ${money(a.budget)} budget · NPV > 0`;
  $('eco-notes').innerHTML = `<p class="${r.paradox ? 'amber-text' : ''}">${r.paradox ? '<strong>Sustainability paradox.</strong> Intensity improves while absolute electricity increases.' : 'Absolute impact and per-unit efficiency are assessed separately.'}</p><dl><div><dt>Energy intensity</dt><dd data-metric="intensity">${r.intensity === null ? 'Undefined (zero output)' : number(r.intensity,4)+' kWh/unit'}</dd></div><div><dt>Intensity change / absolute change</dt><dd>${percent(r.intensityChange)} / ${percent(r.energyChange)}</dd></div></dl><p class="fine-print">${r.emissions === null ? 'No emissions factor supplied.' : number(r.emissions)+' kg CO₂e/year · user-entered unverified factor.'} Fixed operating hours and average power; no demand-adjusted dispatch.</p>`;
  const maxEnergy = Math.max(...d.results.map(x => x.energy));
  $('energy-chart').innerHTML = d.results.map(x => `<div class="bar-row"><div><span>${x.short}</span><strong>${number(x.energy)} kWh</strong></div><div class="bar-track"><span style="width:${maxEnergy ? x.energy/maxEnergy*100 : 0}%" class="${x.energy > base.energy ? 'bar-amber' : ''}"></span></div></div>`).join('');
  $('stress-selection').textContent = `SELECTED / ${r.name.toUpperCase()}`; $('reversal').innerHTML = reversalHTML(reversal(a,r)); $('sensitivity-table').innerHTML = sensitivityHTML(sensitivities(a,r));
  if (state.valid) { state.report = buildReportData(a,state.selectedId,new Date(),d); state.report.revision = state.revision; if ($('report-dialog').open) $('report-content').innerHTML = reportHTML(state.report); } else suppressDecision();
}
$('report-open').addEventListener('click', () => { if (!state.valid) return; state.report = buildReportData(state.assumptions,state.selectedId,new Date(),state.decision); state.report.revision = state.revision; $('report-content').innerHTML = reportHTML(state.report); $('report-dialog').showModal(); });
$('report-close').addEventListener('click', () => $('report-dialog').close());
$('report-print').addEventListener('click', () => { if (state.valid) window.print(); });
const demoSteps = [
  ['Find the constraint','Hypothetical default line: B limits throughput to 800 units/h. Annual capacity is 1,600,000 units.',0,1],
  ['Consider USD850,000 of new equipment','New Machine B provides 1,400 units/h, but D now limits factory throughput to 1,000 units/h.',1,3],
  ['Optimise for USD180,000','B and D tie at 1,000 units/h: equal modelled factory capacity for USD670,000 less initial CAPEX.',2,1],
  ['Compare the energy trade-off','New machine: 440,000 kWh/year and USD1,563,000 annual incremental cash flow. Optimisation: 340,000 kWh and USD1,593,000.',2,3],
  ['Make the capital decision','Optimisation has the highest feasible NPV under default constraints. These are hypothetical model results, not a forecast.',2,1]
];
function showDemo() {
  const step = state.demo.step, [title,text,id,station] = demoSteps[step]; state.selectedId=id; state.station=station; render(); $('demo-guide').hidden=false;
  $('demo-guide').innerHTML=`<p class="eyebrow">DEFAULT DEMONSTRATION / ${step+1} OF 5 / HYPOTHETICAL MODEL RESULTS</p><h3>${title}</h3><p>${text}</p><button id="demo-next" class="button">${step === 4 ? 'Finish & restore configuration' : 'Next step →'}</button><button id="demo-exit" class="text-button">Exit & restore my configuration</button><span class="fine-print">Auto-advances every 12 seconds.</span>`;
  $('demo-next').onclick=nextDemo; $('demo-exit').onclick=exitDemo; clearTimeout(demoTimer); demoTimer=setTimeout(nextDemo,12000);
}
function nextDemo() { if (!state.demo) return; if(state.demo.step===4)exitDemo();else{state.demo.step++;showDemo();} }
function exitDemo() {
  clearTimeout(demoTimer);if(!state.demo)return;const saved=state.demo.saved;state.demo=null;state.assumptions=saved.assumptions;state.selectedId=saved.selectedId;state.station=saved.station;
  fillInputs();for(const[id,raw]of saved.draft)$(id).value=raw;$('demo-guide').hidden=true;$('inputs').inert=false;$('demo').disabled=false;recalculate();
}
$('demo').addEventListener('click',()=>{clearTimeout(timer);const saved={assumptions:structuredClone(state.assumptions),selectedId:state.selectedId,station:state.station,draft:allFields.map(f=>[inputId(f.key),$(inputId(f.key)).value])};state.demo={saved,step:0};state.assumptions=configuration();fillInputs();recalculate();$('inputs').inert=true;$('demo').disabled=true;showDemo();});
$('formula-content').innerHTML='<p>Throughput = minimum effective capacity. Annual capacity = throughput × hours. Sales = min(capacity, demand). Energy = sum of average kW × hours. Intensity = energy / sales, undefined at zero output. Incremental cash flow = incremental sales × (price − non-energy variable cost) − incremental electricity cost − incremental fixed OPEX. NPV discounts constant annual incremental cash flow after initial CAPEX. Payback = CAPEX / positive cash flow. Capital efficiency = NPV / CAPEX. See the full methodology for IRR, threshold and decision rules.</p>';
fillInputs();recalculate();
