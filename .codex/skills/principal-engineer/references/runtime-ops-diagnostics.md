# Runtime, Operations, And Diagnostics

## Contents
- Core
- Production Failure Design
- Runtime Diagnosis
- Data-Intensive Runtime Semantics
- Observability
- CPU Memory Disk Network
- Locks Queues Timers
- Reliability And Deployment
- Security Operations
- Operations And Incidents
- Infrastructure And Automation
- Documentation
- Output

## Core
- Production quality is design quality plus operational evidence.
- Reliability must come from automation, monitoring, versioning, runbooks, rollback, rehearsed recovery, and observable systems.
- Unversioned, unmonitored, undocumented, unrecoverable systems are high-risk.
- Reduce cognitive load, manual operations, hidden dependencies, single-person knowledge, and blast radius.
- Choose infrastructure by workload, constraints, cost, operations maturity, and failure modes.
- A passing happy path is not production readiness; design failure semantics, demand limits, isolation, recovery, and diagnosis before production discovers them.
- Treat deployment, configuration, startup, migrations, one-time jobs, administrative controls, delivery tooling, and runtime state as part of the system.

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

## Runtime Diagnosis
- Do not diagnose performance from averages alone; inspect p50, p95, p99, p99.9, histogram, load, errors, and saturation.
- Start with a problem definition: service, transaction, time range, slow threshold, affected users, offered load.
- Estimate order of magnitude before deep analysis: ns, us, ms, seconds.
- Slow transaction time is one of: doing more work, doing same work slower, or waiting.
- Compare fast, medium, and slow samples of the same transaction.
- Build a single-request timeline with request ID, RPC ID, parent ID, stages, timestamps, byte sizes, status, and errors.
- Classify waiting: CPU, memory, disk, network, lock, timer, queue, dependency, scheduler.
- Do not modify code before forming a falsifiable hypothesis from evidence.
- After a fix, remeasure p50, p95, p99, error rate, throughput, and resource saturation.

## Data-Intensive Runtime Semantics
- State source of truth, durability point, visibility point, downstream effects, and repair path before changing a write path.
- Treat crashes, partial writes, duplicate work, timeouts, stale reads, and unknown downstream success as normal inputs.
- Distinguish accepted, persisted, applied, visible, and durable success.
- Caches, indexes, projections, search copies, materialized views, warehouses, and denormalized fields are derived data; define staleness, lag, propagation, rebuild, and repair.
- Jobs, consumers, CDC, stream processors, and replayable batch work need duplicate, replay, ordering, retention, side-effect, and recovery safety.
- Preserve only the ordering the business logic needs, scoped by key, stream, partition, record, entity history, or stronger contract.
- Schema evolution decisions (mixed-version compatibility for old readers, old writers, old data, and in-flight messages) are canonical in `architecture-system-design.md` Data; this file's concern is observing and diagnosing that compatibility at runtime.
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
- Observability overhead must not become the bottleneck.
- Boundary telemetry should include latency, throughput, error, saturation, retry, breaker, queue, dependency, version, configuration, health, and runtime signals.
- Avoid secrets in telemetry and avoid retry-storm log spam.
- Derived data needs observability for lag, dropped events, replay progress, rebuild progress, poison messages, and repair actions.

## CPU Memory Disk Network
- CPU high is not proof CPU is root cause.
- Runnable but not running means CPU wait.
- Low IPC or cache misses can mean executing slowly.
- PC sample changes can mean executing too much.
- Production paging creates long tail latency; avoid it.
- Pointer-heavy structures can waste cache lines and increase memory stalls.
- Small synchronous I/O and fsync often create latency spikes.
- Sequential large I/O is usually cheaper than random small I/O.
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
- Migration release-safety gates (reversibility, lock-duration, batched backfill, old-code/new-schema and new-code/old-data compatibility, staged rollout for NOT NULL/rename/drop/narrowing changes) are canonical in `pre-landing-review-prevention.md` Data Migration Safety (98-103); apply that gate before rollout.
- Publish/distribution changes need artifact path, version/tag format, platform matrix, secret handling, and idempotent rerun review.

## Security Operations
- Cloud security is shared responsibility, not outsourcing.
- Threat model by asset, actor, entry point, trust boundary, impact, and mitigation.
- Defense in depth assumes one layer will fail.
- Zero trust means every user, service, device, and network path needs identity, authorization, and auditability.
- Secrets must be centralized, rotated, revocable, least-privileged, inventoried, and kept out of source, logs, images, and ad hoc env sprawl.
- CI/CD, VCS, build environment, artifact repo, logs, and production credentials are part of the attack surface.
- Prefer default-deny network policy and explicit allowed paths.

## Operations And Incidents
- Incident response optimizes fast assessment, communication, mitigation, and learning.
- Define severity by observed and potential impact (users, data, security, commitments), not by engineering effort involved.
- First assess, then inform; avoid speculative public root cause during active response.
- Incident report should include title, date, participants, impact, timeline, evidence, root cause, contributing factors, action items.
- Post-incident review should find system failure modes and contributing conditions.
- MTTR and MTTD are useful but incomplete; action items must reduce recurrence or detection time.
- Alerts must be actionable and backed by documented runbooks.

## Infrastructure And Automation
- Version control source, IaC, config, scripts, runbooks, and operational docs.
- Avoid `.bak`, manual copy, undocumented console changes, and snowflake servers.
- IaC exists for reproducibility, reviewability, auditability, and rollback, not only speed.
- Model infrastructure as build image, provision resource, configure resource.
- CI builds, tests, and merges; CD releases, deploys, and validates.
- Tooling should reduce cognitive load and increase consistency; do not add tools for fashion.
- Use shell for small automation; use general-purpose language for complex logic.

## Documentation
- Documentation is team memory and operational control surface.
- Write for a reader and task: record, concept, task, reference, or plan.
- Good docs are correct, findable, readable, structured, and owned.
- A runbook must carry a responder from trigger to verified resolution without the author present, including rollback and escalation paths.
- If docs are unused, check freshness, findability, length, ownership, and maintenance path.

## Output
- Give conclusion, evidence, classification, recommended fix, verification, and residual risk.
- For runtime issues, include before/after metrics and whether the bottleneck moved.
- For ops changes, include rollback, monitoring, auditability, and blast-radius impact.
- Mark unknowns as data to collect, not as vague uncertainty.
