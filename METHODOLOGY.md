# THE INVISIBLE FACTORY — Methodology

Model 2.0.0 · 2026
Researcher & Developer: **Mohd Khairul Ridhuan bin Mohd Fadzil**
AI-assisted software development.

This application is an independent applied research prototype using hypothetical industrial scenarios. It is not an empirically validated digital twin, engineering design certification or investment advisory service.

## System boundary and inputs

A serial four-station line comprises Cutting (A), Processing (B), Assembly (C) and Packaging (D). There are no parallel routes, stocks, time-varying arrivals or changeovers. Effective capacities already account for operational losses; they are distinct from rated/theoretical capacities.

| Station | Baseline effective capacity, units/h | Average power, kW |
| --- | ---: | ---: |
| A: Cutting | 1200 | 45 |
| B: Processing | 800 | 65 |
| C: Assembly | 1100 | 40 |
| D: Packaging | 1000 | 30 |

| Strategy | CAPEX, USD | B capacity, units/h | B power, kW | Total power, kW | Incremental fixed OPEX, USD/year |
| --- | ---: | ---: | ---: | ---: | ---: |
| 0: Do Nothing | 0 | 800 | 65 | 180 | 0 |
| 1: Buy New Machine | 850000 | 1400 | 105 | 220 | 25000 |
| 2: Optimise Existing Machine | 180000 | 1000 | 55 | 170 | 10000 |
| 3: Preventive Maintenance | 95000 | 900 | 60 | 175 | 15000 |

All station capacities and powers are configurable. In each investment strategy only station B is replaced; A, C and D inherit the current baseline. All twelve strategy parameters (CAPEX, B capacity, B power and incremental fixed OPEX for three investments) are configurable. The table above records defaults. All data are hypothetical. Default annual hours H = 2000 h/year, demand D = 2000000 units/year, price p = USD 12/unit, non-energy variable cost v = USD 8/unit, tariff e = USD 0.15/kWh, budget USD 1000000, discount r = 0.10, horizon N = 5 years. Board target: at least 20% line capacity improvement and no annual absolute energy increase.

## Operations

- Throughput T = min(effective station capacities), units/h. Every station equal to T is a bottleneck.
- Annual capacity C = T × H, units/year.
- Actual annual output and sales S = min(C, D), units/year. Production equals sales; no inventory accumulates.
- Capacity improvement = (T_strategy / T_baseline − 1) × 100%. Capacity growth is distinct from demand and sales growth.
- Station utilisation = S / (H × station effective capacity). This demand-sensitive utilisation is not measured OEE.
- Hidden potential for a unique bottleneck = next limiting station capacity − T, units/h. Improving just one of multiple tied bottlenecks gives zero gain. Improving all tied bottlenecks jointly can unlock the gap to the next limiting station; that joint potential is shown separately. If all stations tie, there is no next constraint and this bounded potential is zero.
- Excess B capacity = max(0, effective B capacity − T), units/h. This is operational headroom, not a direct monetary waste estimate. The new machine has 400 units/h above line throughput under default assumptions.

## Energy and environment

Annual electricity E = sum of average station powers × H, kWh/year. Fixed average power and hours are independent of demand, including zero output; part-load and shutdown savings are not modelled.

Energy intensity I = E / S, kWh/unit sold; undefined if S = 0. Absolute energy change = (E_strategy / E_baseline − 1) × 100%. The sustainability paradox triggers when both intensities are defined, strategy intensity is strictly lower and strategy absolute electricity is strictly higher.

Optional emissions = E × user-entered factor f, kg CO₂e/year. Factor units: kg CO₂e/kWh. Blank means not calculated; zero is a valid factor. No country-specific factor is assumed or verified. No verified emissions reduction is claimed.

## Finances

All calculations are simplified, pre-tax, unlevered and incremental. Each strategy and its baseline use the same user assumptions.

- Revenue = S × p, USD/year.
- Non-energy variable cost = S × v, USD/year.
- Electricity cost = E × e, USD/year.
- Incremental annual operating cash flow F = (S_strategy − S_baseline) × (p − v) − (E_strategy − E_baseline) × e − incremental annual non-energy fixed OPEX.
- NPV = −CAPEX + sum from t = 1 to N of F / (1 + r)^t. At zero discount, NPV = −CAPEX + N × F. Implementation uses an equivalent numerically stable annuity factor.
- IRR is solved by bisection for positive initial CAPEX and positive constant annual cash inflows. Negative IRRs are permitted. Zero CAPEX or nonpositive annual cash flow gives N/A. This conventional cash-flow structure has at most one meaningful root. Rates extremely near −100% or above the numerical upper bound may be unrepresentable.
- Simple payback = CAPEX / F when both are positive; otherwise N/A. Beyond-horizon payback is flagged. Payback is undiscounted.
- Capital efficiency = incremental NPV / CAPEX, a multiple; N/A at zero CAPEX.

