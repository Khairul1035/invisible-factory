export const VERSION = '2.0.0';
export const AUTHOR = 'Mohd Khairul Ridhuan bin Mohd Fadzil';
export const defaults = Object.freeze({ hours: 2000, demand: 2000000, price: 12, variableCost: 8, electricity: .15, budget: 1000000, discount: .10, horizon: 5, target: 20, energyAllowance: 0, emissions: null });
export const strategies = Object.freeze([
  { id: 0, name: 'Do Nothing', short: 'Baseline', capex: 0, capacityB: 800, powerB: 65, fixed: 0 },
  { id: 1, name: 'Buy New Machine', short: 'New machine', capex: 850000, capacityB: 1400, powerB: 105, fixed: 25000 },
  { id: 2, name: 'Optimise Existing Machine', short: 'Optimisation', capex: 180000, capacityB: 1000, powerB: 55, fixed: 10000 },
  { id: 3, name: 'Preventive Maintenance', short: 'Maintenance', capex: 95000, capacityB: 900, powerB: 60, fixed: 15000 }
]);
export const stationNames = ['Laser Cutting', 'CNC Processing', 'Robotic Assembly', 'Automated Packaging'];
export const baselineDefaults = Object.freeze({ capacities: [1200, 800, 1100, 1000], powers: [45, 65, 40, 30] });
export function configuration() {
  return { ...defaults, baseline: structuredClone(baselineDefaults), investments: strategies.slice(1).map(s => ({ ...s })) };
}
