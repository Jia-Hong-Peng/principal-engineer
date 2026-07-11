# Technical Tradeoffs And Modeling

## Contents
- Purpose
- Decision Comparison Matrix
- Reversibility And Assumption Ledger
- Abstraction, Reuse, And Extension Cost
- Dependency And Framework Adoption
- Time, Data Locality, And Configuration Semantics
- Distributed Delivery And Idempotency
- Compatibility And Evolution
- Model Or Measure Gate
- Analysis Method Selection
- Architecture Model Card
- Workload, Capacity, Reliability, And Cost
- Calibration And Decision Confidence
- Alternative Search And Pareto Selection

## Purpose
- Use this reference when two or more technically plausible choices differ in correctness, coupling, compatibility, performance, failure, security, cost, or reversibility.
- Use modeling only to change a decision. Do not build a detailed simulation to produce impressive numbers when a direct experiment is cheaper or no threshold depends on the output.
- The current playbook owns this subtask's decision procedure, experiment, implemented slice, and evidence; it completes the request only when primary and otherwise returns upward. This reference supplies comparison, modeling, compatibility, and migration mechanics only.

## Decision Comparison Matrix

| Dimension | Required question |
| --- | --- |
| Correctness | Which invariant, ordering, atomicity, precision, and error meaning must hold? |
| Coupling | Which code, model, version, deployment, availability, data, and operational lifecycle become linked? |
| Complexity | Is complexity removed, or moved to callers, migration, runtime, operations, or tests? |
| Performance | Which operation, workload, percentile, resource, and baseline support the claim? |
| Compatibility | Which source, binary, semantic, wire, storage, and mixed-version consumer changes? |
| Failure | What happens on timeout, retry, duplicate, partial success, crash, rollback, and repair? |
| Security | Which input, capability, identity, dependency, and supply-chain surface is added? |
| Observability | How will operators detect correctness, degradation, and invalidated assumptions? |
| Reversibility | What is the code, data, artifact, and operational exit cost? |

Reject context-free claims such as “async scales,” “services decouple,” “libraries are faster,” or “loose schemas are flexible.” Bind every claim to workload, ownership, validation, versioning, and failure behavior.

## Reversibility And Assumption Ledger
Grade decisions by actual exit cost:
- **Low**: private function structure, internal adapter, removable flag, non-data configuration.
- **Medium**: dependency, shared library, internal contract, cache, queue/thread model.
- **High**: public API/SDK, event or storage format, partition key, data migration, distributed consistency, framework/runtime model.

High-cost decisions require a compatibility bridge, parallel or shadow evidence, staged cutover, and explicit retirement/rollback gate. Do not make them irreversible merely to save temporary adapter code.

Keep an assumption ledger for material decisions:

```text
Assumption:
Evidence and confidence:
Applicable workload/version/scope:
If false, the concrete failure is:
Detection signal:
Re-evaluation threshold:
Exit path:
```

Do not record an assumption without a way to observe it. Do not use false precision: use a bounded range and confidence when the source is estimation rather than measurement.

For an experiment define baseline, representative input, success threshold, failure threshold, observation window, side-effect isolation, rollback, and prototype removal condition. Execute load/fault/restore/deploy or any external/shared-system experiment only with explicit user authorization and a verified target. A prototype without a production-hardening or deletion gate is an accidental architecture.

## Abstraction, Reuse, And Extension Cost
Classify duplication before removing it:
- **Syntactic**: text is similar.
- **Knowledge**: the same rule must change together.
- **Incidental**: current text matches but ownership or future change differs.

Abstract only knowledge duplication with aligned semantics and change direction. Keep duplication when boundaries are still being learned, consumers need independent versions, rules may diverge, or the abstraction needs modes, flags, callbacks, and exceptions to pretend the cases are one.

Compare reuse mechanisms:

