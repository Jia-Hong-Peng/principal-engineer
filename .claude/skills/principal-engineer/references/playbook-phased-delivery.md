# Playbook: Authorized Staged Delivery

Use only inside P5 after the decision, protected guarantees, falsifying experiment,
compatibility direction, first reversible slice, and rollback/forward-fix are explicit.
This playbook stages an already-defined change; it never authorizes rollout by itself.

## Entry Gate

Before any external stage, P5 must have:
- A P6 READY record from the current primary for the exact repository diff; any later repository
  change invalidates this entry evidence and must be proved again.
- Current source/artifact/config/schema identity and authoritative data writers/readers.
- Mixed-version contract, failure/retry/idempotency behavior, reconciliation, and recovery.
- Focused plus broader repository checks for the first reversible slice.
- Cohort, success/red thresholds, observation window, rollback/forward-fix, and temporary-path
  removal condition.

A missing or failed gate returns to P5 for a repository-local fix, revert, or narrower slice.
If P5 is subordinate, its parent must run P6 and explicitly re-enter P5 with the READY record.
It cannot be waived by prose, owner, date, or risk acceptance.

## Stage 1 - Smallest Authorized Cohort

Run only with explicit user authorization and a verified target/environment.

1. Reconfirm target identity, active writers/consumers, backup/recovery state, and pre-change evidence.
2. Expose the smallest representative cohort while the old path remains authoritative or recoverable.
3. Observe correctness, completed/rejected work, errors, data drift, saturation, and repair signals
   through the predefined window. Change one causal variable where practical.
4. On a red threshold, stop and execute the proved rollback/forward-fix. Do not continue by waiver.

Exit: actual cohort evidence and an explicit expand, hold, or revert decision returned to P5.
Do not infer full-rollout completion.

## Stage 2 - Bounded Expansion

- Expand only after the prior cohort satisfies every triggered gate and reconciliation is current.
- Reconfirm capacity, retry amplification, queue/backfill lag, mixed-version consumers, and the
  same stop thresholds at each material step.
- Keep artifact identity, exposure state, operator action, and rollback point observable.

Exit: evidence for the authorized exposure only. Any new failure domain returns to P5 as a
new decision/probe, not an automatic expansion.

## Stage 3 - Cutover And Removal

Run destructive cutover/removal only with explicit authorization and proved recovery.

- Prove new authority, consumer migration, reconciliation, and stale-writer fencing.
- Default to zero old usage. Any forced nonzero sunset must name affected consumers, stable
  rejection/migration behavior, repair, and explicitly accepted loss.
- Remove old writers/routes/code/flags/adapters/schemas/access and comparison infrastructure
  only after each removal gate passes; verify the running system and recovery afterward.

Exit: no ambiguous dual authority or unowned compatibility path. Return repository and
running-system evidence to P5. If staged work changed repository artifacts, the current
primary must run P6 again before those changes are READY.

## Return Contract

Return only to P5: `PROVED`, `CHANGED`, or `BLOCKED` plus target/authorization, commands,
results, failed gates if any, rollback, and stop condition. This subordinate playbook never
enters P6 or completes the outer request.
