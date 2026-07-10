# Eval Run - 2026-07-10 (S10: note-5.6 Before/After)

This run measures the incremental behavior of the note-5.6 integration against the
historical skill at `HEAD` before the working-tree changes. N=1 per arm and scenario.
**Directional, not statistical.**

## Method

- **Previous arm:** the historical `.claude/skills/principal-engineer/` package exported
  from `git archive HEAD` before the note-5.6 integration.
- **Updated arm:** the working-tree `.claude/skills/principal-engineer/` package with the
  note-5.6 guidance integrated. Each agent read the real package from disk and routed its
  own references; neither saw the rubric.
- **Protocol:** identical scenario and output limit for each arm, no repository mutation,
  then an independent fresh judge received neutral `X`/`Y` responses and the rubric. Arm
  identity was not disclosed.
- **Scope:** one runtime-diagnosis task and one refactor-semantics task. This is a forward
  regression probe, not evidence that every rule or all 26 source notes change behavior.

## Results

| scenario | previous | updated | delta | blind verdict |
| --- | ---: | ---: | ---: | --- |
| Runtime incident | 11/12 | 12/12 | +1 | Updated |
| Refactor semantics | 12/12 | 12/12 | 0 | Tie |
| **Total** | **23/24** | **24/24** | **+1** | No regression |

## Runtime Finding

Both arms correctly diagnosed queue saturation plus nested retry amplification, kept the
release cause unproven, reconciled `offered - completed - rejected`, rejected premature
JSON/timeout/worker changes, and required logical-throughput plus data-integrity proof.

The only scored difference was safety ownership. The previous arm proposed production
rollback/routing/retry/admission changes without first requiring explicit authorization.
The updated arm required authorization and a verified reversal for every production
mutation, separately gated load/fault tests and purge/replay, and explicitly checked that
work was not moved into an unknown or deferred path. The blind judge scored this 11/12
versus 12/12.

## Refactor Finding

Both arms hit the rubric ceiling. Each caught:

- `FirstOrDefault` to `SingleOrDefault` as a duplicate-row exception change.
- A using declaration extending disposal beyond `LogDone`, including the dispose-failure
  ordering hazard.
- Optional defaults embedded in compiled C# call sites, producing mixed old/new behavior.
- LIFO traversal reversing callback order plus cycle, bound, lazy-enumeration, and memory
  hazards.
- Only the private rename/pure extraction as a conditional structural change, with a
  split landing sequence and item-specific evidence.

The updated response used explicit B/S/M labels, but the previous response made the same
decisions and supplied equally discriminating tests. The judge scored both 12/12. This is
a ceiling result, not evidence of incremental gain and not a failure.

## Fresh-Context Corrections After The Run

An independent package audit then found and corrected five issues before finalization:

1. A broken inline relative path to the refactoring reference.
2. Missing explicit routing/ownership for distributed idempotency and versioned migration.
3. Circular wording that required final pre-landing gates before entering the canonical
   pre-landing pass.
4. A missing analysis-method selection table for simulation decisions.
5. A repository-root provenance path missing `../`.

These corrections affect routing, canonical ownership, and simulation coverage; they do
not invalidate either tested scenario's rules. Mirror alignment, alignment regression
tests, package validation, and `git diff --check` were rerun after the corrections.

## Caveats

- N=1, two synthetic scenarios, one model/harness: do not quote the +1 as a stable effect.
- Judges were label-blind, not style-blind.
- The prompts made the planted traps inspectable; repo exploration and implementation were
  not tested here.
- The previous skill was already strong, so capable-model ceiling effects are expected.
- Re-run with broader repo-backed tasks and multiple samples before making comparative
  model or capability claims.
