# Pre-Landing Review Prevention

## Contents
- Purpose
- How To Use This Gate
- Required Gate Matrix
- Evidence Report Template
- Fail Conditions
- Noise Controls
- Tests That Prevent Findings
- Security And Trust Boundaries
- API And Contract Safety
- Data Migration Safety
- Performance And Scale
- Maintainability And Scope
- Adversarial Final Pass

## Purpose
- This file is the canonical owner of the review-prevention gate matrix. Other references may mention an individual gate in context, but defer here for the complete, authoritative list.
- Use this as a completion gate for implementation work so the code is less likely to be caught by staff-level review.
- This is not a PR review workflow. Apply it while developing and before final response, commit, or handoff.
- Scope the pass to files, contracts, schemas, tests, docs, and runtime paths touched by the change.
- Run it twice for meaningful code changes: first as a planning gate before implementation, then as an evidence gate before declaring completion.

## How To Use This Gate
- Start with touched surfaces, not a generic checklist.
- Map each touched surface to required gates in the matrix below.
- Collect evidence with repo-native tools: `rg`, schema reads, sibling test reads, static checks, focused tests, migration inspection, contract docs, logs, or runtime probes.
- If a required gate has no evidence, either fix it, add the missing verification, or report it as unverified instead of claiming review-ready.
- Keep the pass proportional: a one-line private helper change does not need the same ceremony as an API, auth, or migration change.

## Required Gate Matrix
| Touched surface | Required gate | Evidence to collect |
| --- | --- | --- |
| Public API, route, RPC, event, webhook, SDK | Contract compatibility | Old and new response shape, status/error format, auth requirements, generated docs or clients, mixed-version behavior |
| Auth, permissions, tenant/user/object access | Security denial path | Authorization check location, object-level access proof, denied test, escalation or role-mutation review |
| User/external/LLM/tool/file input | Trust boundary | Validation, normalization, size/type/path limits, injection/SSRF/path traversal rejection, no unsafe shell/eval/deserialization path |
| SQL, ORM writes, counters, status changes | Data integrity and race safety | Constraint or transaction proof, idempotency/retry behavior, check-then-write review, raw query safety |
| Enum, status, mode, plan, permission, constant | Consumer completeness | `rg` sibling values and all consumers: switches, filters, serializers, UI, docs, persistence, tests |
| Migration, schema, index, backfill | Release and rollback safety | Old-code/new-schema compatibility, new-code/old-data compatibility, rollback or roll-forward, lock/backfill/index plan |
| Query, list endpoint, resolver, serializer | Performance and scale | Pagination/bounds, N+1 review, index/cardinality review, batch size, async blocking check |
| Background job, queue, retry, integration | Runtime failure semantics | Timeout, retry bounds, idempotency, DLQ/repair path, partial failure behavior, observability |
| Frontend state, rendering, bundle, fetch flow | Client performance and correctness | No fetch waterfall, stable render references, heavy import review, route splitting/lazy media where relevant |
| Refactor or legacy change | Behavior preservation | Characterization coverage or equivalent existing tests, unchanged public contract, scoped diff |
| New abstraction, interface, inheritance, pattern, shared helper | Abstraction fitness | Real variation point, current consumers, reduced caller complexity, no unsupported methods, contract or behavior coverage |

## Evidence Report Template
Use this shape internally, and include the compact version in the final response for meaningful code changes:

```text
Review-prevention gates:
- Touched surfaces:
- Required gates:
- Evidence:
- Verification:
- Unverified or deferred:
```

Rules:
- `Evidence` must cite concrete code, test, schema, command output, doc update, or runtime signal.
- `Unverified or deferred` must be empty, justified by scope, or explicitly called out as residual risk.
- Do not mark a gate complete because the code "looks fine"; cite what proves it.

## Fail Conditions
- Do not declare landing-ready if a required auth, data integrity, migration, API contract, or trust-boundary gate is unverified.
- Do not hide missing tests behind "manual inspection" when the behavior is security-sensitive, data-loss-prone, contractual, or concurrency-sensitive.
- Do not turn out-of-scope follow-up into silent debt. Name the owner surface and why it is outside this change.
- Do not ship 80-90% implementations when a missing error path, edge case, docs update, or negative test is small and in scope.

## Noise Controls
- Do not add abstractions, tests, docs, indexes, or compatibility layers only to satisfy the checklist when the touched surface does not require them.
- Do not escalate style, formatting, harmless duplication, or local naming preference above correctness, security, data integrity, contracts, and release safety.
- Do not block a small internal change on every gate; block it only on gates triggered by the touched surfaces.
- Do not force SOLID, TDD, design patterns, or object-calisthenics rules when a direct local change is clearer, safer, and easier to verify.

