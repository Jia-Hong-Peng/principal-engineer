# Playbook: Technical Decision And Migration

Use for architecture or technology choices, service/data boundaries, compatibility,
distributed consistency, modeling, or migration. Eliminate bad options with evidence, then
implement the first authorized reversible slice when the user asked for change.

## Decision Card

```text
Decision sentence and scope:
Protected guarantees:
Top 1-3 quality scenarios:
Status quo and feasible alternatives:
Workload/data/version/deployment/failure context:
Hard constraints:
Evidence, unknowns, and confidence:
Reversibility class and exit cost:
Decisive assumption, invalidation signal, reversal threshold:
```

## Procedure

1. **Reconstruct facts**
   - Inspect source/dependency, runtime/deployment, data/writer, contract/consumer, trust, failure, and release/rollback facts needed by this decision.
   - Separate intended, implemented, and observed behavior.
   - For an unfamiliar repository, run `playbook-project-understanding.md` first.

2. **Make qualities executable**
   - Express each priority as source/stimulus/environment/artifact/response/measure/scope/failure action.
   - Identify data owner, transaction/consistency, compatibility direction, failure domain, and operational owner.
   - Load `architecture-system-design.md` or `enterprise-api-domain-model.md` only for the active boundary mechanics.
   - For a pipeline, secret, access, or supply-chain decision, load only the matching
     `devsecops-security-governance.md` section.

3. **Generate and eliminate alternatives**
   - Include status quo when viable and at least one materially different credible option.
   - Eliminate any option violating correctness, data, security, compatibility, locality, capacity, or rollback constraints.
   - Compare remaining options using `technical-tradeoffs-and-modeling.md` Decision Comparison Matrix; do not hide tradeoffs in one arbitrary score.

4. **Choose model or measurement**
   - Prefer a direct prototype/benchmark/contract check when representative evidence is cheap.
   - Model only if its output changes the decision and acceptable error is known.
   - Separate calibration from validation, test sensitivity, and stop when differences fall below uncertainty.

5. **Run the smallest falsifying experiment**
   - Define input/environment, baseline, success/failure threshold, side-effect isolation, rollback, and prototype removal/hardening.
   - Execute external/load/fault/deploy experiments only with explicit authorization and a verified target.
   - Select a robust non-dominated option and record what evidence would reverse it.

6. **Implement the first reversible slice when requested**
   - Prefer one vertical path, adapter/facade, contract check, fitness function, shadow/read-only comparison, or compatible expansion over a complete end state.
   - A design request may end with a decision artifact; an implementation/migration request may not end at the ADR while an authorized local slice remains.
   - Draft the slice's touched-surface manifest and select matching pre-landing rows before editing.

7. **For migration, define the state machine and implement only the current authorized slice**

   ```text
   inventory authority/readers/writers
   -> expand compatible surface
   -> support mixed versions
   -> capture snapshot/watermark/ordered changes
   -> idempotent version/CAS backfill plus tombstones
   -> value/version/delete reconciliation
   -> staged read/write cutover
   -> fence old writers/readers
   -> prove old usage zero
   -> contract and remove temporary paths
   ```

   Every state needs entry/exit evidence, stop threshold, rollback/forward-fix, repair, and temporary-component removal condition.

8. **Prove the repository slice before any external stage**
   - When P5 is primary, run `playbook-landing-proof.md` and require READY for the exact diff.
   - When P5 is subordinate, return `CHANGED` plus slice evidence. The parent runs P6 and may
     re-enter P5 with that READY record; P5 never bypasses the parent to stage work.

9. **Run authorized staged delivery only after READY**
   - Invoke `playbook-phased-delivery.md` only with the exact P6 READY slice, explicit user
     authorization, and a verified target/environment.
   - If staged work changes repository artifacts, the current primary must run P6 again.
   - When subordinate, return staged evidence to the parent; when primary, report only the
     authorized exposure proved, not a broader rollout claim.

For an explicit design-only request, output the recommendation, credible rejected option,
implementable boundaries/contracts/data flow, decisive evidence and unknowns, falsifying
experiment, reversal threshold, and rollout/rollback. Load `templates-decision-and-design.md`
only when the user requested a standalone document.

## Stop Gates

- No output or threshold can change the decision.
- Candidate differences are below evidence/model error.
- Data authority, mixed-version behavior, failure semantics, or exit path cannot be stated.
- Direct measurement has become cheaper than further modeling.
- The next migration/cutover/destructive action is external or unauthorized.
