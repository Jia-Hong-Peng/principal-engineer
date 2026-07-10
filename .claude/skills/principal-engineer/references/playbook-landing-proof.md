# Playbook: Landing Proof

This is the terminal procedure for every meaningful repository change. It turns "looks
done" into READY, NOT READY, or BLOCKED using the final diff and actual command evidence.

## Inputs

```text
Requested outcome and preserved behavior:
Authorization envelope:
Baseline and existing failures:
Final worktree and diff:
Touched files, contracts, data, resources, build, and runtime paths:
```

## Procedure

1. **Build the touched-surface manifest**
   - List behavior/error, public contract, trust/auth, data/transaction, concurrency/retry, resource lifetime, build/generated/artifact, migration/release, runtime/recovery surfaces actually changed.
   - Read the matching rows in `pre-landing-review-prevention.md` Required Gates. Do not load or satisfy unrelated rows.

2. **Run focused falsification**
   - New behavior: acceptance and negative/boundary cases.
   - Bug: prove the new check detects the old defect when practical.
   - Refactor: characterization/differential behavior preservation.
   - Contract/data: compatibility, real-provider, concurrency, retry/idempotency, migration/repair as triggered.
   - Resource/build: cleanup on every exit; clean/incremental reproducibility and artifact identity as triggered.

3. **Run the broader repository gate**
   - Use the project's own build, test, static, generation, and packaging commands proportional to blast radius.
   - Re-run centrally after delegated work. Record exact command, exit status, and relevant summary.

4. **Inspect final state**
   - Read the diff line by line for accidental B changes, secrets, broad suppressions, fake success, placeholders, package/lock drift, generated edits, and unrelated formatting.
   - Re-check worktree status and user changes.
   - For deletion, prove direct and dynamic reachability plus compatibility.

5. **Attack the highest-risk path**
   - Select only triggered cases: duplicate/concurrent request, invalid/unknown input, timeout/cancel, partial success, mixed version, queue/pool saturation, cleanup failure, restore/reconciliation.
   - High-risk production/data/security/public-contract claims need objective triggered evidence. A fresh-context/adversarial pass may challenge that evidence and find omitted gates; it never replaces authorization, provider behavior, migration integrity, or running-system proof.

6. **Classify the result**
   - **READY**: every triggered gate passed and acceptance is proved for this concrete diff/slice only.
   - **NOT READY**: a gate failed; fix, revert, or narrow the change, then rerun.
   - **BLOCKED**: exact unavailable decision/access/environment is named with the re-entry command or evidence required.

## Completion Record

```text
Changed artifacts:
Behavior changed and preserved:
Focused proof:
Broader commands and results:
Triggered gates and evidence:
Diff/worktree inspection:
Rollback:
Status: READY | NOT READY | BLOCKED
Stop reason or re-entry condition:
```

Do not create this as a repository document unless requested. The record belongs in the
final report; the proof belongs in code, tests, scripts, generated checks, and command output.
