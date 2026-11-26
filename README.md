# THE INVISIBLE FACTORY

Industrial Capital Efficiency & Spatial Decision Intelligence Laboratory · **Visual release 2.1 · Analytical model 2.0.0**

> Discover the capacity you already own before investing in the capacity you think you need.

**Mohd Khairul Ridhuan bin Mohd Fadzil — Researcher & Developer**
Independent Applied Research · 2026 · AI-assisted software development.

## Launch locally

1. Open this folder in VS Code.
2. Right-click index.html → **Open with Live Server** (or select **Go Live**).
3. Use the resulting HTTP URL, typically **http://127.0.0.1:5500/index.html**. Use the actual port shown by Live Server.
4. On the same origin, open **tests.html** for the 40 preserved regression tests or **integration.html** for DOM integration tests and the additional configuration suite.

Do not open the application through file://: browser module restrictions can block initialization. The application uses HTML5, CSS3, vanilla JavaScript modules, native SVG interactions and local PNG images. No build, package installation, external CDN/API, backend, tracking or runtime dependencies are required. Relative URLs support static hosting and project subpaths. A local test server is only a development tool.

## V2.1 industrial motion layer

The original photorealistic environment remains the primary visual layer. Native SVG/Web Animations effects share its existing 1672 × 941 coordinate system and the same pan/zoom transform:

- **A — Cutting:** short, low-intensity sparks and a warm tool-contact light clipped inside the work window.
- **B — Processing:** a local spindle highlight, internal illumination and a status lamp that follows the calculated bottleneck.
- **C — Assembly:** restrained work-cell illumination and tool/status glints. The baked-in robot arm is not articulated, rotated or distorted.
- **D — Packaging:** carton motion on the exposed entrance and the short unobstructed exit tail, plus internal illumination.
- **Conveyors:** seven shaded workpieces/cartons traverse four short, perspective-aligned visible belt sections. They fade at segment boundaries; masked paths avoid opaque equipment and photographed cartons.

Playback responds to validated selected-scenario throughput relative to 800 units/h, with an upper visual speed limit of 3×. Tracks are created once and reused. Pause/Resume holds all effects; zero/nonfinite renderer throughput stops and hides activity. Invalid or pending input holds motion immediately and labels machine values as last valid. System reduced motion keeps the scene static, even if Resume is selected. Off-screen factories and hidden documents suspend animation; no JavaScript frame loop, filters or extra image requests are used.

**This is illustrative relative production flow, not a calibrated physical industrial simulation.** It does not simulate articulated kinematics, collision dynamics, work-in-progress inventory, real machine dispatch, failure timing or production telemetry. The photograph's original lights and cartons remain fixed. Motion follows effective hourly capacity rather than demand-adjusted dispatch; zero demand does not change the analytical throughput. The analytical model still requires positive capacities; a dedicated renderer fixture verifies zero-throughput safety without changing that validation.

No calculation module, analytical model, financial/energy formula, constraint or report implementation was changed. engine.js, scenarios.js and report.js retain their existing bytes and analytical version. The integration change only passes existing validity into the visual renderer. Creator attribution and the five source PNGs are preserved.

## Version 2 workflow

The desktop workspace places assumptions on the left, the image-based factory in the centre and decision intelligence on the right. At narrower widths, panels rearrange and readable machine selectors supplement the image hotspots. Tables scroll inside their containers.

All **31 numerical controls** update automatically using input/change events with a 140 ms typing debounce. Recalculate is secondary. General assumptions, eight baseline machine settings and twelve strategy settings are editable. Unchanged A/C/D stations inherit the current baseline in every investment strategy. Restore Defaults restores the entire configuration.

A single application state owns the last validated configuration, calculated alternatives, selection, revision and dossier snapshot. Input nodes remain mounted while typing. Incomplete or invalid drafts show inline errors, mark displayed results as last valid, suppress the recommendation and disable dossier generation/printing. Status distinguishes Calculating, Results up to date, Invalid input and Calculation failed.

- **CAPACITY-X:** all bottlenecks, migration, demand-sensitive station utilisation and bounded headroom. Unused station capacity is not proven financial waste.
- **CAPITAL-X / COUNTERFACTUAL-X:** compare all four strategies, cash flow, NPV, IRR, payback and NPV/CAPEX.
- **ECO-X:** absolute electricity, per-unit intensity, intensity change, optional user-factor emissions and sustainability paradoxes.
- **STRESS-X:** demand −20%, tariff +25%, margin reduced by 20% of its absolute value and discount +5 percentage points; consistent baseline recalculation and bounded demand break-even analysis.
- **VERDICT-X:** highest positive incremental NPV among investments meeting budget, capacity and absolute-energy constraints; ties resolve by lower CAPEX then strategy ID. Do Nothing remains the reference. No investment is forced.
- **Executive dossier:** latest valid assumptions, machine and strategy configuration, financial comparison, constraints, energy, sensitivities, methodology, limitations, revision, date and attribution; A4 print styling.
- **60-second demo:** five default-state steps, auto-advancing every 12 seconds, with manual Next and Exit. Custom configuration, selection and even invalid input drafts are restored on exit. All figures are labelled hypothetical.

