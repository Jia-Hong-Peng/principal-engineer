# Playbook: Vertical Slice Delivery

Use for a feature, bug fix, new-project capability, API/domain/data behavior, parser/build
change, or any implementation request with an observable result. Deliver working repository
change plus proof; do not return an implementation plan as the result.

## Required Work Packet

```text
Outcome: trigger -> observable success.
Preserve: outputs, errors, side effects, order, timing, compatibility.
Reject/fail: invalid, unauthorized, duplicate, conflict, timeout, cancel, unknown outcome.
Entry and owner: path:symbol plus rule/data owner.
State and effects: writes, events, calls, files, cache, audit.
Risk: public contract, data, concurrency, trust, resource, release.
Acceptance evidence: exact test, query, trace, command, or metric.
```

Keep this in working memory unless a durable design artifact is requested.

## Procedure

1. **Preflight and baseline**
   - Read repository instructions and worktree state.
   - Find the real build, test, generation, and launch commands; inspect external effects.
   - Run the cheapest relevant baseline and record exact command, exit status, existing failures, and duration when useful.
   - Exit only when unrelated user work and the current failure/baseline are distinguishable.

2. **Trace one real slice**
   - Follow entry -> parse/normalize/auth -> application/domain decision -> transaction/state -> external effects -> response/event -> telemetry.
   - Read callers, configuration, schemas, contract specs, generated consumers, tests, and failure mapping on that path.
   - Mark fact, observed behavior, documented intention, inference, and unknown separately.

3. **Build only the executable models the slice needs**
   - Ambiguous conditions: decision table.
   - Lifecycle/order: state x event table.
   - Boundary: syntax, semantic, protocol, and quality contract.
   - Data/effects: source of truth, writer, transaction, retry/idempotency, and repair.
   - Use `engineering-evidence-and-delivery.md` for these artifacts; use `enterprise-api-domain-model.md` only for triggered API/domain/persistence mechanics.

4. **Create a falsifier before broad implementation**
   - Bug: reproduce it and add or identify a check that fails without the fix.
   - Feature: encode normal, rejection, boundary, and highest-risk failure acceptance.
   - Parser/native/resource: add malformed, size/unit/range/overflow, ownership, and cleanup cases.
   - Build/generator: compare clean and incremental paths; make stale/partial output observable.
   - If no observation path exists, build the smallest probe first.
   - Draft the touched-surface manifest and select the matching rows from
     `pre-landing-review-prevention.md` before editing.

5. **Implement one complete vertical slice**
   - Change the authoritative owner, not every symptom.
   - Use the repository's established patterns and smallest adequate design.
   - Keep policy separate from transport/storage/vendor details only where a real boundary exists.
   - Bound input, work, retries, queues, resources, and external effects where the touched contract requires it.
   - Load only the active construction section from `implementation-code-quality.md`; for CI,
     secret, identity, or supply-chain mechanics, load the matching `devsecops-security-governance.md` section.

6. **Prove the slice**
   - Run focused behavior checks, then integration/contract/static/build checks required by the touched surfaces.
   - For a bug fix, confirm the new check fails on the old source when practical.
   - Verify failure, duplicate, concurrent, timeout/cancel, mixed-version, or cleanup behavior only when triggered by the slice.
   - Search for the same failure mechanism in sibling paths.

7. **Enter Landing Proof**
   - When this is the primary playbook, run `playbook-landing-proof.md` with the final diff and command evidence.
   - When invoked by another playbook, return `PROVED`, `CHANGED`, or `BLOCKED` plus artifacts, commands, diff, rollback, and stop condition to that caller instead.
   - Stop when acceptance and all triggered gates pass. Do not continue general cleanup.

## Dispatch Branches

| Condition | Dispatch |
| --- | --- |
| Existing structure blocks the slice | Run one bounded loop from `playbook-safe-existing-code-change.md`, then return |
| Public API/schema/event/storage, partition, distributed consistency, or migration decision | `playbook-technical-decision.md` |
| Runtime cause is unknown | `playbook-runtime-diagnosis.md` |
| New repository | Establish one build/test entry and one end-to-end slice; do not scaffold empty pattern layers |
| User requested only design | Produce the decision artifact, but do not claim implementation |

Never redispatch an ancestor. Return the newly discovered structural, runtime, or decision
concern and its evidence to that caller so the dispatch graph remains acyclic.

## Stop Gates

- The outcome cannot yet be distinguished as pass/fail: create a probe, do not invent acceptance.
- The next action needs an unrequested public behavior choice or unavailable production fact: name it and the re-entry condition.
- A repository-local reversible implementation remains: do it instead of stopping at advice.