| Mechanism | Gains | Costs | Trigger |
| --- | --- | --- | --- |
| Local copies | Autonomy and independent evolution | Drift and repeated fixes | Semantics differ or are still emerging |
| Shared library | One implementation, local latency | Language/version/transitive/release coupling | Stable same-language logic with one meaning |
| Shared service | Central policy/data, cross-language access | Latency, availability, auth, capacity, operations | A real remote capability or authority boundary |
| Code generation | Consistent local artifacts | Generator/schema lifecycle and regeneration | Mechanical schema/client/mapping repetition |

Do not create a remote service for a small pure utility. Do not duplicate cryptography, identity enforcement, or security policy merely to claim autonomy.

Before adding an interface, plugin, hook, listener, callback, flag, or strategy require a real variation. Define:
- Invocation timing, count, order, and thread/executor.
- Input ownership and whether mutation is allowed.
- Sync/async, timeout, cancellation, retry, duplicate, and reentrancy.
- Failure propagation, degraded behavior, and resource limit.
- Versioning, telemetry, security capability, and removal policy.

A listener observes a completed fact; a hook influences the main result. If listener success is required for correctness, model it as a real dependency or workflow step. Never invoke untrusted extension code while holding a lock, database transaction, event loop, or irreplaceable resource without a bounded contract.

## Dependency And Framework Adoption
Treat imported code and defaults as owned runtime behavior. Before adoption or upgrade inspect:
- Concrete problem and why the existing simpler option fails.
- Blocking/async/thread/queue/connection/memory model.
- Timeout, retry, TLS, redirect, cache, log, serialization, and retention defaults.
- Single-node versus multi-node behavior, shared state, leader/lease/fencing assumptions.
- Direct/transitive graph, selected runtime version, diamond conflicts, and public leaked types.
- License, security history, artifact provenance/signature, release cadence, and replacement path.
- Test seams for time, transport, storage, timeout, failure, duplicate, and ordering.
- Upgrade, downgrade, artifact rollback, data compatibility, and exit cost.

Prefer a library when the application should own control flow. Recognize that a framework owns lifecycle and calls application code; adoption therefore changes startup, configuration, testing, extension, and replacement cost.

Use an adapter to translate volatile provider semantics, not to mirror every vendor type through a shallow wrapper. Make dangerous provider defaults explicit in repository configuration. Use bounded pools and queues when wrapping blocking work; moving a blocking call into a future does not make it nonblocking.

Adopt service mesh, reactive runtimes, event sourcing, CQRS, caches, or containers only when the specialized reference's trigger exists. Name the added runtime and failure surface before selecting the technique.

## Time, Data Locality, And Configuration Semantics
Model time with the type matching its meaning:
- Instant for a global point in time.
- Zoned civil time (local date/time plus a zone identifier and its rule set) for future or recurring local events affected by DST/history/rule changes.
- Offset timestamp for a resolved instant plus the offset observed or communicated at that instant; an offset alone carries no zone rules.
- Local date for calendar rules.
- Duration for elapsed monotonic time.
- Period for calendar arithmetic.

Do not equate 24 hours with the next local day. Use monotonic clocks for elapsed deadlines and wall clocks for business timestamps. Prefer half-open intervals `[start, end)`. Test ambiguous/skipped local times, leap/month/year boundaries, precision truncation, locale/zone changes, and negative or range-edge timestamps.

For large data, move computation toward data before moving data toward one process. Choose partition keys from access, join, ordering, cardinality, skew, hot-key, rebalance, and failure-radius needs. Compare maximum and tail partition size, not only the average.

Treat repartitioning as a data migration and use the versioned Expand-Migrate-Contract state machine below. Do not let an unordered backfill overwrite newer live writes or resurrect a delete.

Expose a small stable configuration surface for long-lived/public APIs. Permit a clearly named advanced escape hatch only when its compatibility limits are explicit. Version and validate configuration, define unknown-field behavior, bound dangerous values, store secret references instead of secret material, and deprecate through dual support plus usage evidence.

