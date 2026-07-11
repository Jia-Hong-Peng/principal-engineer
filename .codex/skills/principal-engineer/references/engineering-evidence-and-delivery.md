# Engineering Evidence And Delivery

## Contents
- Purpose
- Engineering Evidence Chain
- Executable Outcome Contract
- Events, State, And Decision Completeness
- Boundary And Interface Contracts
- Correctness Construction
- Build, Generation, And Release Evidence
- Verification Derived From Contracts

## Purpose
- Use this reference when acceptance, state, interface meaning, parser/native/resource safety, build/generation/artifact behavior, or the path from intent to runtime evidence is the active decision.
- The current playbook owns this subtask's implementation and verification; it completes the request only when primary and otherwise returns upward. This reference supplies evidence-chain, correctness, build, generation, and artifact mechanics only.
- Produce executable facts, not a speculative ideal model. Mark every inferred rule or boundary until code, data, tests, runtime evidence, or an explicit contract confirms it.

## Engineering Evidence Chain
Keep critical behavior traceable in both directions:

| Layer | Required question | Minimum evidence | Common break |
| --- | --- | --- | --- |
| Problem | What loss is prevented or result is created? | Outcome, scope, forbidden result | Feature name with no success definition |
| Acceptance | Under what conditions is the result complete? | Examples, decision table, measurable threshold | Words such as fast, safe, correct, or robust with no test |
| Domain | Which identity, state, relation, or invariant must hold? | Invariant and state/decision model | Treating database fields as the complete rule |
| Interaction | Who needs which fact, by when, with which failure semantics? | Critical path, timeout, duplicate, partial-success path | A happy-path sequence diagram |
| Interface | What is promised, rejected, and compatible? | Input, output, error, protocol, quality contract | Method signature mistaken for the contract |
| Design | Who owns the rule, data, transaction, and failure? | Boundary, dependency, source of truth | Policy spread across controllers, UI, queries, and jobs |
| Implementation | Does code preserve the meaning? | Types, control flow, persistence, configuration | Meaning collapsed into strings, booleans, null, or ambient state |
| Verification | What evidence could falsify the implementation? | Boundary, state, contract, integration, and quality tests | Happy-path tests or coverage percentage alone |
| Runtime | Does the running system still satisfy the assumptions? | Correlated log, metric, trace, audit, reconciliation | No version, outcome, dependency, or repair signal |

Rules:
- Make one representation authoritative for each fact. Derive, generate, link, or verify every duplicate.
- Trace any artifact upward to why it exists and downward to how it is proved.
- When documents, code, tests, data, and runtime disagree, record the conflict before deciding which is wrong.
- Treat undocumented behavior as observed behavior, not automatically as a requirement.
- Treat a documented rule with no reachable implementation path as an unverified intention, not current behavior.

## Executable Outcome Contract
Write a compact outcome card before designing a meaningful behavior change:

```text
Outcome: When <trigger and conditions>, the system must <observable result>.
Preserve: <existing outputs, errors, side effects, ordering, compatibility>.
Reject: <invalid identity, input, state, duplicate, timeout, or conflict>.
Entry and owner: <path:symbol and authoritative module/data owner>.
Effects: <writes, events, calls, files, cache, audit>.
Quality: <workload, metric, percentile/threshold, window, measurement point>.
Evidence: <test, reproduction, query, trace, invariant, comparison>.
Risk boundary: <public contract, data, concurrency, security, deployment>.
```

Expand every vague requirement into six fields:

| Field | Required answer |
| --- | --- |
| Trigger | Which request, event, time, or condition starts it? |
| Preconditions | Which identity, state, data, and dependencies must hold? |
| Behavior | What must happen and what must not happen? |
| Result | Which state, data, response, event, or external fact changes? |
| Failure | When must it reject, retry, compensate, preserve state, or expose unknown outcome? |
| Acceptance | Where and under which threshold or time window is completion observed? |

Separate functional behavior from quality constraints. For a runtime quality claim, require a metric, workload and input distribution, threshold, observation window, and measurement point. Do not substitute averages for requested tail percentiles or a closed-loop load for an open-loop production workload.

