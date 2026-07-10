# Playbook: Project Optimization

An executable procedure for open-ended "improve / optimize / refactor / clean up this
project" work. This is the capability layer: it turns "know what good looks like" into
"produce it on an unfamiliar codebase, repeatably." Follow the phases; do not freelance
a blanket refactor.

For a full worked run of this procedure on a real codebase (schema'd findings → the Phase 2
ranking calls → conflict-aware sequencing → central re-verification → reported backlog), see
`worked-example-project-optimization.md` — imitate its shape.

## When to use
- "Make this project better / cleaner / faster", "reduce tech debt", "refactor the codebase",
  "audit and fix", or any request whose scope is the project rather than one change.
- If the target is a single known change, skip this — just do it.

## Phase 0 — Model the project first
You cannot optimize what you haven't mapped. Before proposing anything, build the model
(see `playbook-project-understanding.md` if present, else at minimum):
- Entry points, module/ownership boundaries, data stores, external dependencies, build/test/release paths.
- Where behavior is protected by tests vs not (the test topology decides what is safe to change).
Do not skip this to look fast; an optimization proposed without the model is a guess.

## Phase 1 — Fan out a dimensional audit (parallel, read-only)
Optimization opportunities hide along different axes; one reading angle misses most of them.
Dispatch independent read-only investigators, one per dimension, in parallel. Each is blind
to the others — that is the point. (No parallel-subagent harness available? Run the
dimensions sequentially yourself, one focused single-dimension pass each — the value is the
per-dimension focus and the schema'd output, not the concurrency.)
Dimensions (drop any that don't apply, add repo-specific ones):
- **Duplication / single-source-of-truth violations** — same logic/validation/constant/enum copied ≥2×.
- **Dead code** — unused exports/components/modules/scripts (each claim verified by no-caller grep).
- **Coupling & module shape** — shallow wrappers, leaked boundaries, god-files, deep-module violations.
- **Correctness & concurrency** — races, stale-response overwrites, unchecked enum consumers, trust-boundary gaps.
- **Security & data** — authz/BOLA, injection, PII exposure, migration/schema drift vs code.
- **Performance** — N+1 queries, missing indexes/pagination, hot-path allocation; rank by evidence (churn × cost), not guesses.
- **Test gaps** — behavior-critical paths with no test; fail-open gates.
- **Boundary & failure safety** — parser/size/unit/overflow, unsafe/FFI ownership, resource exits, unobserved async work, timeout/duplicate/unknown outcomes.
- **Build / generation / release** — clean vs incremental drift, undeclared inputs, stale generated output, mutable artifacts, missing provenance/symbols/rollback/restore proof.
- **Runtime evidence** — offered vs completed/rejected, retry amplification, unbounded queues/pools, missing version/correlation, inability to account for slow/failing transactions.
Require each investigator to return findings in ONE format:
`[severity] file:line — trigger/mechanism → observable risk | affected contract | smallest fix | evidence required | rollback/stop | behavior-preserving? y/n/mixed | risk-of-fixing: low/med/high`
plus its top-N repository-local candidates to execute. External/shared/production changes remain proposals until the user explicitly authorizes the action and the target is verified.

## Phase 2 — Triage into a ranked, classified worklist
- **Dedup** findings across investigators (same file:line surfaced twice = one item).
- **Rank** each item by value against risk, using this rubric (not by lines removed or pattern count):
  - *Value tiers, high→low:* correctness/security/data-integrity fix › duplication that has already **drifted** (copies diverged → latent bug) › dead code removal (cognitive load) › duplication not yet drifted › cosmetic. A security or correctness fix outranks every pure cleanup.
  - *Risk tiers, low→high:* behavior-preserving + already test-covered › behavior-preserving but needs a characterization test first › behavior-change › behavior-change on an untested hot path / trust boundary.
  - Execute highest-value-lowest-risk first. An item touching an untested file carries the cost of adding a characterization test before the change — fold that into its risk.
  - *Tie-break when value and risk pull opposite ways:* prefer the lower-risk item, unless the higher-value one is a security or correctness fix — those go first regardless of risk (add the characterization test they need).
- **Classify** every item by the Scope Pressure taxonomy (SKILL.md): behavior-preserving / behavior-change / genuinely-blocked. This decides HOW each is executed, not whether.
- Verify the premise of the biggest items yourself before trusting them (a subagent may assert "identical" when copies have drifted — check with a real diff).
- Reject any item that remains only a smell, metric, keyword, or pattern preference after the proof pass. A candidate becomes a finding only when its trigger, mechanism, impact, and owner are concrete.
- For architectural or performance candidates, state the current assumption and the threshold that would justify the change. Do not rank guessed future scale above observed correctness or data risk.

## Phase 3 — Sequence execution (safety + conflict aware)
- Order: safest + highest-value first; leave large-surface behavior-change items for their own change.
- For parallel delegation, group items by **file-independence**: disjoint file sets can run concurrently; overlapping ones must be sequenced. Use worktree isolation only if parallel agents must write the same paths.
- Never let one refactor depend on another's uncommitted output without sequencing.

## Phase 4 — Execute with central verification (do NOT self-certify)
- Keep execution inside the user's requested repository scope by default. Load/fault tests, restores, alert changes, deployments, migrations, secret operations, and other external/shared/production mutations require separate explicit authorization plus a verified target and stop condition.
- Behavior-preserving items: implement + protect with the cheapest sufficient runnable check (characterization/unit tests; build + no-caller grep for deletions).
- Behavior-change items: implement the structural part; land the behavior delta separately with fail-then-pass; surface only an unrequested product/UX decision.
- After each delegated batch, the orchestrator re-runs the FULL gate itself — a delegate's "tests pass" is a claim, not evidence (verification ≠ self-verification).
- Commit per logical group with a message that states what changed + the verification.
- Preserve an evidence pack per group: baseline, target outcome/preserved behavior, finding mechanism, focused diff, commands/results, triggered pre-landing gates, and rollback/removal condition.

## Phase 5 — Loop until dry, then report the boundary
- Re-scan (or run a completeness critic: "what dimension wasn't run, what finding wasn't verified?") until a pass yields no new material findings.
- Final report = what changed + the evidence, PLUS the ranked backlog of what was deliberately NOT done and the specific decision/access each needs. Reporting a well-reasoned boundary is completing the work only for the genuinely-blocked class (SKILL.md).

## Anti-patterns (these are how project-optimization goes wrong)
- Blanket refactor with no ranking → churn and regressions with no defect-risk reduction.
- Trusting subagent self-reports → shipping a "consolidation" of copies that had drifted.
- Batching a risky large-surface change at the tail of unrelated edits → one failure taints the batch.
- Treating line-count removed or pattern count as the success metric → theater. Success = less defect risk and easier future change, measured, not asserted.
- Extracting a shared helper that only moves knowledge to callers or adds a shallow wrapper → net-negative.
- Expanding every lead into a checklist item without proving its mechanism → review noise and wasted change budget.
- Claiming a performance win from lower latency while completed work fell, rejection rose, or work moved to a queue → false improvement.
- Treating a generated artifact, backup file, or redundant replica as proof without regeneration, restore, or failure-domain evidence → untested recovery.

## Command templates (the mechanics the phases name)
Adapt paths/globs to the repo; these make the named checks concrete.
- **No-caller check before deleting** (dead-code claim must be verified, not assumed):
  `grep -rn "SymbolOrFile" <src dirs> --include='*.ext' | grep -iE "import|from|require" | grep -v __tests__` → deletion is safe only if this is empty (plus a passing build).
- **Real diff before consolidating "identical" copies** (drift is common; a subagent may assert identical):
  read both ranges and compare, e.g. `diff <(sed -n 'A,Bp' fileA) <(sed -n 'C,Dp' fileB)` — empty output = truly identical; otherwise classify the drift before merging.
- **Churn × recency hotspot** (evidence for what to optimize, Phase 1 perf/risk):
  `git log --format= --name-only --since='6 months ago' | grep -E '\.(ext)$' | sort | uniq -c | sort -rn | head -20`.
- **Central re-verification after each delegated batch** (Phase 4): run the project's own full gate yourself — e.g. `npm test && npm run build` (or the repo's equivalent) — before committing; a delegate's "tests pass" is a claim to re-check, not evidence.
- **fail-then-pass for a behavior change/bug fix:** write the test, see it pass on new code, then stash the source change and confirm the test fails on the old code, restore. Proves the test actually exercises the fix.
