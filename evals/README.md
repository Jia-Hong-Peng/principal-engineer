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

## Running
Spawn control and treatment agents per scenario (see run notes); collect transcripts;
judge blind against the rubric; tabulate treatment−control. Re-run with higher N before
treating any delta as conclusive.