Use examples to force ambiguity out. For high-risk behavior include a normal case, boundary value, missing or unknown value, invalid state, duplicate or out-of-order event, dependency timeout, and time/precision boundary where applicable.

## Events, State, And Decision Completeness
Start from observable events when CRUD language hides lifecycle behavior. Inventory:
- External requests and notifications.
- Time events, expiry, retention, and missing expected events.
- Facts that trigger follow-up work.
- Duplicate, delayed, and out-of-order delivery.
- Cancellation, correction, reversal, and replay.

Treat a command as requested work and an event as a past-tense fact. Do not publish commands disguised as events or mutable internal objects as durable facts.

When behavior depends on history or sequence, build a state-by-event table. Classify every relevant cell as:
- Transition: valid and changes state.
- Internal reaction: valid and keeps state.
- Idempotent repeat: already applied and returns the existing outcome.
- Rejection: request is understood but illegal in current state.
- Impossible: indicates defect, corrupt data, or integration violation.
- Deferred: insufficient order/information; retain with a bound, deadline, and repair path.

Do not treat an omitted cell as ignore. Verify that guards are mutually exclusive or explicitly ordered, cover expected combinations, read a consistent snapshot, and have no side effects.

Use a decision table when three or more conditions interact. Check overlapping rules, missing combinations, hidden priority, and whether an `any` condition truly cannot alter the result.

Model independent lifecycle dimensions independently. Do not replace payment, fulfillment, review, and delivery state with one combinatorial enum or an unconstrained set of booleans. Define legal combinations and the owner of cross-dimension invariants.

## Boundary And Interface Contracts
Define an interface at four levels:

1. **Syntax**: operations, parameters, result, error representation.
2. **Semantics**: preconditions, postconditions, invariants, identity, units, missing/unknown meaning.
3. **Protocol**: legal order, blocking, cancellation, transaction point, idempotency, retry, concurrency, lifecycle.
4. **Quality**: timeout, payload/cardinality bounds, latency, throughput, availability, durability, freshness.

Two implementations are substitutable only when all four levels hold. Compilation proves syntax, not semantic or operational equivalence.

For each boundary record:
- Rule and data owner.
- Source of truth and derived copies.
- Allowed readers and writers.
- Trust transition and authorization context.
- Transaction and consistency scope.
- Failure, timeout, retry, duplicate, and unknown-result semantics.
- Version, backward/forward compatibility, and retirement path.
- Runtime signals and repair mechanism.

Translate external identity, status, units, time, missing values, errors, and versions at the boundary. Preserve an explicit unknown or lossy-conversion result; never hide a failed translation behind a convenient default.

For authenticated payloads, verify integrity/MAC over the raw received bytes before normalization, and authorize against the canonical resource actually operated on.

## Correctness Construction
Use the cheapest enforceable mechanism that prevents the failure:

1. Remove the invalid option from the API or workflow.
2. Encode meaning and constraints in a type, constructor, schema, or state transition.
3. Add a database constraint, atomic claim, version check, or ownership boundary.
4. Add static analysis or an architecture fitness function for an objective recurring violation.
5. Add a focused runtime check or assertion for an internal state that should be impossible.
6. Add tests and telemetry for behavior that cannot be enforced earlier.

Make units, precision, range, overflow behavior, normalization, encoding, timezone, identity scope, and missing-value meaning explicit. Swappable primitives such as two IDs, byte/character lengths, seconds/milliseconds, or amount/rate are defect candidates; use distinct types or validate at the boundary.

Treat configuration, templates, queries, regular expressions, policies, and DSLs as programs:
- Version and validate their schema.
- Define unknown-field and default behavior.
- Bound input size, nesting, execution, memory, and output.
- Restrict interpolation, paths, commands, and capabilities.
- Test malformed, adversarial, old-version, and round-trip cases.