Load configuration into an immutable validated snapshot and publish it atomically with a visible version. A failed reload must leave the last known-good snapshot intact; readers must not observe a partially updated mix. Test concurrent reads, invalid input, provider outage, rollback, and whether a setting change requires restart or supports live rebinding.

## Distributed Delivery And Idempotency
A timeout means the outcome may be unknown. It does not prove that a remote side effect did not happen.

Define idempotency within an explicit public horizon: repeated submission of the same logical operation during that horizon produces the same observable result as one submission. Require:
- A stable key generated by the caller and reused across retries.
- Scope by tenant/operation and a request fingerprint.
- A declared horizon covering the maximum retry, replay, unknown-outcome, and reconciliation window; prohibit key reuse inside it.
- Durable state/result through that horizon. After expiry, retain a tombstone/business-operation identity or reject/query status; never execute a late key blindly as new work.
- An atomic claim; `check then act` across workers is not atomic.
- A distinction between operation ID and trace/request attempt ID.

When claim and state change share a database, use a unique insert/compare-and-set and domain write in one transaction. For an external side effect, persist state plus an outbox command, claim with lease and fencing, invoke the provider with the same idempotency key when supported, and retain pending/in-flight/completed/failed state.

If the external system cannot provide an idempotent effect, accept and bound duplicates, create reconciliation/compensation, or change the business protocol. Do not claim exactly-once across an unmanaged external effect.

Broker semantics do not equal end-to-end semantics:
- At-most-once may lose work.
- At-least-once requires an idempotent consumer.
- Exactly-once is meaningful only inside the named transaction boundary.

For a consumer define acknowledgement point, batch partial-failure rule, partition/order scope, replay start, retention, poison/DLQ repair, catch-up capacity, and downstream effect safety. A DLQ without search, alert, correction, replay, retention, and sensitive-data control is deferred loss, not recovery.

## Compatibility And Evolution
Always write compatibility direction explicitly: `producer/version A -> consumer/version B`.

For libraries verify:
- Source compatibility.
- Binary/link compatibility.
- Semantic compatibility: result, ordering, errors, side effects, lifecycle.
- Performance/capacity compatibility.
- Dependency-graph and runtime-resolution compatibility.

For APIs and durable data include status/error meaning, auth, pagination/order, size/rate limits, defaults, unknown fields/enums, removed identifiers, old stored data, in-flight messages, and round-trip through real translators. New fields and validation changes can be breaking even when types compile.

Use Expand-Migrate-Contract:
1. **Inventory/authority**: name the canonical source, all readers/writers, value/version/delete semantics, and irreversible operations.
2. **Expand**: add compatible fields/tables/APIs and mixed-version support without changing authority.
3. **Capture order**: establish a snapshot or high-watermark plus CDC/change log so every live write and tombstone after the snapshot has an ordered version.
4. **Backfill**: process resumable idempotent batches; apply only when the source version is newer (CAS/conditional write), propagate deletes/tombstones, and quarantine conflicts instead of overwriting.
5. **Dual support**: keep one authoritative writer. If temporary dual write is unavoidable, use one operation/version identity and explicit partial-failure reconciliation rather than two independent truths.
6. **Validate**: reconcile value/version/tombstone equality and gaps, not only counts/checksums; run shadow/differential reads and contract/mixed-version tests.
7. **Cut over**: use explicit read/write states, staged exposure, stop/rollback thresholds, and observable lag/conflict/error signals. Pin version selection per request/cohort/data-version boundary so one unit of work runs a single implementation end-to-end, and keep rollout routing sticky per entity to prevent interleaved writes.
8. **Fence and contract**: fence old writers/readers before destructive removal. Default retirement requires zero active old usage; any approved nonzero forced sunset must name affected consumers, stable rejection/migration behavior, and accepted loss. Require explicit authorization and a verified target for the irreversible operation.

