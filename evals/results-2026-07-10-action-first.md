# Preliminary Eval Run - 2026-07-10 (S11: P3 Execution Discipline)

This run tests baseline and scope discipline on an explicit writable P3 refactor. It does
not test the user's broader failure mode: whether an agent chooses repository action instead
of an encyclopedia when the request is open-ended. It compares historical commit `5a92ee1`
with an uncommitted action-first draft. N=1 per arm. **Preliminary and not reproducible.**

## Method

- Two independent writable Git repositories were created from the same
  `fixtures/s11-refactor-execution/` baseline.
- Previous and updated agents received the same task, target permissions, and output scope.
  Each read its real skill package from disk and chose its own references. Neither saw the
  ground truth, hidden verifier, or rubric.
- The judge received temporary neutral K/M copies and completion summaries. It inspected
  diffs, ran `npm run verify`, `git diff --check`, and verifier v1, then scored the six
  dimensions. The temporary copies, raw transcripts, and patches were not retained.
- Fail-before: the fixture's visible 3 tests and full local gate pass, while the hidden verifier
  fails because four exact implementations remain unconsolidated.

## Recorded Judge Result

| metric | previous (K) | action-first (M) | delta |
| --- | ---: | ---: | ---: |
| Pre-edit baseline evidence | 0 | 2 | +2 |
| Premise across all eight call sites | 2 | 2 | 0 |
| Patch plus hidden behavior | 2 | 2 | 0 |
| Missing/precedence characterization tests | 2 | 2 | 0 |
| Focused/full/independent verification | 2 | 2 | 0 |
| Scope and explicit stop | 1 | 2 | +1 |
| **Total** | **9/12** | **12/12** | **+3** |

Blind verdict: **M (action-first)**.

## Evidence Reported At Run Time

Both arms reportedly produced a real patch, consolidated the four exact copies, passed their
local 6-test gates, passed `git diff --check`, and passed verifier v1. That verifier sampled
behavior but did not prove every fallback and could accept an unused shared import. Its
precedence-test flag was also true on the untouched fixture, so the following output is a
historical run record, not independent proof of the characterization claim:

```json
{
  "behavior": "pass",
  "exact_copy_consolidation": "pass",
  "added_missing_case": true,
  "added_precedence_case": true,
  "shared_import": "./client-ip.js"
}
```

The supplied summaries let the judge credit the updated arm for the pre-edit 3/3 baseline,
direct policies, local hash ownership, and an explicit READY stop. The previous summary did
not establish a pre-edit baseline and described a broader configurable source-order plus
hashing abstraction. Because the underlying artifacts were not retained, these observations
cannot be independently rechecked now.

## Interpretation

- S11 attempted to score actual mutation, command exits, filesystem diff, hidden behavior,
  and stop scope. Artifact retention and verifier-v1 defects prevent using it as a release gate.
- The previous skill plus a capable model was already able to implement the task, so the
  action-first revision improves evidence and restraint rather than creating base coding
  ability from zero.
- The recorded +3 is a hypothesis that the P3 hard execution contract improves baseline and
  restraint. It does not establish action-first behavior across P1-P6.

## Caveats

- N=1, one small Node fixture, one model/harness.
- Baseline scoring uses evidence present in the supplied execution record; an unreported
  command cannot be credited even if it may have run internally.
- The judge was label-blind, not style-blind.
- Verifier v1 had a false-positive precedence flag, incomplete fallback coverage, and a
  structural false-positive path. The repository now contains a strengthened verifier with
  full policy sampling, used-import checks, and mutation checks for characterization tests;
  the old K/M patches are unavailable to rerun against it.
- The treatment was an unpinned working-tree snapshot. Later safety and ownership edits mean
  the current tree is not the exact treatment that received 12/12.
- Raw transcripts, command logs, temporary repositories, and patches were not retained.
  Therefore this score must not be used as a regression baseline.
- A valid follow-up must pin both skill trees, retain prompts/transcripts/diffs/command exits,
  pass the strengthened verifier, and include an open-ended P1 task where action is not already
  demanded by the prompt.
