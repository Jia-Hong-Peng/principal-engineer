# Scan-layer capability eval (2026-07-11)

Measures the causal contribution of `references/audit-scan-checklists.md` (the 164-predicate
scan layer added in 561b887, extended in c178b89) to review-mode behavior. S10-style
incremental design: control = current skill with the scan layer removed; treatment = current
skill. The two skill trees differ **only** by the scan file plus its four mount references
(verified by `diff -rq`).

## Setup
- Scenario: **S9** (pre-landing review of `fixtures/s8-orders-monolith`, read-only, severity-ordered findings with file locations).
- Arms: control = skill minus `audit-scan-checklists.md` and its 4 mount lines; treatment = full current skill. Both loaded from disk (agents Read SKILL.md and route themselves).
- N = **2 per arm** (run-1/run-3 control, run-2/run-4 treatment). Directional, not statistical.
- Single blind judge, scored all four neutral transcripts against the S9 rubric, verifying every citation against the fixture. Leak grep clean; fixture `git status` clean after runs.
- Rubric version: S9 as defined in `evals/README.md` (t1-fk, t2-secrets, t3-coupling, t4-race, severity-ordering, no-false-positives; 0-2 each, /12), plus a non-scored **breadth** count (fixture-verified true defects beyond T1-T4).

## Result

| | t1-fk | t2-sec | t3-coup | t4-race | sev-order | no-FP | /12 | breadth | loaded scan file? |
|---|---|---|---|---|---|---|---|---|---|
| control run-1 | 1 | 2 | 1 | 2 | 2 | 2 | **10** | 23 | n/a (absent) |
| control run-3 | 0 | 2 | 1 | 2 | 2 | 2 | **9** | 23 | n/a (absent) |
| treat run-2 | 2 | 2 | 2 | 2 | 2 | 2 | **12** | 23 | **yes** |
| treat run-4 | 1 | 2 | 1 | 2 | 2 | 2 | **10** | 22 | **no** |

- control mean **9.5** /12; treatment mean **11.0** /12; **treatment − control = +1.5**.
- breadth flat (~23 both arms): on this defect-dense fixture the scan layer did **not** increase raw defect count — a competent generalist review already catches ~22-23 true defects. The whole delta lives in the **T1-FK and T3-coupling architecture framing**, not in finding more.

## The confound (reported, not hidden)

Activation was **inconsistent**. Only **1 of 2** treatment agents (run-2) actually loaded
`audit-scan-checklists.md`; run-4 routed to the gate matrix alone and never pulled it in. The
run that loaded it scored **12** (the only run to frame both the Shipment→Order FK and the
cross-module `_db.Orders` reads as split/coupling concerns — exactly the scan file's
Architecture & Coupling predicates). The treatment run that did **not** load it scored 10 —
tied with control run-1.

So the honest reading is: **"scan layer, when it activates, produced the best review; but the
review-mode pointer does not reliably trigger it."** The lift is real in mechanism (n=1 for
"scan layer loaded" → both architecture metrics maxed) but the +1.5 mean is within single-judge
noise (README notes ±1-2) at N=2 and is confounded by activation. Not conclusive.

## Actionable finding

The soft pointer in `pre-landing-review-prevention.md` ("For a repository-wide gap scan … draw
read-only predicates from `audit-scan-checklists.md`") did not force a section sweep in
review-mode framing 1/2 of the time. If review-mode should reliably use the scan predicates,
that pointer needs strengthening — but that is a behavior change requiring its own adversarial
review + before/after eval, not a silent edit. Flagged for a future pass.

## Caveats
- N=2/arm, single judge; treat as directional signal, not proof.
- The p95 discriminator (T1/T3) is exactly what a defect-dense fixture with FK+coupling planted facts rewards; a fixture without architectural traps might show no delta at all.
- breadth metric had near-zero discrimination here (ceiling); it would matter more on a sparser repo.

## Follow-up: proposed activation fix was reviewed and REJECTED (do not ship)

A fix to strengthen the review-mode -> scan-layer trigger (edit SKILL.md:53 routing rule +
imperative-ize the `pre-landing-review-prevention.md` pointer) went to three-lens adversarial
review. All three lenses refuted it; the fix was **not shipped**. Why it was killed:

- **Teaching-to-the-test (skeptic).** The proposed trigger example "find every problem before
  launch" is near-verbatim the S9 prompt ("find every problem that must be handled before going
  live"). Re-running S9 to "confirm" the fix would pass by string match, not by proving
  review-mode activation generalizes. The fail-then-pass plan was circular.
- **Over-correction (red-team).** "Sweep the relevant sections" for a whole-repo review = all
  164 predicates with no sampling control -> cost blowup and a candidate flood that drowns the
  2-3 real findings, colliding with Review Stance (SKILL.md:89, "a pattern preference without
  observable cost is not a finding"). It also contradicts the scan file's own contract
  (`audit-scan-checklists.md:7`, "sections wholesale only when the user explicitly requests a
  full scan") — whole-repo review is implicit, not an explicit full-scan request — and that
  contract does not even list review-mode as an authorized caller.
- **Premature + redundant (simplifier).** Editing an always-loaded file (SKILL.md) on n=1
  mechanism evidence within single-judge noise is unjustified. run-4 already reached the pointer
  and ignored it, so the router-level restatement (E-fix-1) is redundant; the real gap is a soft
  pointer ignored at its destination.
- **P1 bleed.** The example wording also matches P1's "find weaknesses and repair them" trigger,
  and the review+fix branch would be primed to inventory-before-action (Invalid Outcome in
  `playbook-project-optimization.md:67`).

What would actually justify a fix, in order: (1) a higher-N, second-judge confirmation that
activation is a *material* problem, measured with a task whose wording matches no embedded
example; (2) only if confirmed, a surgical change that names a specific high-value section
(e.g. Architecture & Coupling) for whole-repo review, updates `audit-scan-checklists.md:7` to
authorize review-mode as a caller, and preserves the read-only/candidate discipline — no
P1-bleeding example wording. Deferred until (1) exists. The scan layer as shipped is unchanged
and correct; this is a routing-reliability refinement, not a defect in the predicates.
