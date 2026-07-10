# Runtime, Operations, And Diagnostics

## Contents
- Core
- Operational System Map
- Workload And Capacity Contract
- Production Failure Design
- Change, Recovery, And Reconstruction
- Measurement Experiment And Trace Contract
- Complete Time Accounting
- Data-Intensive Runtime Semantics
- Observability
- CPU Memory Disk Network
- Locks Queues Timers
- Reliability And Deployment
- Security Operations
- Operations And Incidents
- Infrastructure And Automation
- Documentation

## Core
- The current playbook owns this subtask's hypothesis order, probes, remediation, safety, and evidence; it completes the request only when primary and otherwise returns upward. Use this reference only for the active runtime or operational mechanism, then return to the playbook.
- Production quality is design quality plus operational evidence.
- Reliability must come from automation, monitoring, versioning, runbooks, rollback, rehearsed recovery, and observable systems.
- Unversioned, unmonitored, undocumented, unrecoverable systems are high-risk.
- Reduce cognitive load, manual operations, hidden dependencies, single-person knowledge, and blast radius.
- Choose infrastructure by workload, constraints, cost, operations maturity, and failure modes.
- A passing happy path is not production readiness; design failure semantics, demand limits, isolation, recovery, and diagnosis before production discovers them.
- Treat deployment, configuration, startup, migrations, one-time jobs, administrative controls, delivery tooling, and runtime state as part of the system.

## Operational System Map
Within the first evidence pass, map:

| Surface | Required facts | High-risk signal |
| --- | --- | --- |
| Entry | DNS, TLS, CDN/LB/gateway, public route | Unmanaged endpoint, expiring cert unobserved, liveness mistaken for readiness |
| Request path | Sync calls, events, caches, stores, dependencies | No timeout/cancel, layered retries, no correlation |
| Data path | Writers/readers, primary/replica, backup, retention/delete | Multiple unknown writers, restore untested, deletion unaudited |
| Runtime units | Host/VM/container/function/process/job | Unknown version, live-machine edits, unrebuildable image |
| Resource bounds | CPU, memory, disk, network, pools, queues, quotas | Unbounded or below real peak |
| Change path | Build, artifact, deploy, release, migrate, rollback | Mutable artifact, deploy=release, rollback covers code only |
| Evidence | Metrics, structured logs, traces, dashboards, alerts | Averages only, no cross-hop correlation, no action |
| Recovery | RPO/RTO, backup/restore, degraded mode, alternate dependency | RPO/RTO unmeasured, recovery shares the failed control plane |
| Identity/secrets | Human/workload identity, scope, rotation, revocation | Shared account, long-lived token, secret in source/log |

If several critical rows are unknown, first create the map, artifact identity, and minimum telemetry rather than replacing infrastructure.

Trace one real transaction from client/DNS/TLS through ingress, application, cache/queue/database/dependency to response or durable event completion. At each hop record contract, identity/auth, timeout/deadline, retry owner, concurrency/queue bound, duplicate/unknown outcome, telemetry, degraded behavior, and repair.

Map failure domains by shared region, network, DNS, identity, certificate, control plane, artifact registry, data store, queue/cache, monitoring, and access path. Multiple replicas sharing one critical dependency are not independent redundancy.

## Workload And Capacity Contract
Classify workload before selecting or resizing infrastructure:
- CPU-, memory-, storage-, network-, latency-, batch-, or burst-dominant.
- Open-loop arrivals versus closed-loop users/workers.
- Operation mix, payload/cardinality distribution, hot keys, cache outcomes, retries, and background amplification.
- Steady peak versus cold start, deploy, failover, rebalance, recovery, and catch-up transient.

Define capacity by acceptable completed output, tail latency, errors/rejections, and headroom, not resource count. For transaction services, 50% average busy can already be overload — load spikes to ~3x average within seconds; 98% busy is healthy only for batch work. Record offered, accepted, completed, rejected, and retried work separately.