For parsers and native or unsafe code:
- Validate type and bounds before arithmetic, allocation, indexing, decoding, or copying.
- Check overflow in `count * element_size`, offset-plus-length, unit conversion, and signed/unsigned conversion.
- Keep the memory-safe core large and the unsafe island small, isolated, documented, fuzzed, and sanitizer-checked where supported.
- Define text comparison, normalization, case, grapheme/byte semantics, replacement policy, and encoding at every boundary.
- Test stream/protocol parsers against declared-length-greater-than-received, concatenated frames in one read, partial reads splitting a frame, and trailing leftover bytes.

For every acquired resource, enumerate normal completion, exception, cancellation, timeout, and process-recovery paths. Preserve the primary error if cleanup also fails. Do not let getters, logging, formatting, or cleanup hide I/O, blocking, mutation, or a second failure.

A CLI/pipeline tool keeps stdout data-only with diagnostics on stderr and maps success, legal rejection, input error, and internal fault to stable distinct exit codes; for an existing tool these are public contracts and changing them is a behavior change. Test empty input, missing trailing newline, invalid encoding, broken pipe, partial I/O, and termination-signal cancellation; binary payloads never pass through text decoding or shell interpolation.

## Build, Generation, And Release Evidence
Treat the toolchain as part of the product contract:
- Provide one repository-native entry for build, test, lint, generation, packaging, and release validation.
- Declare and version every input: source, dependency lock, compiler/runtime, generator, template, configuration schema, environment assumption, and external artifact.
- Require a clean checkout build. Compare clean and incremental artifacts when stale output is plausible.
- Fail closed on missing generation, partial output, stale schema, ignored tool failure, or ambiguous artifact identity.
- Baseline existing warnings and ratchet new warnings instead of globally suppressing them.
- Keep suppressions local, justified, and removable; do not suppress correctness or security findings because the fix is inconvenient.

For generated code:
- Version the source schema and generator.
- Require deterministic or semantically stable output from the same inputs.
- Separate generated and hand-written code and reject manual edits to generated output.
- Trace each generated region to its input/template.
- Run format, compile, static, contract, golden, and regression checks.
- Test empty, one, many, extreme, duplicate, cyclic, invalid, malicious, and old-version inputs.
- Use an oracle independent of the generator rule; do not generate the implementation and its only expected answer from the same faulty source.

For releases:
- Build once and promote the same immutable artifact.
- Bind artifact digest/version to source revision, lockfile, toolchain, configuration, and provenance.
- Verify startup, schema, dependencies, health, telemetry, symbol/diagnostic assets, and rollback before traffic expansion.
- Version all reconstruction inputs, including infrastructure, dashboards, alerts, migrations, and runbooks.
- Treat version control as history, not backup. Restore backups in a clean environment and verify that the service can actually operate.

## Verification Derived From Contracts
Derive evidence rather than adding tests by habit:

| Contract source | Required evidence candidates |
| --- | --- |
| Acceptance outcome | End-to-end success, rejection, and quality threshold |
| Value range/unit | Minimum, maximum, inside/outside, overflow, precision, conversion |
| Relationship | Zero/one/many, duplicate, ownership, delete, stale reference |
| Invariant | Before/after every public operation and after failure |
| State table | Every transition, rejection, repeat, impossible case, and timeout |
| Decision table | Every rule and uncovered combination |
| Operation contract | Preconditions, success, failure, idempotency, concurrency |
| Interaction | Order, timeout, partial success, retry, compensation, repair |
| Boundary | Real serialization, database, queue, filesystem, or provider behavior |
| Quality contract | Representative workload, distribution, percentile, resources, errors |
| Trust boundary | Unauthorized, cross-tenant, replay, injection, disclosure, exhaustion |

Use example, boundary, property-based, metamorphic, state-sequence, fuzz, contract, integration, fault-injection, differential, and runtime checks according to the failure mechanism. Keep random failures reproducible with the input and seed. Never use reruns to erase the first flaky failure.

Test doubles may isolate callers but do not prove the real protocol, schema, transaction, timeout, or serialization. Make the fake and real implementation pass the same contract suite where possible, and retain at least one real-boundary check.