For unknown enum or schema values, choose and test preserve/forward, explicit unknown, reject, or quarantine behavior. Never silently coerce a new meaning into an existing value.

## Model Or Measure Gate
Build a model when alternatives are expensive to deploy, production scale cannot be reproduced, future peak/failure/topology must be evaluated, or capacity/reliability/cost must be compared before implementation.

Prefer direct implementation, benchmark, or load test when the system is small and reversible, the decision is local, a representative experiment is cheap, or the dominant platform behavior is too complex to model credibly.

Stop before detailed modeling unless all are known:
- Decision and alternatives.
- Output that changes the decision.
- Needed precision: trend, ranking, capacity bound, or absolute value.
- Acceptable model error.
- Applicable workload, version, configuration, and deployment.
- Excluded factors and consequence if the model is wrong.
- Why direct measurement is not cheaper or more credible.

Stop modeling when it can eliminate an option, remaining differences are below model error, additional detail no longer changes the next action, or a higher-fidelity experiment becomes cheaper.

## Analysis Method Selection
Choose the lowest-fidelity method that can answer the decision, then name its blind spot and higher-fidelity validation:

| Decision shape | Start with | Principal blind spot | Validate or escalate with |
| --- | --- | --- | --- |
| Few linear variables or early option screening | Order-of-magnitude estimate or spreadsheet | Queues, distributions, and state interaction | Benchmark or operational-law check |
| Simple steady-state capacity | Operational laws or queue approximation | Scheduling, distributions, and transient state are simplified | Discrete-event simulation or load test near the boundary |
| Tail latency, branching, pools, locks, or fork/join | Discrete-event simulation | Statistical design and semantic fidelity determine the result | Prototype/load test plus independent holdout traces |
| Bursts, autoscaling, failover, rebalance, or recovery | Transient simulation | Calibration and transition rules are difficult | Failure drill or time-aligned production replay |
| GC, scheduling, I/O, runtime, or virtualization behavior | Executable prototype or production-like load test | Higher build cost and environmental drift | Same-version telemetry, profiling, or controlled canary |
| Existing running system and existing design | Trace, profile, traffic replay, or side-effect-isolated shadow | Observes current design; replay/shadow can repeat effects | Versioned experiment or prototype of the alternative |
| Hard real-time or safety upper bound | Worst-case or schedulability analysis | Strong assumptions and specialized models | Target-platform measurement and independent bound review |

Before choosing, decide whether the question is steady-state or transient; mean or tail/multimodal/extreme; and whether queues, pools, locks, fork/join, adaptive control, or finite resources materially affect it. Confirm the tool implements the required semantics and can solve the model at useful fidelity. More solver features do not compensate for wrong inputs or abstractions.

## Architecture Model Card
Capture:

```yaml
decision:
status_quo:
alternatives:
quality_contract:
  operation:
  population_and_workload:
  metric_and_percentile:
  threshold_and_window:
  error_condition:
system_scope:
source_artifact_and_config_versions:
known_evidence:
unknowns_and_ranges:
hard_constraints:
acceptable_model_error:
calibration_data:
validation_data:
invalidation_conditions:
```

Include six mutually checked views: structure, behavior/critical path, workload, deployment, resources, and decisions/assumptions. Every runtime component needs a deployment; every external call needs a route; every acquire needs a release; every resource demand needs a resource; modeled retry/cache/timeout behavior must exist in code or configuration.

Do not make model granularity finer than available evidence. Keep a subsystem black-boxed when candidates do not change it and measured input/output quality is sufficient. Increase detail only near a capacity bound, candidate-dependent behavior, data-size sensitivity, shared pool/lock/queue, or decision-sensitive uncertainty.

