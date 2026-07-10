# Playbook: Safe Existing-Code Change

Use for refactoring, cleanup, legacy modernization, a broad rename/move/extract, or a
behavior-preservation claim. Keep behavior evidence live while changing structure.

## Required Behavior Card

```text
Target behavior change, if any:
Preserve: result, error, effects, count, order, timing, resource lifetime, contract.
Entry, callers, and dynamic reachability:
Current evidence and existing failures:
Structural obstacle:
Allowed next transformation:
Risk boundary:
Rollback and stop condition:
```

## Procedure

1. **Classify the planned diff**
   - `B`: observable behavior changes.
   - `S`: structure changes while behavior and contracts remain stable.
   - `M`: mixed; split by default.
   - Use `refactoring-change-safety.md` only for the active transformation or language/runtime preservation hazard.

2. **Freeze a baseline**
   - Record worktree state and run the closest build/static/behavior checks.
   - Search direct callers plus DI, reflection, serialization, configuration, jobs, templates, generated code, and package/public surface.
   - Characterize unclear success, error, side-effect, order, timing, and cleanup behavior before moving it.

3. **Prove one structural obstacle**
   - State how it blocks the requested behavior through understanding cost, edit fan-out, verification, or rollback.
   - If the reason is aesthetics, a metric, a pattern, or imagined reuse, do not refactor.
   - Draft the touched-surface manifest and select the matching pre-landing rows before editing.

4. **Make one named reversible S move**
   - Choose tidy-before only when this move makes the requested B smaller or safer now.
   - Apply one rename, move, extract, inline, seam, normalization, or dependency change.
   - Do not mix formatter, package, generator, public contract, and unrelated cleanup churn.

5. **Check immediately**
   - Run the cheapest proof after every risky transformation.
   - Inspect output, exception, evaluation/call order, disposal/lock/transaction lifetime, async/cancel behavior, serialization, binary compatibility, and side effects where applicable.
   - For .NET semantic hazards, load only the matching `dotnet-enterprise.md` section.

6. **Return to the requested behavior**
   - If B is now safe, implement and prove B separately.
   - Permit another S only when it directly removes the same proven obstacle.
   - Search sibling uses of the same mechanism after the root change.

7. **Enter Landing Proof**
   - When this is the primary playbook, run `playbook-landing-proof.md` and stop when the requested outcome is proved.
   - When invoked by another playbook, return `PROVED`, `CHANGED`, or `BLOCKED` plus evidence to the caller; the caller retains completion control.

## Hard Stops

- The requested B is already small and safe.
- The next S has no direct causal link to the requested outcome.
- Two S steps failed to reduce callers, branches, coupling, or evidence cost.
- A private cleanup crosses into public API/schema/event/storage or changes data/external effects; reclassify and dispatch to `playbook-technical-decision.md`.
- Code rollback cannot reverse the data or external effect; separate that behavior change and require its own recovery plan.

## Completion Evidence

Completion requires the focused diff, actual baseline and post-change commands, behavior-preservation evidence, final diff inspection, and the exact stop reason. A B/S/M explanation without a patch is not completion when the user asked for the refactor.
