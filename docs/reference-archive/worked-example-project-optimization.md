# Worked Example: A Full Project-Optimization Pass

A real end-to-end run of `playbook-project-optimization.md` on a Cloudflare Pages + Vue 3
codebase asked to "scan the whole project, refactor and clean up, to zero." Use it to
calibrate what each phase actually produces — especially the Phase 2 ranking call and the
central re-verification the procedure demands. Numbers are from the real run. This is
historical evidence, not the current control contract: commits and deployment in that run
were explicitly requested/authorized. Never infer commit, push, deploy, or external-mutation
permission from this example; the current SKILL and playbook govern.

## Phase 1 — dimensional fan-out (3 blind read-only investigators)
Split by disjoint areas (so they could run in parallel without conflict): `functions/`,
`src/`, `shared/+scripts/`. Each returned schema'd findings. Representative output:
- `[high] src/composables/useAuth.js:8 — normalizeReturnTo is a byte-dup of shared sanitizeReturnTo → delegate to it | behavior-preserving: y | risk: low`
- `[high] AppHeader.vue (+3 tests), AppFooter.vue, useTheme.js — no production importer → delete | y | low`
- `[high] functions/api/member/{dashboard,book}/index.js — ~18 latest-record helpers copy-pasted, some drifted → extract shared module | y | med`
- `[med] getClientIp inline ×7 — but popover/ziwei variants differ → consolidate the 6 identical only | y | low`

## Phase 2 — triage: dedup, rank, classify (the load-bearing phase)
Ranking calls actually made, with the rubric:
- **Dead-code deletion → done first.** Value: cognitive load (2507 lines). Risk: low (behavior-preserving, verified by *no-caller grep + build*). Top of the list because value is real and risk is near-zero.
- **normalizeReturnTo unify → high.** It's a *security* guard (open-redirect) with drifted-risk duplication → value tier "duplication already at risk" + security. Risk low. Do early.
- **getClientIp consolidation → med, with a carve-out.** 6 copies byte-identical, but 2 (popover no-split, ziwei CF-only) *differ* → classified behavior-change for those 2, so they were LEFT. Only the 6 identical merged. (This is the rubric's "verify the premise yourself" catching drift.)
- **useApi routing (~90 sites) → deferred, not skipped.** Classified **behavior-change** (surfaces server error messages). Per taxonomy: the behavior delta is a product/UX decision → surfaced for sign-off, not silently folded into a "refactor".
- Classification result: most items behavior-preserving (execute now); a few behavior-change (split); zero genuinely-blocked.

## Phase 3 — sequence (conflict-aware)
Grouped by file-independence for parallel delegation: agent A = backend non-admin
(getClientIp + table-errors), agent B = backend admin (NO_CACHE), agent C = frontend+scripts
(formatters + constants). Disjoint file sets → ran concurrently, no conflicts. member-records
extraction was *sequenced after* the table-errors agent because both touched dashboard/book.

## Phase 4 — execute + CENTRAL re-verification (the part that catches bad work)
Each delegate self-reported "tests pass." The orchestrator re-ran the FULL gate itself
(`npx vitest run` = 2751 tests + `npm run build`) before every commit — did not trust the
self-reports. This caught real subagent judgment worth keeping:
- The member-records agent discovered the "identical" serialize\* helpers had actually
  **drifted** (an href-semantics swap) and correctly LEFT them rather than merging — exactly
  the Phase 2 "verify the premise with a real diff" rule, applied downstream.
- The getClientIp agent refused to merge the auth copies because their `''` vs `'unknown'`
  fallback would change an ipHash — a behavior change hiding inside an apparent dedup.
In that explicitly authorized run, commits were created per logical group (one concern per
commit), each message stating the verification.

## Phase 5 — loop + report the boundary
The bounded re-scan yielded only large structural items left. Final report = what changed
(dead code + ~8 consolidations + 1 race fix, all gate-green; deployment was separately
authorized and verified in that run) PLUS the ranked backlog of what was
deliberately not batch-executed and WHY:
- `useApi` routing — behavior change, needs a product/UX decision → boundary, named.
- Decompose a 2800-line core component — behavior-preserving but large; per the corrected
  rule it should be done as its own change *with characterization tests*, not reported away.
- Two drifted serialize\* helpers — flagged for product confirmation (is the href difference intended?).

## What made this a real optimization (not churn)
- Every deletion had a no-caller-grep + build behind it; every "identical" merge had a real diff.
- The orchestrator verified centrally instead of trusting delegates — which is where the two
  best decisions (leave the drifted serialize\*, leave the auth getClientIp) were preserved.
- Behavior changes were separated out and surfaced, never smuggled into a refactor commit.
- Success was measured by defect-risk reduction and single-source-of-truth, not lines removed.
