# Playbook: Project Understanding

An executable procedure for building an accurate model of an unfamiliar (or half-remembered)
codebase before you change or optimize it. "Think for the project" starts here: a proposal
made without the model is a guess. Capability layer — follow the phases.

## When to use
- Before optimization, a large refactor, an architecture decision, or a cross-cutting change.
- When onboarding to a repo, or when a change keeps surprising you (a sign your model is wrong).

## Phase 1 — Skeleton (cheap, breadth-first)
Delegate a broad read-only sweep (don't read everything into the main context). Capture:
- **Entry points** — servers/handlers/pages/CLI/cron/queue consumers; what starts execution.
- **Module & ownership boundaries** — top-level dirs and their responsibilities; where each system fact (a status enum, a validation rule, a mapping) is authoritatively owned.
- **Data & state** — datastores, schemas/migrations, caches, external services; the source of truth for each entity.
- **Build / test / release paths** — how it's built, how tests run, how it ships (and how to roll back).
Output a one-screen map (dirs → responsibility, entrypoints → flow), not a file dump.

## Phase 2 — Flow & boundaries (depth on what matters)
- Trace 1–3 representative end-to-end flows (a read, a write, an auth path) through the layers.
- Mark the volatile boundaries (UI, DB, framework, transport, vendor, time, randomness) and how the core is (or isn't) protected from them.
- Note cross-cutting contracts: public APIs, DB schema, events, shared modules — the high-cost-to-change surfaces.

## Phase 3 — Risk & test topology
- **Where is behavior protected by tests, and where not?** This map decides what is safe to change and what needs characterization tests first.
- Risk surfaces: auth/trust boundaries, money/data-integrity paths, concurrency, migrations, fail-open gates, anything with no owner.
- Evidence of pain: `git log` churn hotspots, TODO/FIXME clusters, files everyone edits, recurring bug areas.

## Phase 4 — Write the model down (so it's reusable, not re-derived)
Produce a compact, durable model artifact:
- Module map + ownership, key flows, source-of-truth table, risk/test-gap list, and the open questions you could not resolve from the code.
- State assumptions and unknowns explicitly — do not present an inferred boundary as confirmed.
This artifact feeds `playbook-project-optimization.md` Phase 0 and any design decision.

## Anti-patterns
- Reading files into the main context instead of delegating the sweep and keeping the conclusion.
- Presenting a guessed architecture as fact — mark inferred vs verified.
- Modeling everything to uniform depth — go deep only on the flows and boundaries the task touches.
- Skipping the test-topology map — then "safe refactor" is wishful thinking.