For finite queues/pools use arrival rate, service rate, depth, oldest age, wait distribution, worker utilization, and downstream saturation. Queue growth means arrivals exceed departures; adding workers only helps if the next resource has capacity.

Autoscaling still needs maximum/quota/supply, signal delay, provisioning and warm-up, cold cache, scale-in data movement, cost guardrail, and overload behavior during the gap. “Scales automatically” is not a deadline guarantee.

For storage capture data growth, read/write peak, I/O size, random/sequential shape, IOPS, throughput, tail latency, transaction/consistency, retention, backup/restore, security, and deletion. `throughput ~= IOPS * average I/O size` is an order-of-magnitude check, not a device guarantee.

For network diagnose physical/link, route/NAT/ACL, transport/retransmit/window, TLS/SNI/certificate, DNS/cache/TTL, proxy/LB, and application behavior. A reachable packet does not prove an operational transaction; an application health endpoint does not prove the client path.

## Production Failure Design
- Every outbound call, resource checkout, queue consume, and blocking wait needs timeout, cancellation, retry eligibility, retry budget, fallback or degraded mode, and caller-survival behavior.
- Retries must be safe, bounded, backed off or jittered, classified by failure type, and not duplicated across layers.
- Isolate dependency and workload failures with fast failure, circuit breakers, bulkheads, separate pools, slow-work isolation, and load shedding.
- Define overload behavior with finite queues, back pressure, demand limits, capacity reserved for critical traffic, and lower-value work shedding before core functions collapse.
- Bound queues, buffers, pools, caches, log streams, background work, result sets, payloads, and in-memory collections.
- Validate external input and dependency responses before they affect state, caches, queues, derived data, or downstream systems.
- Avoid holding locks, scarce connections, or transactions across slow remote calls.
- Health checks should reflect real ability to serve; traffic must reach only ready components.
- Administrative controls and control planes need authorization, auditability, safe defaults, stop mechanisms, bounded blast radius, and recovery paths.
- Keep failure semantics explicit per operation: reject, retry, degrade, queue, compensate, reconcile, quarantine, or expose unknown result. Never convert partial completion into success.
- Reserve capacity for health, control, cancellation, recovery, and critical traffic so overload cannot remove the mechanisms needed to recover.
- Treat failure detectors as suspicion, not proof of death. Leadership/failover requires lease/quorum plus fencing/epoch to stop a stale owner from continuing writes.
- Test the same deterministic bad input against every replica. Redundancy does not protect against common code/config/data defects.

## Change, Recovery, And Reconstruction
Require six gates for an operational change:
1. Reconstruct current running state, version, config, schema, and active writers.
2. Define intended delta, blast radius, stop threshold, and success evidence.
3. Validate syntax/static policy plus behavior in an isolated representative environment.
4. Stage or canary with user/system guardrails.
5. Verify the running system, data, telemetry, and dependent flows after apply.
6. Roll back or roll forward, then remove temporary access/flags/routing.

Make environments reconstructable from versioned source, infrastructure, image, config schema, migrations, dashboards, alerts, queries, and runbooks. Put immutable artifacts in a verifiable repository with source revision, toolchain/dependencies, digest, and configuration identity.

Assign one declarative writer per resource. When drift appears, identify whether it is manual change, another controller, platform default/upgrade, autoscaler, or corrupt state/lock before forcing convergence.

Adopt brownfield automation incrementally: import/read current state, diff declared versus actual, protect destructive differences, rebuild in a non-production environment, take over one bounded resource, observe drift/side effects, then expand.

Backups require an isolated/immutable enough copy, least privilege, retention, integrity, and a real clean-environment restore. Verify schema, identity/permissions, dependencies, replay/dedup, data correctness, and ability to serve. A backup file existing is not recovery evidence.

Define RPO/RTO as measured contracts. Include detection, decision, restore/failover, replay/reconciliation, validation, and return-to-normal time. Exercise failback and stale-primary fencing, not only initial failover.