## Workload, Capacity, Reliability, And Cost
Do not model average requests per second alone. Include:
- Open-loop arrival or closed-loop users/think time.
- Burst, seasonality, correlation, and retry amplification.
- Scenario mix, payload/cardinality distribution, hot keys, cache hit/miss, success/failure classes.
- Fan-out, loops, background effects, and serialization/data movement.
- Steady state separately from warm-up, failover, deploy, rebalance, and catch-up transients.

Use `effective work = arrival rate * fan-out * retry multiplier * loop count * background effects` as an order-of-magnitude prompt, not a precise guarantee.

Map active resources (CPU, memory, disk, network, provider) and passive resources (pool, lock, semaphore, buffer, queue, lease). For each finite resource capture capacity, acquire/enqueue rate, service/hold time, wait distribution, depth, rejection/timeout, and work performed while held.

Use operational laws only when assumptions hold. For a stable, consistently bounded system, Little's Law `L = lambda * W` is a conservation check. Do not mix offered and completed rate when rejection or loss occurs. A serial resource near offered utilization 1 is a warning, not a complete multi-core prediction.

Reliability evidence requires an exposure denominator. Distinguish fault, internal error state, external failure, availability, reliability over an interval, failure on demand, and durability. Never infer a numeric failure probability from coverage, complexity, bug count, or warning count.

Model common-cause failure: same code/input, database, queue, region, network, control plane, credential, configuration, artifact, and load. Redundant replicas are not independent when these assumptions are shared.

Compare cost at the same quality threshold. Include fixed/idle resources, runtime and request cost, storage/retention, data transfer, redundancy/headroom, telemetry, backup/restore, failover, and license. Prefer cost per successful transaction under the same p99/error constraint over raw monthly spend.

## Calibration And Decision Confidence
Keep calibration, verification, and validation distinct:
- Calibration estimates parameters from evidence.
- Verification checks that the model/solver implements intended semantics.
- Validation compares predictions with independent real observations in the claimed scope.

Prefer evidence in this order: same-version production telemetry, production-like load test, executable prototype, comparable existing system, specification/capacity derivation, bounded expert estimate.

Separate calibration and validation data. Compare signed/absolute/relative error, percentile error, bottleneck location, candidate ordering, and threshold classification. For simulation-based models, iterate calibration on resources with prediction error above ~20%; accept the model into ongoing monitoring only when validation shows mean absolute utilization error under 2 percentage points and the top decile under 5. A model can rank options while missing absolute values; say exactly what it is fit to decide.

For simulation-based models, when runtime inputs fall outside the calibrated distribution, model-driven automation must not fire — report unknown and fall back to a conservative heuristic or human escalation instead of extrapolating.

Do not calibrate resource demand from response times in any load region with queueing — response time includes queue wait; derive demand from utilization/throughput or isolated service-time measurement.

Run sensitivity analysis across evidence-based parameter ranges. Spend new measurement effort on high-sensitivity, low-confidence inputs. If small plausible changes reverse the winner, do not present a single confident choice; either improve evidence or choose the robust/reversible candidate.

For stochastic simulation, save inputs and seeds, define warm-up and steady/transient scope, run independent replications, report uncertainty intervals, and use a stopping rule tied to engineering tolerance. One short run or one maximum sample is not evidence of a tail guarantee.

## Alternative Search And Pareto Selection
Generate a mutually distinct, context-feasible design set: direct/local, merge, split, sync, async, replicate, delegate, cache, batch, or maintain status quo as appropriate. Do not list the same topology under different product names.

Eliminate candidates violating hard contract, data, security, locality, capacity, or rollback constraints before scoring. Avoid collapsing every objective into one arbitrary weighted score. Retain non-dominated candidates, then choose from the Pareto front using:
- Knee point and material gain.
- Robustness across uncertainty and worst credible case.
- Reversibility and migration evidence.
- Added failure surface not represented by the model.

Automated search can exploit model blind spots. Preserve the search space, constraints, model version, inputs, seed, and rejected-invalid rate; validate representative finalists with a higher-fidelity experiment.