## Tests That Prevent Findings
- Add negative-path tests for validation failures, unauthorized access, denied permissions, rejected input, downstream errors, and try/catch branches.
- Cover boundary values: null, empty, zero, negative, single item, max size, unicode, special characters, and concurrent access where relevant.
- Keep tests isolated from global state, clock, timezone, locale, shared database records, ordering assumptions, random seeds, real networks, and sleep-based timing.
- For security-sensitive behavior, test the denied case, malicious input, rate-limit block, CSRF/CORS behavior, webhook signature rejection, and output minimization.
- Changed public methods, handlers, jobs, utilities, and contracts need direct behavior coverage unless a stronger integration test already proves the same contract.

## Security And Trust Boundaries
- Authenticate endpoints by default and authorize object-level access explicitly; never rely only on frontend checks or "internal" callers.
- Default deny for authz and object access; role/permission mutation needs special scrutiny.
- Validate file uploads by type, size, content, storage path, and downstream processing behavior.
- Prevent injection beyond SQL: command, template, LDAP, SSRF, path traversal, header injection, XSS escape hatches, unsafe deserialization, and prompt-injection persistence.
- Secrets, tokens, API keys, credentials, PII, stack traces, SQL, and internal paths must not enter source, logs, URLs, user-visible errors, or LLM-visible context unless intentionally minimized.
- Crypto needs secure randomness, current password hashing, salted hashes, constant-time secret comparison, and no hardcoded keys or IVs.

## API And Contract Safety
- Treat response fields, types, status codes, auth requirements, pagination shape, error format, webhook payloads, SDK behavior, and docs as contracts.
- Avoid breaking changes unless there is versioning, compatibility bridge, deprecation timeline, and migration path.
- Keep error responses consistent: status, code, message, details when appropriate, trace ID, and no internals.
- Update OpenAPI/Swagger, README, examples, generated clients, and docs when endpoint behavior changes.
- Preserve older clients, mobile apps, subscribers, and mixed-version deploys unless the break is explicit and coordinated.

## Data Migration Safety
- Migrations need rollback or roll-forward semantics that do not destroy data unexpectedly.
- Before dropping, renaming, narrowing, or adding NOT NULL constraints, verify references, existing data, old code compatibility, and backfill order.
- Large-table changes need lock-duration planning: concurrent indexes where supported, batched backfills, and off-peak or phased deploys.
- New foreign keys and query predicates need index review; avoid duplicate indexes.
- Multi-phase changes must work with old code plus new schema and new code plus old data during rolling deploy.

## Performance And Scale
- Prevent N+1 queries by eager loading, batching, or DataLoader-style aggregation when loops, serializers, views, or GraphQL resolvers touch associations.
- New query predicates, ordering, joins, and foreign keys need index review against schema and expected cardinality.
- Avoid unbounded list endpoints, unpaginated queries, full nested embeddings, and large in-memory batches.
- Replace O(n^2) loops, repeated linear searches, repeated sorts/filters, and string concatenation in loops when data can grow.
- Do not block async/event-loop paths with sync I/O, sleeps, CPU-heavy work, subprocess calls, or sync database clients.
- Frontend changes need bundle-size review, deep imports where appropriate, route-level splitting for heavy paths, lazy media, stable render references, and no fetch waterfalls when requests can run in parallel.

## Maintainability And Scope
- Remove unused variables, imports, dead functions, and commented-out code unless a concrete compatibility reason is documented.
- Name thresholds, retry counts, limits, ports, URLs, and duplicated literals when they encode policy or must stay consistent.
- Update stale comments, docstrings, diagrams, TODO/FIXME markers, and docs affected by code behavior.
- Watch conditional side effects: every branch that changes state should update related records, emit required events, log honestly, and preserve invariants.
- Do not reach into another module's internals or bypass the intended service/model/application boundary.
- Reject fat interfaces, empty implementations, "not implemented" branches, hidden service locators, framework objects in core policy, and wrappers that only forward calls without hiding volatility.
- New interfaces, factories, strategies, base classes, adapters, value objects, and shared helpers need evidence they remove current risk or caller complexity (name the variation point, current consumers, hidden cost) — principle-driven churn without that evidence is a finding. Every implementation of a port or base type must preserve the caller-visible contract, error meaning, lifecycle, and invariants; unsupported operations, weakened preconditions, stronger caller obligations, or tests that pass only by accident are findings, not deferrable.
- If the change creates follow-up work that is genuinely out of scope, record it explicitly instead of hiding it as "later".

## Adversarial Final Pass
- Attack the happy path: 10x load, duplicate clicks, concurrent requests, slow database, garbage dependency responses, retries, and partial failures.
- Find silent failures: swallowed exceptions, partial completion, inconsistent state transitions, background-job failures without alerts, and logs without action.
- Break edge cases: first run with no data, max input size, null/empty values, unicode, time windows, timezone boundaries, and mixed old/new deployments.
- Challenge trust assumptions: frontend-only validation, internal unauthenticated APIs, assumed config, user-controlled file paths or URLs, and tool/LLM output treated as truth.
- If claiming something is safe, cite the code, test, schema, or runtime evidence that proves it. Otherwise mark it as unverified or fix it.