## Measurement Experiment And Trace Contract
Before collecting detailed data, state:

```text
Question and falsifiable hypotheses:
Operation/population/environment/version:
Workload and input distribution:
Baseline and comparison:
Metric/percentile/unit/window/measurement point:
Expected distinguishing evidence:
Probe overhead and sensitive-data controls:
Success, failure, and stop thresholds:
```

Use the lowest-cost evidence that can separate hypotheses: existing metrics/logs, scoped trace, profiler/counters, controlled probe, flight recorder, benchmark, then isolated/load/fault experiment.

Benchmark validity requires release-like build, representative data distributions, warm-up where relevant, used results/no dead-code elimination, setup separated from steady state, multiple samples/distribution, correctness checks, and a load generator that does not saturate or coordinate omissions.

Measure instrumentation itself: tracing off versus basic/detailed, event time, CPU/memory/cache/I/O, p50/p99 impact, dropped events, and buffer behavior. Re-measure after runtime/tool/schema changes.

For high-rate flight recording:
- Use small fixed/versioned event schemas and monotonic plus UTC correlation time.
- Bound and preallocate buffers where possible; separate producers to reduce contention.
- Choose stop/drop/wrap behavior, record generation and drop counts.
- Defer symbol/name/human-text expansion to post-processing.
- Calculate `event rate * bytes/event * duration * producers` before enabling.
- Restrict and audit collection because paths, queries, identities, network, and process activity can be sensitive.

Minimum trace fields depend on the hypothesis, but commonly include service/version/environment/instance, request/trace/span/parent, operation/stage/status/error, offered/started/completed, bytes, retry/fan-out, dependency/cache, queue, thread/CPU, and config/build version.

For RPC measure client send `T1`, server receive `T2`, server send `T3`, client receive `T4` where clocks can be calibrated. Separate client elapsed, server work, and unclassified/network/scheduling gaps; account for clock offset/drift and use kernel/socket evidence when application spans leave a gap. Compute `slop = (T4-T1) - (T3-T2) - estimated transfer time`; in-building switch hardware rarely adds over ~20 usec, so millisecond-scale slop is software delay — investigate both endpoint hosts before blaming the network.

## Complete Time Accounting
For one execution context, or for non-overlapping intervals on one request's critical path, require:

```text
elapsed ~= executing_on_cpu
        + runnable_not_scheduled
        + memory_page_wait
        + disk_io_wait
        + network_or_dependency_wait
        + lock_wait
        + timer_wait
        + queue_wait
        + unknown
```

Do not add overlapping spans, parallel branch waits, aggregate CPU across workers, and end-to-end dependency/network time as if they were mutually exclusive. For fan-out, compute the interval union and critical path; report parallel work/total CPU separately. Dependency spans may already include network and server queue/work, so decompose or label them rather than double-counting.

Do not erase `unknown`; it is the next instrumentation task. Compare the non-overlapping critical-path union to end-to-end time and investigate clock, missing proxy/client, async correlation, overlap, and measurement boundary when they do not reconcile.

Classify the slow sample:
- **Executing too much**: more on-CPU work, calls, bytes, loops, serialization, retries, or alternate path with similar per-instruction efficiency.
- **Executing slowly**: similar path/instruction count but worse IPC/frequency/cache/TLB/memory contention/throttle/neighbor interference.
- **Not executing**: runnable delay or wait on page, disk, network, dependency, lock, timer, queue, pool, or scheduler.

Align samples two ways:
- Wall-clock alignment reveals shared bursts, jobs, interference, deploys, backups, and periodic work.
- Start alignment compares stages/path/gaps across fast, medium, and slow transactions. When per-transaction samples are sparse, bucket transactions by power-of-2 elapsed time and aggregate profile samples per bucket; chase 5x/100x outliers, not variation under 2x.

