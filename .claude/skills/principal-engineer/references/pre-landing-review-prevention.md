# Pre-Landing Gate Matrix

`playbook-landing-proof.md` owns the terminal procedure and READY/NOT READY/BLOCKED status.
Use this file only to select evidence for surfaces actually touched by the planned and final
diff. Do not load or satisfy unrelated rows. For a repository-wide gap scan (not a specific
diff), draw read-only predicates from `audit-scan-checklists.md` and report hits as candidates.

## Required Gates

| Touched surface | Required gate | Evidence to collect |
| --- | --- | --- |
| Public API, route, RPC, event, webhook, SDK | Contract compatibility | Old/new shape, status/error/auth, generated consumers/docs, mixed-version behavior |
| Auth, permissions, tenant/user/object access | Security denial path | Authorization location, object-level denial, escalation/role-mutation evidence |
| User/external/LLM/tool/file input | Trust boundary | Validation/normalization, size/type/path bounds, injection/SSRF/traversal rejection |
| SQL, ORM writes, counters, status changes | Data integrity/race | Constraint/transaction, idempotency/retry, check-then-write, query safety |
| Enum, status, mode, permission, constant | Consumer completeness | All switches, filters, serializers, UI, docs, persistence, tests |
| Migration, schema, index, backfill | Release/rollback | Mixed old/new compatibility, lock/backfill/index plan, rollback/forward-fix |
| Query, list endpoint, resolver, serializer | Performance/scale | Bounds/pagination, N+1, index/cardinality, batch size, async blocking |
| Background job, queue, retry, integration | Runtime failure | Timeout, retry bounds, idempotency, DLQ/repair, partial failure, telemetry |
| Frontend state, rendering, bundle, fetch flow | Client correctness/performance | Waterfalls, render stability, heavy imports, split/lazy behavior as relevant |
| Refactor or legacy change | Behavior preservation | Characterization/differential proof, contract stability, scoped diff |
| New abstraction/interface/inheritance/shared helper | Abstraction fitness | Real variation/consumers, lower caller cost, substitutability/behavior proof |
| Parser, serializer, binary/file format, native/unsafe/FFI | Format/memory boundary | Size/unit/range/overflow, encoding/version, malformed cases, ownership/ABI |
| Resource, lock, transaction, subscription, async task | Lifetime/exit | Normal/error/cancel/timeout cleanup, ownership, no hidden held resource/work |
| Build system, generator, compiler/analyzer/toolchain | Reproducibility/input closure | Clean build, declared inputs, deterministic/semantic output, fail-closed errors |
| Package, image, binary, release artifact | Artifact identity/promotion | Source/toolchain/dependency link, digest/provenance/symbols, rollback artifact |
| Backup, restore, failover, recovery | Recovery proof | Restore/drill, RPO/RTO, replay/reconciliation, stale-writer fencing |
| Architecture/performance/reliability model | Model validity | Decision/threshold, scope/workload, sources/ranges, holdout, sensitivity/error |
| Time/date/duration/expiry | Temporal semantics | Clock type, zone/DST, precision/unit/range, monotonic deadline, boundaries |
| Third-party dependency/framework/default | Dependency behavior | Graph/version/defaults, pools/timeouts/retries, provenance, compatibility/exit |

## Fail Conditions

- A failed or missing triggered gate is NOT READY; fix, revert, or narrow the change.
- Manual inspection or another model's opinion cannot replace objective security, data,
  contract, concurrency, migration, recovery, provider, or running-system evidence.
- Do not hide a small in-scope error path, negative test, or compatibility update as follow-up.
- BLOCKED requires an exact unavailable environment, access, or authoritative decision plus
  the command or evidence that resumes work.

## Noise Controls

- Select gates from the actual behavior and diff; a private local change does not trigger every row.
- Do not add abstractions, docs, indexes, tests, compatibility paths, or telemetry merely to
  fill the matrix. Add only evidence able to falsify the touched behavior.
- Formatting, preference, and harmless duplication do not outrank correctness, security,
  data, contracts, runtime failure, or release safety.
- Attack only the highest-risk triggered case: invalid/unknown input, duplicate/concurrent
  work, timeout/cancel, partial success, mixed version, resource exhaustion, cleanup failure,
  or restore/reconciliation.
