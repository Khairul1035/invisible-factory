import { defaults, strategies, baselineDefaults } from './scenarios.js';

export const inputRules = {
  hours: [1, 8760], demand: [0, 1e9], price: [0, 1e6], variableCost: [0, 1e6], electricity: [0, 1000], budget: [0, 1e12], discount: [0, 1], horizon: [1, 50], target: [0, 1000], energyAllowance: [0, 1000], emissions: [0, 100]
};
export function validate(a) {
  for (const [key, [min, max]] of Object.entries(inputRules)) {
    if (key === 'emissions' && a[key] === null) continue;
    if (typeof a[key] !== 'number' || !Number.isFinite(a[key]) || a[key] < min || a[key] > max) throw new Error(`${key}: enter a finite value between ${min} and ${max}.`);
  }
  if (!Number.isInteger(a.horizon)) throw new Error('horizon: enter a whole number of years.');
  if (a.baseline) {
    for (const [key, min, max] of [['capacities', .001, 1e7], ['powers', 0, 1e6]]) {
      if (!Array.isArray(a.baseline[key]) || a.baseline[key].length !== 4) throw new Error(`baseline.${key}: four stations required.`);
      a.baseline[key].forEach((n, i) => { if (!Number.isFinite(n) || n < min || n > max) throw new Error(`baseline.${key}.${i}: enter a value between ${min} and ${max}.`); });
    }
  }
  if (a.investments) {
    if (a.investments.length !== 3 || a.investments.some((s, i) => s.id !== i + 1)) throw new Error('investments: three ordered strategies required.');
    for (const s of a.investments) for (const [key, min, max] of [['capex', 0, 1e12], ['capacityB', .001, 1e7], ['powerB', 0, 1e6], ['fixed', 0, 1e12]]) {
      if (!Number.isFinite(s[key]) || s[key] < min || s[key] > max) throw new Error(`investment.${s.id}.${key}: enter a value between ${min} and ${max}.`);
    }
  }
  return a;
}
export function annuity(rate, years) {
  return rate === 0 ? years : -Math.expm1(-years * Math.log1p(rate)) / rate;
}
export function npv(capex, annualCash, rate, years) { return -capex + annualCash * annuity(rate, years); }
// Conventional cash flows only: one investment followed by equal annual cash flows.
export function irr(capex, annualCash, years) {
  if (capex <= 0 || annualCash <= 0) return null;
  let low = -.999999, high = 1;
  while (npv(capex, annualCash, high, years) > 0 && high < 1e12) high *= 2;
  if (npv(capex, annualCash, high, years) > 0) return null;
  for (let i = 0; i < 180; i++) {
    const mid = (low + high) / 2;
    if (npv(capex, annualCash, mid, years) > 0) low = mid; else high = mid;
  }
  return (low + high) / 2;
}
export function capacityAnalysis(capacities) {
  if (!Array.isArray(capacities) || capacities.length < 2 || capacities.some(c => !Number.isFinite(c) || c <= 0)) throw new Error('Invalid effective capacities.');
  const throughput = Math.min(...capacities);
  const bottlenecks = capacities.flatMap((c, i) => c === throughput ? [i] : []);
  const next = Math.min(...capacities.filter(c => c > throughput));
  return { throughput, bottlenecks, hidden: bottlenecks.length > 1 || !Number.isFinite(next) ? 0 : next - throughput, jointHidden: Number.isFinite(next) ? next - throughput : 0 };
}
function operating(a, s) {
  const capacities = [...(a.baseline || baselineDefaults).capacities];
  const powers = [...(a.baseline || baselineDefaults).powers];
  if (s.id !== 0) { capacities[1] = s.capacityB; powers[1] = s.powerB; }
  const capacity = capacityAnalysis(capacities);
  const annualCapacity = capacity.throughput * a.hours;
  const sales = Math.min(annualCapacity, a.demand);
  const power = powers.reduce((x, y) => x + y, 0);
  const energy = power * a.hours;
  return { ...capacity, capacities, powers, annualCapacity, sales, power, energy, intensity: sales > 0 ? energy / sales : null, revenue: sales * a.price, variableExpense: sales * a.variableCost, electricityCost: energy * a.electricity, emissions: a.emissions === null ? null : energy * a.emissions, utilisation: capacities.map(c => sales / a.hours / c) };
}
export function calculate(a, s) {
  validate(a);
  s = { ...s, ...(a.investments?.find(item => item.id === s.id) || {}) };
  if (s.id === 0) s = { ...s, capacityB: (a.baseline || baselineDefaults).capacities[1], powerB: (a.baseline || baselineDefaults).powers[1] };
  const base = operating(a, strategies[0]);
  const op = operating(a, s);
  const cash = (op.sales - base.sales) * (a.price - a.variableCost) - (op.energy - base.energy) * a.electricity - s.fixed;
  const value = npv(s.capex, cash, a.discount, a.horizon);
  const improvement = (op.throughput / base.throughput - 1) * 100;
  const energyChange = base.energy === 0 ? (op.energy === 0 ? 0 : null) : (op.energy / base.energy - 1) * 100;
  const checks = [
    { label: 'CAPEX within budget', pass: s.capex <= a.budget },
    { label: `Capacity improvement ≥ ${a.target}%`, pass: improvement + 1e-9 >= a.target },
    { label: `Absolute energy increase ≤ ${a.energyAllowance}%`, pass: op.energy - base.energy <= base.energy * a.energyAllowance / 100 + 1e-9 },
    { label: 'Positive incremental NPV', pass: value > 0 }
  ];
  const payback = s.capex > 0 && cash > 0 ? s.capex / cash : null;
  return { ...op, ...s, cash, npv: value, irr: irr(s.capex, cash, a.horizon), payback, beyondHorizon: payback !== null && payback > a.horizon, efficiency: s.capex > 0 ? value / s.capex : null, improvement, energyChange, intensityChange: op.intensity !== null && base.intensity > 0 ? (op.intensity / base.intensity - 1) * 100 : null, checks, feasible: checks.every(c => c.pass), excessB: Math.max(0, s.capacityB - op.throughput), paradox: op.intensity !== null && base.intensity !== null && op.intensity < base.intensity && op.energy > base.energy };
}
export function evaluate(a = defaults) {
  const results = strategies.map(s => calculate(a, s));
  const ranked = results.filter(r => r.feasible && r.id !== 0).sort((a, b) => b.npv - a.npv || a.capex - b.capex || a.id - b.id);
  return { results, ranked, recommendation: ranked[0] || null };
}
export function reversal(a, s) {
  validate(a);
  const baseCapacity = calculate(a, strategies[0]).annualCapacity;
  const strategyCapacity = calculate(a, s).annualCapacity;
  const maxDemand = Math.min(Math.max(baseCapacity, strategyCapacity), inputRules.demand[1]);
  const f = demand => calculate({ ...a, demand }, s).npv;
  const points = [...new Set([0, baseCapacity, strategyCapacity, maxDemand].filter(d => d <= maxDemand))].sort((a, b) => a - b);
  if (s.id === 0) return { threshold: null, maxDemand, reason: 'Baseline incremental NPV is always zero; no crossing.' };
  for (let i = 1; i < points.length; i++) {
    const lo = points[i - 1], hi = points[i], fl = f(lo), fh = f(hi);
    if (fl * fh < 0 || (fh === 0 && fl !== 0) || (fl === 0 && fh !== 0)) {
      return { threshold: lo + (hi - lo) * (-fl) / (fh - fl), maxDemand, reason: 'Piecewise-linear incremental NPV break-even demand.' };
    }
  }
  return { threshold: null, maxDemand, reason: 'No zero crossing in the feasible demand range.' };
}
export function sensitivities(a, s) {
  const margin = a.price - a.variableCost;
  const cases = [ ['Demand −20%', { demand: a.demand * .8 }], ['Electricity +25%', { electricity: a.electricity * 1.25 }], ['Contribution margin −20%', { price: a.price - Math.abs(margin) * .2 }], ['Discount rate +5 pp', { discount: a.discount + .05 }] ];
  return cases.map(([label, patch]) => {
    const scenario = { ...a, ...patch };
    try {
      const result = calculate(scenario, s), decision = evaluate(scenario);
      return { label, result, winner: decision.recommendation?.name || 'No feasible strategy', error: null };
    } catch (e) { return { label, result: null, winner: 'Outside supported input range', error: e.message }; }
  });
}