For each wait collect the owner and duration:
- CPU: runnable-at to scheduled-at, per-core queue, affinity/quota/steal/throttle.
- Memory: working set, allocation, minor/major fault, reclaim, page-in/out, swap, NUMA, OOM.
- Disk: submit, queue/device start, completion, callback/wakeup; size, random/sequential, fsync/writeback.
- Network: DNS/connect/TLS/send/receive, socket queues, loss/retransmit, peer/server wakeup.
- Lock: contender, holder, wait/hold/spin/block distributions, work performed while held.
- Timer: sleep/poll/timeout/watchdog/periodic job and fixed histogram peaks.
- Queue/pool: offered/enqueued/dequeued/started/completed, depth/oldest age, partition/skew, rejection/expiry.

Fix the largest causal segment, then re-account. Confirm work was not merely moved to a background queue, another service, cache eviction, dropped requests, or a later repair path.

## Data-Intensive Runtime Semantics
- State source of truth, durability point, visibility point, downstream effects, and repair path before changing a write path.
- Treat crashes, partial writes, duplicate work, timeouts, stale reads, and unknown downstream success as normal inputs.
- Distinguish accepted, persisted, applied, visible, and durable success.
- Caches, indexes, projections, search copies, materialized views, warehouses, and denormalized fields are derived data; define staleness, lag, propagation, rebuild, and repair.
- Jobs, consumers, CDC, stream processors, and replayable batch work need duplicate, replay, ordering, retention, side-effect, and recovery safety.
- Preserve only the ordering the business logic needs, scoped by key, stream, partition, record, entity history, or stronger contract.
- Generic schema and mixed-version evolution are canonical in `technical-tradeoffs-and-modeling.md` Compatibility And Evolution; this file observes and diagnoses that compatibility at runtime.
- When weakening consistency or isolation, map each anomaly to the invariant it can break and add versioning, compare-and-set, locks, serializable isolation, reconciliation, or compensation where needed.
- Timestamps, leases, leadership, locks, majorities, and coordination services need clock, quorum, session, stale authority, and fencing assumptions.
- New enum/status/mode/type values are data contracts; trace allowlists, filters, switches, serializers, renderers, jobs, analytics, and tests before shipping. (Canonical gate matrix: `pre-landing-review-prevention.md`.)
- Time-window changes need timezone, day-boundary, partial-day, hourly-vs-daily bucket, and report cutoff review.
- Values crossing language or serialization boundaries need type normalization before hashing, signing, comparing, or using as lookup keys.

## Observability
- Metrics show trends and health; logs show event detail; traces show cross-boundary request path.
- Minimum service dashboard: up/down, request rate, error rate, latency percentiles, saturation.
- Use RED for request services: rate, errors, duration.
- Use USE for resources: utilization, saturation, errors.
- Structured logs should include timestamp, level, service, version, environment, request ID, user or actor when safe, stage, status, and error code.
- Trace context must cross sync and async boundaries.
- Alert only when action is required; remove, route, or silence unactionable noise.
- Too early aggregation loses debug detail; too late aggregation increases cost.
- Observability overhead must not become the bottleneck: budget live instrumentation under 1% CPU/memory (2-10% occasionally tolerable, 20% never — it inflates transaction latency nonlinearly); tolerate up to ~20x slowdown only in offline analysis.
- Boundary telemetry should include latency, throughput, error, saturation, retry, breaker, queue, dependency, version, configuration, health, and runtime signals.
- Avoid secrets in telemetry and avoid retry-storm log spam.
- Derived data needs observability for lag, dropped events, replay progress, rebuild progress, poison messages, and repair actions.
- Distinguish zero from no data and show dashboard data age, ingestion delay/error/drop, sample count, window, aggregation, unit, version, and environment.
- Do not average instance percentiles; merge compatible histograms/raw samples and recompute.
- Preserve error and slow exemplars under sampling. Over-aggregation can destroy the rare evidence needed for p99 diagnosis.
- A minimum operational dashboard links service -> instance/shard -> host/resource and includes offered/accepted/completed/rejected, success/error/timeout/cancel, latency distribution, in-flight/queue oldest age, pools/resources, dependency, current version/config/deploy, and telemetry completeness.

