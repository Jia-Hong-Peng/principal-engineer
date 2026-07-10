# Playbook: Project Understanding

An executable procedure for building an accurate model of an unfamiliar (or half-remembered)
codebase before you change or optimize it. "Think for the project" starts here: a proposal
made without the model is a guess. Capability layer — follow the phases.

## When to use
- Before optimization, a large refactor, an architecture decision, or a cross-cutting change.
- When onboarding to a repo, or when a change keeps surprising you (a sign your model is wrong).
- For explicit onboarding, run the full breadth below. When P1/P5 invokes this playbook,
  restrict every phase to the caller's decision path, trace one success plus the highest-risk
  failure/boundary, and return the compact model internally instead of producing a broad report.

## Phase 1 — Skeleton (cheap, breadth-first)
For explicit onboarding, delegate a broad read-only sweep when useful. Capture:
- **Safety baseline** — worktree/user changes, repository instructions, generated/vendor areas, commands and their external side effects, current version/config/schema, existing failures.
- **Entry points** — servers/handlers/pages/CLI/cron/queue consumers; what starts execution.
- **Module & ownership boundaries** — top-level dirs and their responsibilities; where each system fact (a status enum, a validation rule, a mapping) is authoritatively owned.
- **Data & state** — datastores, schemas/migrations, caches, external services; the source of truth for each entity.
- **Build / test / release paths** — how it's built, how tests run, how it ships (and how to roll back).
Output a one-screen map (dirs → responsibility, entrypoints → flow), not a file dump.

## Phase 2 — Flow & boundaries (depth on what matters)
- Trace three representative end-to-end flows when applicable: the primary success path, a high-impact rejection/timeout/failure path, and a path crossing data/process/tenant/external boundaries.
- Mark the volatile boundaries (UI, DB, framework, transport, vendor, time, randomness) and how the core is (or isn't) protected from them.
- Note cross-cutting contracts: public APIs, DB schema, events, shared modules — the high-cost-to-change surfaces.
- For each flow reach the observable result: identity/auth, input normalization, policy, state transition, transaction, persistence, event/external effect, response, failure handling, telemetry, and tests.
- Mark facts as verified by code/config/schema/test/runtime/history or inferred. A clean architecture diagram is not evidence that the running path follows it.
- When requirements or lifecycle are ambiguous, instantiate the outcome card, state-event table, and four-level interface contract from `engineering-evidence-and-delivery.md` instead of guessing.

## Phase 3 — Risk & test topology
- **Where is behavior protected by tests, and where not?** This map decides what is safe to change and what needs characterization tests first.
- Risk surfaces: auth/trust boundaries, money/data-integrity paths, concurrency, migrations, fail-open gates, anything with no owner.
- Evidence of pain: `git log` churn hotspots, TODO/FIXME clusters, files everyone edits, recurring bug areas.
- Runtime/release gaps: unknown artifact/config/schema identity, unbounded queues/pools/payloads, retry amplification, hidden data writers, no rollback/restore/reconciliation, and telemetry unable to account for a transaction.
- Coupling evidence: shared knowledge/lifecycle, strength across distance, co-change volatility, workflow communication/consistency/coordination, and whether alleged services truly deploy/fail/recover independently.

## Phase 4 — Preserve the model without polluting the repository
Keep a compact model in working memory and the final response. Update a durable repository
artifact only when the user requested it or an established architecture/operations artifact
naturally owns the information:
- Safety/baseline record, module + ownership map, key success/failure/cross-boundary flows, source-of-truth/write-owner table, public/integration contracts, runtime/release path, risk/test-gap list, and open questions unresolved from evidence.
- State assumptions and unknowns explicitly — do not present an inferred boundary as confirmed.
- Keep an evidence link for every non-obvious claim and record which change invalidates the model. Do not duplicate schemas or generated lists that can be linked or regenerated.
This model feeds `playbook-project-optimization.md` probe selection and technical decisions; its value
is the execution state, not a new Markdown file.

## Anti-patterns
- Reading files into the main context instead of delegating the sweep and keeping the conclusion.
- Presenting a guessed architecture as fact — mark inferred vs verified.
- Modeling everything to uniform depth — go deep only on the flows and boundaries the task touches.
- Skipping the test-topology map — then "safe refactor" is wishful thinking.
- Treating undocumented behavior as automatically correct requirements, or treating unimplemented documentation as current behavior.
- Mapping only the happy path while retry, timeout, duplicate, partial success, recovery, and side effects remain unknown.
