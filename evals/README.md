# principal-engineer capability evals

A/B evaluation that measures whether the skill *changes agent behavior* on the
judgment traps it exists to handle — the only honest way to tell a capability skill
from inert scaffolding.

## Method
For each scenario, run two arms on the SAME task:
- **control** — a competent generalist prompt, NO skill content.
- **treatment** — the same task + the relevant SKILL.md section(s) / playbook injected.
Then a blind judge scores each transcript against the scenario's rubric (0–2 per metric).
Report treatment−control per metric, aggregated across scenarios. Small-N runs are
directional, not statistical; report N and keep it honest.

## Metrics (0 = fails, 1 = partial, 2 = correct)
- **boundary** — correctly classifies open-ended scope (batch-safe vs behavior-change vs genuinely-blocked) and acts per class instead of either doing everything blindly or deferring everything.
- **behavior-change detection** — spots that a "refactor" alters observable behavior and splits/surfaces it.
- **over-refactor restraint** — declines abstraction with no trigger (shallow wrapper, unneeded flexibility).
- **premise verification** — verifies "identical/unused" claims (diff/no-caller) before acting, rather than trusting them.
- **verification discipline** — plans real evidence (tests/build/fail-then-pass, central re-check) not "should work".

## Scenarios

### S1 — "do everything to zero" (boundary)
Task: "Refactor and clean up this whole project, do everything until nothing is left."
Backlog handed to the agent: (a) delete 3 grep-verified-unused files; (b) route 90 fetch
calls through a wrapper that changes user-facing error strings; (c) decompose a 2800-line
core component; (d) apply a pending prod DB migration needing a maintenance window.
Correct: (a) do it (behavior-preserving); (b) do the structural part, surface the error-wording
change; (c) do it with characterization tests (size is not a reason to defer); (d) genuinely-blocked
→ report (needs the window). Fail modes: does all 4 blindly incl (d); or defers (b)+(c) as "too risky".
Treatment injects: SKILL.md "Scope Pressure & Completion Boundaries".

### S2 — the hidden behavior change (behavior-change detection)
Task: "Refactor these 6 handlers to use a shared getClientIp helper." 4 copies are identical
(`... || 'unknown'`); 2 use `'' ` fallback and feed `x ? hash(x) : null`.
Correct: consolidate the 4; LEAVE the 2 (merging changes null→hash('unknown')); name the drift.
Fail: merge all 6, silently changing behavior.
Treatment injects: SKILL.md behavior-change gate + Verification Rules.

### S3 — over-refactor bait (over-refactor restraint)
Task: "Clean up: this 429 error response object appears in 3 handlers, DRY it up."
Correct: recognize a 3-line identical literal → extracting a shared 'error-response builder'
is a shallow wrapper that adds a name without reducing caller knowledge; leave it (or note the
cost). Fail: build a shallow wrapper / over-abstract.
Treatment injects: SKILL.md Design Heuristics (reject shallow wrappers) + Tradeoff Rules.

### S4 — drifted "identical" duplication (premise verification)
Task: "These two serialize functions in dashboard.js and book.js are identical — extract a
shared one." They are NOT identical (one returns extra fields + an href with different semantics).
Correct: diff them, find the drift, do NOT merge (or parameterize preserving both); report.
Fail: assume identical, merge, change one site's output.
Treatment injects: playbook-project-optimization Phase 2 ("verify the premise yourself") + command templates.

### S7 — structured-response-contract (design brief) — added 2026-07-10
Task: consulting-style ask with no repo: extract an order service from an ASP.NET Core
monolith (EF Core + SQL Server) AND upgrade CI to SAST/SCA + Key Vault, under real org
constraints (5 devs, zero downtime, exec one-pager due next week).
Correct: a decision-ready brief — conclusion first; credible REJECTED alternatives with
trigger-condition reasoning; phased landing with per-phase exit criteria and rollback;
assumptions declared and unknowns routed to role-named deciders (no invented stakeholders
or numbers); scan/secret governance with substance (baseline/new-findings gating,
suppression governance, overlap-window secret migration).
Fail modes: best-practice prose; tool namedropping; no rejected options; invented org
facts; a plan with activities but no exit criteria.
Treatment: the REAL installed skill — the agent Reads SKILL.md from disk and routes to
references itself (closer to production loading than text injection).
Rubric (0–2 each): decision-structure, rejected-alternatives, phased-landing,
grounded-honesty, security-governance-depth.
decision-structure HARDENED 2026-07-10 (the original "sections present" reading ceilinged
in all four cells of the N=5 run): 2 now requires conclusion-first AND a design section an
engineer could start implementing from — named boundaries, concrete contracts/data moves,
sequencing tied to the stated constraints; well-labeled sections with generic content = 1;
best-practice prose = 0. Scores across rubric versions are not comparable — label runs
with the rubric version.

### S8 — repo-backed grounding (execution) — added 2026-07-10
Task: the S7 consulting ask, but against a REAL fixture repo the agent must inspect:
`fixtures/s8-orders-monolith/` (small ASP.NET Core monolith with planted, grep-discoverable
facts). Ground truth and rubric live OUTSIDE the fixture in
`fixtures/s8-orders-monolith-GROUND-TRUTH.md` — agents under test must never see it, and
the fixture must not be "fixed" (changes invalidate recorded runs).
Planted facts: a Shipment→Order FK that blocks naive schema separation; secrets in two
locations (appsettings + CI yaml); two cross-module `DbSet<Order>` call sites; a
check-then-insert uniqueness race.
Rubric (0–2 each, /12): grounding (citations verified against the repo), t1-fk,
t2-secrets, t3-coupling, t4-race, plan-specificity. Judges verify claims by reading the
fixture, which makes scoring largely objective.

### S9 — review-mode gate activation (execution) — added 2026-07-10
Task: pre-landing code review over the S8 fixture, review explicitly in scope: "find every
problem that must be handled before going live, severity-ordered, with file locations and
fix directions." Exists because S8 showed the gate matrix does NOT self-activate during
design consulting (the planted race was missed 6/8); S9 measures whether it activates when
review is the task.
Rubric (0–2 each, /12): t1-fk, t2-secrets, t3-coupling, t4-race (same ground truth as S8),
severity-ordering (findings first, must-fix vs style separated), no-false-positives
(judge verifies cited locations; fabricated finding or path = 0).

## Running
Spawn control and treatment agents per scenario (see run notes); collect transcripts;
judge blind against the rubric; tabulate treatment−control. Re-run with higher N before
treating any delta as conclusive.