## CPU Memory Disk Network
- CPU high is not proof CPU is root cause.
- Runnable but not running means CPU wait.
- Low IPC or cache misses can mean executing slowly.
- PC sample changes can mean executing too much.
- Production paging creates long tail latency; avoid it.
- Pointer-heavy structures can waste cache lines and increase memory stalls.
- Small synchronous I/O and fsync often create latency spikes.
- Sequential large I/O is usually cheaper than random small I/O; size each access so useful transfer time >= device startup time (roughly ~1 MB per disk access, ~64 KB per SSD access).
- Network diagnosis must check DNS, TLS, routing, firewall, load balancer, client, server, retransmit, and dependency latency.
- Physical distance imposes latency; use CDN, caching, regional placement, or async flow for global systems.
- Query paths need index review for new filters, sort orders, joins, foreign keys, and composite predicates.
- Avoid N+1 query patterns in serializers, views, loops, background jobs, and GraphQL resolvers; batch or eager-load by default when collections can grow.
- Avoid unbounded reads and responses; use pagination, streaming, limits, or IDs with explicit expansion.
- In async/event-loop paths, avoid blocking I/O, sleeps, sync database calls, sync subprocess calls, and CPU-heavy work without offload.

## Locks Queues Timers
- Lock issues include saturation, capture, starvation, and critical sections that block on I/O.
- Fix locks by shrinking critical section, splitting locks, moving work outside lock, copying then computing, or lock-free hot path.
- Queue growth means arrival too fast or departure too slow.
- Queue diagnosis needs enqueue rate, dequeue rate, depth, worker utilization, lock wait, and wakeup delay.
- Fix queues by reducing work time, increasing workers, balancing queues, work stealing, or removing dequeue bottleneck.
- Fixed sleeps and stale timeouts are common tail-latency sources.
- Timeout values need empirical basis and periodic review.
- Detect lock saturation, capture, and starvation separately. Measure holder and waiter, not only a global contention count.
- Treat buffered writeback under a coarse lock as a tail-latency hazard: early writes can look free until flush stalls every waiter. Move I/O/format/RPC outside the critical section and revalidate durability/order.
- Use shortest-queue/work stealing only for sufficiently homogeneous work. Partition by key, cost, or priority when one queue allows expensive work or hot keys to starve everything else.
- Bound spin by measured wake/schedule cost and total CPU impact; never use unbounded polling to make one latency graph look better.

## Reliability And Deployment
- Separate deploy from release using flags, routing, canary, blue-green, dark launch, or staged rollout.
- Treat feature flags as temporary: each needs an owner, defined default and failure behavior, and a removal path (e.g., an expiry date plus a cleanup task).
- Canary requires success metrics and automatic or explicit rollback criteria.
- Backups must be restore-tested; backup existence does not prove recovery.
- Rollback must cover app version, database migration, config, queue consumers, contracts, and dependent services.
- Capacity planning balances cost, demand, availability, and uncertainty.
- Autoscaling still needs quotas, startup time, warmup, cost guardrails, and supply limits.
- Startup, migrations, scripts, one-time jobs, and operational automation should be idempotent or restartable where practical, with durable state, auditability, verification, and rollback or roll-forward.
- Release checks should validate version, configuration, dependency readiness, migration state, queue consumers, health checks, logs, metrics, and rollback path.
- Canaries and staged rollouts need stop conditions tied to user impact, error rate, latency percentiles, saturation, queue age, dependency failures, and business-critical flows.
- Do not concentrate demand through synchronized jobs, uncontrolled fan-out, cache stampedes, fragile chattiness, or coordinated retries.
- Apply the migration/schema row in `pre-landing-review-prevention.md` Required Gates before rollout.
- Publish/distribution changes need artifact path, version/tag format, platform matrix, secret handling, and idempotent rerun review.
- Build once and promote the same artifact digest; do not rebuild per environment and assume equivalence.
- Validate clean versus incremental build output where stale artifacts can survive. Release evidence should include source, dependency/toolchain, artifact/symbol/provenance, schema/config, and rollback artifact.
- Exercise failure matrices: process death, network partition with both sides alive, control-plane/quorum loss, stale discovery, insufficient failover capacity, duplicate client retry, two active writers, corrupt/incompatible checkpoint, and failback/drain.
- Record detection time, switch/restore time, lost or duplicate effects, error/tail impact, manual steps, reconciliation, and return-to-normal.

