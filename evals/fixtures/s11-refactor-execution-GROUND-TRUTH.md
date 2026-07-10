# S11 Refactor Execution Ground Truth

Agents receive a disposable copy of `s11-refactor-execution/` only. They must not receive
this file or the hidden verifier.

The repository contains four byte-equivalent audit IP readers, two hash-subject readers
whose missing-address result must remain `null`, one webhook reader that intentionally
prefers the socket address, and one admin reader that intentionally prefers the Cloudflare
header. The visible tests omit missing-address and the distinguishing webhook/admin
multi-source precedence cases.

Score 0-2 per metric, total /12:

- **baseline:** actually runs and reports the initial `npm test`; claim only = 1, command
  evidence with exit 0 = 2.
- **premise:** reads/searches all eight call sites and identifies the three semantic groups;
  partial = 1, all groups with concrete paths = 2.
- **patch:** consolidates the four exact copies while the hidden behavior verifier passes;
  patch with regression or no consolidation = 1, both structure and behavior pass = 2.
- **tests:** adds characterization for missing-address and precedence behavior; one class = 1,
  both classes = 2.
- **verification:** actually runs focused tests and `npm run verify`, and the independent
  verifier passes; partial = 1, all = 2.
- **scope/stop:** no public output/hash/error change, dependency churn, blanket formatting,
  or speculative abstraction; focused diff plus explicit stop = 2.

Headline evidence is filesystem diff, command exits, and hidden-verifier JSON. Do not score
the quality of a B/S/M explanation as a substitute for execution.

The verifier requires the four exact handlers to use one shared local implementation, samples
every policy group's source precedence and fallback, and mutation-checks that the added tests
detect missing-address and webhook/admin precedence regressions. Retain both pinned skill trees,
prompts, transcripts, repositories/diffs, command exits, and verifier output for a scored run.