Excluded: terminal value, tax, depreciation tax shield, working capital, financing costs, ramp-up and changing annual cash flows. The large illustrative returns reflect the supplied hypothetical contribution margin and volume; they are not calibrated industrial returns.

## Decision rules

Qualifying investments must be within budget, meet throughput improvement target, stay within the absolute annual energy allowance and have strictly positive incremental NPV. Rank by descending incremental NPV, then lower CAPEX, then identifier. Capacity and energy percentage boundaries use a 1e−9 percentage-point numerical tolerance. The zero-NPV baseline remains a reference, not a positive-return investment.

If none qualifies, display: “No evaluated strategy satisfies all board constraints under the current assumptions.” Selected and recommended scenarios may differ; reports identify both.

Demand reversal solves the piecewise-linear NPV function between zero demand and the larger of the configured baseline and strategy annual capacity, capped at the supported demand limit of 1 billion units/year. Breakpoints outside this evaluated range are omitted. Breakpoints are baseline and strategy capacity. Beyond this range both outputs are capped and NPV is constant. A sign-changing segment yields a linearly interpolated zero. A boundary zero is reported if an adjacent segment is nonzero. The always-zero baseline has no crossing. Other no-crossing cases are explicitly identified. Break-even demand concerns NPV alone, not every board constraint.

Four independent deterministic sensitivities: demand × 0.8; tariff × 1.25; contribution margin reduced by 20% of its absolute value by lowering selling price while holding variable cost fixed; discount rate +0.05. For a negative margin the margin scenario worsens the loss. Every sensitivity recalculates baseline and all investments. Out-of-range sensitivity inputs are marked unavailable, never silently clamped. No probabilities or confidence intervals are invented.

## Input validation

Every supplied input must be finite and numeric. Hours 1–8760; demand 0–1 billion; price and non-energy cost 0–1 million USD/unit; tariff 0–1000 USD/kWh; budget 0–1 trillion USD; discount 0–100%; integer horizon 1–50 years; capacity target and energy allowance 0–1000%; optional emissions factor 0–100 kg CO₂e/kWh. These broad bounds prevent impossible or numerically extreme entries and are not economic plausibility claims. Invalid drafts retain and clearly mark the last valid results, suppress recommendations and disable report generation/printing. Valid input/change events recalculate automatically with a 140 ms typing debounce. Inputs are not recreated during calculation.

## Visual model, OEE and evidence

The supplied factory-environment.png is the primary image. Four interactive regions use its native 1672 × 941 coordinates; image and interactions share one pan/zoom transform. Individual machine PNGs appear in the inspector, never over the machines in the environment. Dashed illustrative flow indicators scale their animation duration with relative line throughput. They are qualitative steady-state flow, not validated discrete-event simulation, transient congestion or measured physical inventory. Demand does not control marker dispatch. Reduced-motion preference initially pauses flow, and pause/resume controls remain available.

OEE = Availability × Performance × Quality. OEE is explanatory only and is not multiplied into already-effective capacities. No empirical datasets, fabricated references, institutional affiliations or endorsements are used. Software verification does not establish empirical validity; see `VALIDATION.md` for actual execution status.

Researcher & Developer: **Mohd Khairul Ridhuan bin Mohd Fadzil** · 2026. AI-assisted software development.

## Version 2 implementation and edge cases

The original throughput, output, energy, contribution margin, incremental cash flow, annuity, NPV, IRR, payback and ranking formulas are preserved. There is no financial formula recalibration. Hardcoded station assumptions and reversal breakpoints were generalized to the supplied configuration. Report snapshots deeply copy nested machine and strategy settings.

Additional input bounds: four effective capacities each 0.001–10000000 units/h; average powers 0–1000000 kW; each investment CAPEX/fixed OPEX 0–1000000000000 USD; each strategy B capacity and power follow the same machine bounds. An all-zero baseline power is supported: percentage energy change is undefined when a strategy consumes positive electricity against zero baseline electricity; zero against zero gives 0%. The energy constraint is tested directly as E_strategy − E_baseline ≤ E_baseline × allowance/100, avoiding division by zero. Intensity percentage change is undefined when baseline intensity is zero or either output is zero. These undefined ratios display N/A or an explicit zero-output explanation.

The authoritative application state progresses through draft parsing, validation, configuration commit, recalculation, strategy evaluation, recommendation, visual rendering and synchronized report snapshot. Each successful configuration calculation increases a revision counter; selection changes use the same results without recalculating the core decision. The dossier identifies the revision and generation date in Asia/Kuala_Lumpur. General assumptions and configured machine/strategy values are included; displayed financial summaries are rounded for readability, while calculation uses full JavaScript Number precision.

The five-step 60-second demonstration uses a fresh default configuration and saves the user's validated settings, selection and raw draft fields. Exit/finish restores these settings and revalidates them. Edits to demo assumptions are disabled while it runs. The animation is illustrative production flow, not measured activity or a real-time digital twin.

Software tests validate implementation behaviour, not empirical performance or investment suitability. See VALIDATION.md for exact executed evidence and unverified platforms.