## Security Operations
- Cloud security is shared responsibility, not outsourcing.
- Threat model by asset, actor, entry point, trust boundary, impact, and mitigation.
- Defense in depth assumes one layer will fail.
- Zero trust means every user, service, device, and network path needs identity, authorization, and auditability.
- Secret management (central store, rotation with overlap, workload identity, leak response) is canonical in `devsecops-security-governance.md` Secret Management.
- Pipeline and supply-chain security (CI/CD attack surface, per-stage identity, provenance) is canonical in `devsecops-security-governance.md` Pipeline Design Rules.
- Prefer default-deny network policy and explicit allowed paths.

## Operations And Incidents
- Incident response optimizes fast assessment, communication, mitigation, and learning.
- Define severity by observed and potential impact (users, data, security, commitments), not by engineering effort involved.
- First assess, then inform; avoid speculative public root cause during active response.
- Incident report should include title, date, participants, impact, timeline, evidence, root cause, contributing factors, action items.
- Post-incident review should find system failure modes and contributing conditions.
- MTTR and MTTD are useful but incomplete; action items must reduce recurrence or detection time.
- Alerts must be actionable and backed by documented runbooks.
- During an incident: preserve evidence, bound impact, stop amplification, choose the safest reversible mitigation, verify user/data state, then deepen root-cause analysis. Do not wait for a complete theory before stopping data loss or retry storms.
- Separate symptom, first wrong state, trigger, root defect, contributing conditions, and failed defenses. Action items must add prevention, detection, containment, recovery, or evidence, not vague care.

## Infrastructure And Automation
- Version control source, IaC, config, scripts, runbooks, and operational docs.
- Avoid `.bak`, manual copy, undocumented console changes, and snowflake servers.
- IaC exists for reproducibility, reviewability, auditability, and rollback, not only speed.
- Model infrastructure as build image, provision resource, configure resource.
- CI builds, tests, and merges; CD releases, deploys, and validates.
- Tooling should reduce cognitive load and increase consistency; do not add tools for fashion.
- Use shell for small automation; use general-purpose language for complex logic.
- Test infrastructure beyond syntax: real identity/permission, DNS/TLS/network, service interaction, idempotent setup/teardown, quotas/cost/lifetime, and failure cleanup.
- Keep test environments controlled and uniquely scoped. Classify failures as environment, flawed test, changed assumption, product/IaC defect, or nondeterminism before editing code.
- Switch from shell when data structures, error classification, retries, concurrency, persistent state, or substantial tests make a program easier to reason about. Do not use a line-count threshold alone.

## Documentation
- Documentation is team memory and operational control surface.
- Write for a reader and task: record, concept, task, reference, or plan.
- Good docs are correct, findable, readable, structured, and owned.
- A runbook must carry a responder from trigger to verified resolution without the author present, including rollback and escalation paths.
- If docs are unused, check freshness, findability, length, ownership, and maintenance path.
- A runbook must include applicable version/environment/trigger, safety checks, exact commands and expected output, failure branches and stop lines, permissions/data/effects, rollback/degrade, completion verification, and last drill evidence.
- Keep operational facts near their authority and record which code/schema/config/deploy change invalidates the document.