## Visual assets

All five original PNGs in **assets/factory/** are used unchanged. The 1672 × 941 environment and its SVG interaction layer share the same coordinate system and transform. No extra machine images are stacked over the factory image. Polygons follow the depicted equipment; selected and bottleneck states, illustrative flow, zoom, button pan, pointer drag, reset and pause are available. Keyboard Enter/Space activates hotspots; reduced motion pauses flow on initialization.

The individual A/B/C/D images appear only in the inspection panel. All contain alpha, but A/B/C retain shaded backgrounds and are displayed as framed illustrations. Assets are illustrative and are not evidence of measured equipment behaviour. See **verification/assets.json** for dimensions and PNG signatures.

## Hypothetical defaults

Baseline capacities A/B/C/D: 1200 / 800 / 1100 / 1000 units/h; powers: 45 / 65 / 40 / 30 kW. Hours 2000; demand 2000000; price USD12; non-energy variable cost USD8; tariff USD0.15/kWh; budget USD1000000; discount 10%; five years; capacity target 20%; absolute energy allowance 0%; no emissions factor.

Optimisation: 1000 units/h, 340000 kWh/year and USD1593000 incremental annual cash flow. New machine: 1000 units/h, 440000 kWh/year and USD1563000 cash flow. Their initial CAPEX differs by USD670000. These large modelled returns reflect hypothetical inputs, not calibrated industry returns.

## Source map

| Files | Responsibility |
| --- | --- |
| index.html / styles.css | Workspace, responsive controls, evidence room and A4 print styles |
| app.js | Central state, validation pipeline, rendering, demo and dossier synchronization |
| scenarios.js | Attribution, version, immutable defaults and fresh configuration factory |
| engine.js | Operations, financial appraisal, constraints, stress cases and demand thresholds |
| factory.js | Asset-aligned interactions, bounded industrial motion, validity/visibility gating and view controls |
| report.js | Shared formatting and deeply isolated report snapshots |
| tests.html / tests.js | All 40 original tests; numerical expectations unchanged |
| engine-v2-tests.js | Configurable-model, bounds, ranking and snapshot tests |
| integration.html / integration.js | Actual DOM inputs and rendered-output acceptance suite |
| browser-qa.mjs | Optional package-free headless Chrome/Edge regression runner |
| motion-tests.html / motion-tests.js | Targeted native motion, masking, pause, zero and bottleneck tests |
| motion-browser-qa.mjs | Additional application motion, responsiveness and layout verification |
| verification/ | Saved browser results, asset inspection and screenshots |
| METHODOLOGY.md / VALIDATION.md | Formulas, integrity, root causes, evidence and manual checks |

## Repeat automated browser verification

Optional development tooling: **Node 20+** and installed Chrome or Edge. No npm packages are required. Run **node browser-qa.mjs** from this folder. Set **FACTORY_BROWSER** to an executable path if automatic detection does not find your browser. The runner starts an ephemeral loopback static server, creates an isolated temporary browser profile, runs the original suites and targeted motion checks under both motion preferences, performs trusted input/mouse/keyboard tests, saves evidence, and closes its browser/server. Open motion-tests.html on the same HTTP origin for the standalone motion suite. The application itself does not require Node.

Read [VALIDATION.md](./VALIDATION.md) for actual results and remaining verification limits. The test runner generates a temporary print sample under **tmp/pdfs/**; that sample is a hypothetical default dossier, not a persisted user configuration.

## Integrity and limits

Independent applied research prototype. Hypothetical industrial data. Not empirically validated. Not a certified industrial digital twin. Not a substitute for professional engineering or investment appraisal. No clients, endorsements, affiliations or scientific novelty are invented.

The financial model is pre-tax, unlevered and incremental. Exclusions include taxes, financing, working capital, terminal value, depreciation tax shields, inventory dynamics and stochastic machine failures. Effective capacities already include losses; OEE is not applied again. Fixed average power and operating hours are independent of demand. Emissions factors are optional, user-entered and unverified. Refreshing the page restores defaults; no persistent storage is used.

No commit, push, deployment or GitHub settings changes were performed. See [METHODOLOGY.md](./METHODOLOGY.md).
