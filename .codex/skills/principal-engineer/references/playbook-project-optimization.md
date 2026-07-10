# Playbook: Project Audit And Fix

Use for open-ended "audit and improve / optimize / clean up this project" requests. The
primary result is a proved repository improvement, not an exhaustive health report.

## Required Audit Card

```text
Requested outcome and exclusions:
Repository/local mutation authorization:
External/production authorization:
Baseline command and existing failures:
Relevant path and highest-risk boundary:
```

Keep the card in working memory unless the user requested a durable audit artifact.

## Procedure

1. **Freeze safety and baseline**
   - Read repository instructions, worktree status, generated/vendor ownership, and the real
     build/test/generation commands. Inspect commands with uncertain external effects.
   - Run the cheapest representative baseline and distinguish existing failures from user work.

2. **Trace only enough project shape to choose probes**
   - Use `playbook-project-understanding.md` in subordinate mode: map the relevant entry,
     owner/source of truth, effects, test protection, dependency/runtime boundary, and release path.
   - Select two evidence probes from actual repository signals: one on the highest-risk or
     highest-value path, and one on the clearest change-friction, failure, or evidence gap.
   - A probe is a caller/contract trace, focused static search, test/build comparison, history
     check, reproduction, query/trace, or other falsifiable repository-native check.
   - Domain sections in `audit-scan-checklists.md` supply ready-made read-only probe predicates.

3. **Promote one causal finding**
   - A lead becomes actionable only after proving entry/trigger, first wrong state or structural
     obstacle, observable impact/change cost, authoritative owner, and current defense.
   - Verify duplicate/unused/equivalent premises directly. Reject smells, metric scores, pattern
     preferences, speculative scale, and text matches without a causal mechanism.
   - Classify B/S/M, risk of fixing, rollback, and required landing gates before editing.
   - Choose the highest-value safe repository-local finding. Do not build a backlog first.

4. **Execute through one subordinate playbook**
   - P2 for behavior, P3 for structure/legacy, P4 for runtime cause, or P5 for a high-cost
     decision/migration. Pass the proved finding and selected gates, not the whole scan.
   - The subordinate returns `PROVED`, `CHANGED`, or `BLOCKED` with commands, diff, rollback,
     and stop condition. It never enters P6 or completes P1.
   - If no safe local action exists, record the exact disproved leads or unavailable
     decision/access/environment; do not invent a patch to satisfy the loop.

5. **Verify centrally and run P6**
   - Re-run the focused falsifier and proportional repository gate instead of trusting a
     delegate's summary.
   - For `CHANGED`, run `playbook-landing-proof.md` on the concrete diff. Fix, revert, or narrow
     NOT READY work before continuing.
   - Create a git commit only when the user explicitly requested it.

6. **Rescan once, then stop**
   - Search the touched scope and requested outcome once for the same mechanism.
   - Continue only for another proved finding required by the requested outcome. Otherwise stop
     with changed artifacts, commands, gates, rollback, and the exact stop reason.
   - Produce a ranked backlog only when requested. For an explicitly requested full scan or
     backlog, sweep the relevant sections of `audit-scan-checklists.md` and list hits as
     non-promoted candidates, separated from proved findings.

## Invalid Outcomes

- Broad inventory before a proved action.
- A checklist of possible improvements with no changed repository artifact.
- Blanket refactoring, formatter churn, or abstraction built from a smell.
- A performance claim that lowers latency by dropping, rejecting, or deferring more work.
- External/shared/production mutation without explicit authorization and a verified target.
