# Playbook: Runtime Diagnosis And Remediation

Use for latency, throughput, queue, capacity, reliability, incident, dependency, or runtime
failure work. Diagnose from evidence, make one authorized change, and remeasure the same work.

## Incident Capsule

```text
Service/operation/environment and affected population:
Version/config/deployment and time window/timezone:
Normal baseline and current p50/p95/p99/errors:
Offered/accepted/completed/rejected/retried/queued:
Recent changes:
Known telemetry, clock, sampling, or drop gaps:
Authorization envelope:
```

## Procedure

1. **Preserve evidence**
   - Start read-only. Do not restart, clear queues/caches, rotate state, or change traffic before capturing version, config, symptoms, exemplars, and integrity signals.
   - Verify telemetry freshness, units, aggregation, sampling, drops, observer overhead, and clock assumptions.

2. **Trace one real transaction**
   - Map client/ingress/queue/application/store/dependency/response or durable completion.
   - Record timeout/deadline, retry owner, queue/pool bound, cancellation, idempotency, unknown outcome, and version/correlation at each hop.

3. **Compare cohorts and account for work**
   - Compare fast, typical, and slow/failed exemplars plus old/affected/new versions when available.
   - Keep offered, accepted, started, completed, rejected, timed out, canceled, retried, queued, and deferred work distinct.
   - Build non-overlapping elapsed-time accounting. For fan-out use critical path/interval union; leave unexplained time as `unknown`.
   - Use `runtime-ops-diagnostics.md` Complete Time Accounting and Measurement Experiment sections for mechanics.

4. **Classify before changing code**
   - Executing too much: calls, attempts, bytes, loops, fan-out, duplicate/background work.
   - Executing slowly: CPU/memory/storage/network/provider service demand.
   - Not executing: scheduler, lock, pool, queue, timer, I/O, dependency, or backoff wait.
   - State at least two plausible hypotheses and select the cheapest probe that distinguishes them.
   - Find the first abnormal fact in time; the largest metric at the end of a retry/queue cascade may be a consequence.

5. **Run one discriminating probe**
   - Add only the marker, counter, histogram, trace field, profile, query, or isolated experiment needed to close the largest evidence gap.
   - Run load/fault/trace/replay only with explicit authorization and a verified isolated target.
   - A production instrumentation change is still a production change; define overhead and stop threshold.
   - Before any repository edit, draft the touched-surface manifest and select matching pre-landing rows.

6. **Apply one reversible remediation**
   - Fix the proven mechanism or use a bounded mitigation with rollback.
   - Retry/timeout/concurrency/queue/cache changes require downstream capacity, side-effect, idempotency, and overload evidence.
   - Do not optimize an on-CPU hotspot that cannot explain end-to-end time.

7. **Remeasure matched work**
   - Use the same logical offered load, mix, data, version, warm state, and environment where possible.
   - Verify completed work, correctness, errors/rejections, queue age/depth, amplification, resources, and whether the bottleneck moved.
   - For repository changes, enter `playbook-landing-proof.md` only when this is the primary playbook. When dispatched by another playbook, return `PROVED`, `CHANGED`, or `BLOCKED` plus evidence to that caller.

## Stop Gates

- Evidence cannot distinguish the leading classifications: stop at the next concrete probe, not a guessed fix.
- A target metric improves by dropping, rejecting, timing out, or deferring more work: reject the change.
- The next action mutates production/shared state without explicit authorization and verified target.
- Recovery cannot preserve accepted work or reconcile unknown outcomes.

## Completion Evidence

An incident report alone is incomplete when a safe repository-local fix was requested and proved possible. Completion requires the causal evidence, changed artifact or exact authorized mitigation, matched before/after results, integrity proof, rollback, and stop condition.
