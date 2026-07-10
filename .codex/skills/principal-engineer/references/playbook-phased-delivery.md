# Playbook: Phased Technical Delivery

## Contents
- When To Use
- Phase Rules
- Phase 0 — Inventory And Risk
- Phase 1 — Minimum Viable Landing
- Phase 2 — Engineering Quality Hardening
- Phase 3 — Governance And Automation
- Phase 4 — Scaled Rollout
- Phase 5 — Long-Term Ownership And Exit
- Reporting
- Template: Technical Landing Plan

## When To Use
- Any large technical initiative: platform migration, architecture change, new shared capability, pipeline or security-tooling overhaul, major refactor program, tech-debt campaign.
- This is an executable procedure: instantiate the phases into a written plan (Technical Landing Plan template at the end of this file), then execute phase by phase.
- Small work may collapse phases, but say which phases were collapsed and why; never silently skip Phase 0 or the rollback design.

## Phase Rules
- Every phase has explicit exit criteria; do not enter the next phase with red exit criteria — fix or formally accept the gap with an owner and a date.
- Every phase names its rollback before starting, not after failing. If a step is irreversible (data deletion, contract removal, forced upgrade), it must be flagged in Phase 0 and scheduled as late as possible.
- Prefer ratchets over cleanups: make non-compliant new work impossible before migrating old work.
- One owner per phase. A phase without an owner is not planned; it is hoped for.

## Phase 0 — Inventory And Risk
- Build ground truth with repo-native evidence: grep the call sites, list dependencies and versions, read the schemas and contracts, identify data volumes and traffic, name current owners.
- Write down: scope in/out, blast radius, irreversible steps, external dependencies (credentials, windows, approvals), success metrics, and the risk register.
- Identify decisions only a human can make and get them now, not mid-rollout.
- Exit: written scope + risk register + measurable success criteria, reviewed by the affected owners.

## Phase 1 — Minimum Viable Landing
- Ship the thinnest end-to-end slice into the real environment: one route, one service, one repo, one pipeline — behind a flag or a parallel path where possible.
- Optimize for learning: the slice must exercise the riskiest assumption first, not the easiest one.
- Rehearse rollback once for real, on this slice, while the stakes are small. For stateful slices (data migration, dual-write), design the rehearsal first — drain/dual-write reconciliation for writes that landed on the new path — or rehearse against production-shaped data in staging; a naive rollback rehearsal on live state can itself lose writes.
- Exit: slice serving real traffic or real builds, evidence collected (metrics/logs/output diff), rollback demonstrated.

## Phase 2 — Engineering Quality Hardening
- Bring the slice to the standard broad use requires: tests matched to blast radius, telemetry (see `runtime-ops-diagnostics.md` Observability), error semantics, docs a stranger can operate from.
- Fix what Phase 1 revealed before widening exposure; widening scope to escape a known defect is a rollout smell.
- Exit: quality gates green (see `pre-landing-review-prevention.md`), operational story exists (alerts, runbook, on-call owner).

## Phase 3 — Governance And Automation
- Convert policy into automation: CI checks, scaffolds, templates, lint rules, default configurations — not wiki pages that ask people to remember.
- Define ownership, audit trail, and exception process (every exception has an owner, a reason, and an expiry).
- Exit: new work is compliant by default without manual policing; exceptions are visible and time-boxed.

## Phase 4 — Scaled Rollout
- Migrate the remaining scope in batches with a visible tracker; batch by risk profile, not alphabetically.
- Ratchet first: no new instances of the old pattern (enforced by Phase 3 automation), then burn down the existing ones.
- Expect stragglers: name each with an owner and a date, or formally exclude it from scope with a reason.
- Exit: adoption metric hit; remaining exceptions listed, owned, and dated.

## Phase 5 — Long-Term Ownership And Exit
- Assign durable ownership for the new system: maintenance, upgrades, deprecation authority.
- Design the exit for the old path: freeze, deprecation announcement, removal date, and deletion. A compatibility layer without a removal date is permanent by default.
- Schedule a post-rollout review: did success metrics hold, what does the risk register look like now.
- Exit: old path deleted or formally frozen with a sunset date; new path owned; lessons written where the next initiative will find them.

## Reporting
- Report progress against phases and exit criteria, not against effort spent.
- When asked for status, lead with: current phase, exit criteria state (green/red per item), next decision needed, and top risk.

## Template: Technical Landing Plan
Copy and fill; the rules per phase are the sections above — the template holds the slots, not the rules. Fill slots with repository reality (paths, real contract names, measured numbers); a slot filled without any is not filled.

```markdown
# Landing Plan: <initiative>

- Owner / Sponsor / Date
- Success metrics: <measurable, with current baseline>

## Phase 0 — Inventory And Risk
- Ground truth collected: <call sites, dependencies, data volumes, owners — with commands/links>
- Irreversible steps: <list>
- Risk register: <top risks, likelihood × impact, mitigation, owner>
- Decisions needed before start: <numbered, decider named — a role if the person is unknown>
- Exit criteria: <...>

## Phase 1 — Minimum Viable Landing
- Slice: <the thinnest end-to-end cut and which riskiest assumption it tests>
- Isolation: <flag / parallel path / canary scope>
- Rollback rehearsal: <how and when it is exercised; stateful-slice reconciliation design if applicable>
- Exit criteria: <real-traffic evidence required>

## Phase 2 — Engineering Quality Hardening
- Gaps Phase 1 revealed: <list>
- Tests / telemetry / docs to add: <...>
- Exit criteria: <quality gates + alerts, runbook, on-call owner>

## Phase 3 — Governance And Automation
- Policy as automation: <CI checks, scaffolds, defaults to build>
- Exception process: <owner + reason + expiry per exception>
- Exit criteria: <...>

## Phase 4 — Scaled Rollout
- Batches and tracker: <...>
- Ratchet: <the check that prevents new non-compliant work>
- Exit criteria: <adoption metric; stragglers each with owner + date>

## Phase 5 — Long-Term Ownership And Exit
- New-path owner: <team>
- Old-path exit: <removal or sunset date; write "N/A — greenfield" when no old path exists>
- Post-rollout review date: <...>

## Collapsed Phases
<which phases were collapsed for this initiative and why — required section>
```

Gate: reject a plan whose phases have activities but no exit criteria, or whose existing old path has neither a removal nor a sunset date (greenfield plans state N/A explicitly).
