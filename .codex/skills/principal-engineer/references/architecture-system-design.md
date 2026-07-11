# Architecture And System Design

## Contents
- Core
- Architecture Entry And Evidence
- Quality Attribute Scenarios
- Complexity And Information Hiding
- Modularity
- Coupling
- Boundary Cost And Dependency Direction
- Responsibility And Dependency Principles
- Style Selection
- Decomposition And Service Granularity
- Distributed Systems
- Workflow And Consistency Design
- Data
- Evolution
- Fitness Functions And Architecture Experiments
- Decision Arbitration
- Architecture Modeling

## Core
- The current playbook owns this subtask's architecture decision, experiment, implemented slice, and evidence; it completes the request only when primary and otherwise returns upward. Use this reference only for the active system-design mechanism, then return evidence to the current playbook.
- Optimize for the top 1-3 quality attributes; more priorities dilute the design.
- Confirm business goal, change pattern, data ownership, consistency, deployment, operations, and team capability.
- Prefer decisions that are reversible, observable, governable, and cheap to validate.
- Use ADRs for significant decisions: context, decision, alternatives, consequences, compliance, status.
- Use fitness functions for rules that must stay true: dependency direction, cycles, contracts, performance budget, security, deployability.

## Architecture Entry And Evidence
For a new system:
1. Convert the outcome and top quality attributes into executable scenarios before selecting a style.
2. Draw capability, data ownership, trust, failure, and deployment boundaries.
3. Build one walking vertical slice through build, deploy, data, observability, and rollback.
4. Keep expensive choices reversible until a representative slice or experiment resolves the risk.

For an existing system, reconstruct architecture from facts before drawing a target:
- Runtime entries, routes, handlers, consumers, jobs, and deployment units.
- Source dependency graph, strongly connected components, forbidden edges, public APIs, and build boundaries.
- Data stores, schemas, writers, transactions, caches, queues, replicas, and derived data.
- Remote calls, timeouts/retries, workflow coordination, auth/trust transitions, and failure propagation.
- Test topology, release path, rollback, telemetry, co-change history, incidents, and operational workarounds.

Build an architecture risk heatmap instead of a pattern inventory. Rank a risk by impact, likelihood/exposure, distance across boundaries, volatility, and evidence gap. Use numbers only to compare candidates; do not convert heuristic scores into claims of probability.

## Quality Attribute Scenarios
Replace adjectives with scenarios:

```text
Source: who/what creates the stimulus
Stimulus: request, failure, change, attack, or load
Environment: normal, peak, degraded, migration, recovery
Artifact: component, data, workflow, or boundary affected
Response: required behavior
Measure: metric, percentile/threshold, window, measurement point
Scope: which architecture quantum or operation owns the requirement
Failure action: reject, shed, degrade, roll back, repair, or escalate
```

Do not apply one global reliability, latency, or security requirement to every component. Scope each characteristic to the smallest unit sharing deployment, data, failure, and operational properties. When two components must always version, start, scale, fail, or recover together, treat that as evidence they occupy one architecture quantum even if processes are separate.

Prioritize scenarios by actual consequence and conflict. If latency, consistency, availability, and cost cannot all win, state which is the hard constraint, which is optimized, and which is allowed to degrade.

## Complexity And Information Hiding
- Use reduced cognitive load as a primary design metric: fewer hidden dependencies, fewer facts in working memory, fewer repeated caller obligations.
- Prefer deep modules with small semantic interfaces that hide meaningful internal complexity.
- Reject shallow boundaries: pass-through services, thin wrappers, helper modules, and extra layers that add names without hiding decisions.
- Design interfaces around what callers need to know, not how implementation stages, storage, protocols, cache, or bookkeeping work.
- Pull complexity downward when one owning module can make many callers simpler.
- Combine or split by total system complexity, not by size, runtime order, habit, or aesthetics.
- Keep common cases automatic; isolate rare controls, exceptional workflow, compatibility quirks, and performance tricks away from the common path.
- Use comments and ADRs to record interface contracts, invariants, rationale, constraints, and hidden decisions; do not use prose to excuse leaky boundaries.

## Modularity
- Put code that changes together close together.
- Separate code that changes for different reasons.
- Cut modules by business capability or use case, not by database table alone.
- Avoid entity-trap architecture where CRUD entity managers masquerade as components.
- Keep public surface small; every public name becomes a maintenance contract.
- Make illegal dependencies fail by compiler, module system, architecture test, or CI rule.
- Use architecture quantum to find the smallest unit that shares deployment, data, and quality attributes.

## Coupling
- Good: strong coupling at short distance; weak coupling at long distance.
- Bad: strong coupling across service, repo, team, or vendor boundary.
- Bad: weak coupling inside a local unit when it fragments one cohesive concept.
- Coupling sources: shared model, shared lifecycle, call order, timing, transaction, availability, identity, algorithm, special values.
- Reduce distant coupling by stable contracts, DTOs, integration events, adapters, facades, and ownership boundaries.
- If strong coupling cannot be reduced, reduce distance by merging modules, aggregates, libraries, or services.
- High volatility amplifies every coupling mistake.
- Analyze each material edge on three axes:
  - **Strength**: intrusive/private knowledge, shared functional rule, shared model, or minimal contract.
  - **Distance**: function, module, package, process, repository, deployment, organization, or external consumer.
  - **Volatility**: observed co-change/incident/dependency churn or an explicit upcoming constraint.
- Map knowledge flow as well as calls. Shared identity, units, order, special values, error meaning, lifecycle, and schema can create coupling without an import edge.
- Use connascence to name what must agree: name/type/meaning/position/algorithm at compile time; value/identity/timing/order at runtime. Prefer weaker and more local forms.
- Runtime call frequency is not design strength. A rare call can carry a high-cost semantic contract; a high-volume local call can be safely encapsulated.
- Avoid both extremes: local over-fragmentation forces readers to reconstruct one concept, while global concentration creates a god module. Optimize total navigation and change cost.

## Boundary Cost And Dependency Direction
Distinguish source, deployment, and service boundaries. A clean source dependency does not require a process; a process does not guarantee a model boundary.

Use a cost ladder and stop at the cheapest boundary that protects the decision:
1. Named private function/type.
2. Module/package with a small public surface.
3. Port/adapter or facade around volatile infrastructure.
4. Independent build artifact or data/schema permission boundary.
5. Independent service/deployment/data owner.

Require more evidence at every step: serialization, network, versioning, partial failure, auth, observability, deployment, migration, and operations are not free decoupling.

Make source dependencies point toward policy. Control flow may cross outward and return through an interface, but core policy must not import framework, database, transport, UI, clock, randomness, or vendor types. Boundary data may cross; technical session/context/ORM/SDK types may not.

Keep the composition root as the only place that knows concrete volatile implementations. Use a humble adapter around UI, framework callbacks, hardware, and hard-to-test delivery mechanisms. Deep use of a framework is acceptable when its exit cost is explicit and contained.

## Responsibility And Dependency Principles
- Use single-responsibility pressure as "one reason to change at this boundary", not "one tiny class per verb".
- Prefer feature or capability ownership when layer-first organization scatters one use case across many files; still preserve inward dependency direction inside the slice.
- Apply open/closed pressure only where variation is real and recurring. A stable rule table, dispatch map, configuration, or simple conditional may beat a new type hierarchy.
- Treat substitutability as a contract issue for ports, adapters, repositories, gateways, strategy implementations, and test fakes. If an implementation throws "not supported", changes error meaning, ignores invariants, or weakens guarantees, the abstraction is false.
- Keep interfaces client-shaped. Split read/write/admin/batch/stream concerns when one interface forces callers to depend on unused operations.
- Invert dependencies around volatile infrastructure, framework, vendor, I/O, time, randomness, and remote systems. Do not create interfaces around stable local helpers merely for purity.
- Keep concrete wiring in a composition root, module bootstrap, factory, or adapter layer; business policy should not construct volatile collaborators directly.
- Use walking skeletons or tracer bullets when architecture risk is integration, deployability, or dependency direction; prove the slice before expanding the framework.

## Style Selection
- Default to modular monolith when requirements, boundaries, or operations maturity are uncertain.
- Use layered architecture for simple, low-budget, low-complexity systems; watch sinkhole layers and anemic pass-throughs.
- Use service-based architecture for coarse deployability without full microservice cost.
- Use microservices only with clear domain boundaries, owned data, independent deployability, observability, and operational maturity.
- Use event-driven architecture for decoupling, buffering, async reaction, and long work; pay for traceability and eventual consistency.
- Use pipeline architecture for ETL, streams, and staged transformations with independent filters.
- Use microkernel architecture when core flow is stable but rules or extensions vary.
- Use space-based architecture only for extreme concurrency where eventual consistency and complexity are acceptable.
- Treat big ball of mud, distributed monolith, shared-database microservices, and remote fine-grained objects as anti-patterns.

For each style state the trigger and bill:
- Layered/modular monolith: low operational cost, but enforce feature ownership and prevent sinkhole/pass-through layers.
- Pipeline: independent transformations, but define stage contract, backpressure, retry, ordering, and partial output.
- Microkernel: stable core plus real extensions, but define plugin lifecycle, capability, compatibility, and isolation.
- Service-based: coarse deployment units, but prove each can own failure and data rather than merely expose remote layers.
- Event-driven: temporal decoupling, but pay for schemas, state reconstruction, duplicate/order/replay, and diagnosis.
- Space-based: only when contention and extreme concurrency justify replication/partition complexity and weaker consistency.

## Decomposition And Service Granularity
Before decomposing, decide whether the codebase is decomposable. Positive signals include identifiable capabilities, mostly acyclic dependencies, aligned domain vocabulary, candidate data writers, and traceable use cases. Negative signals include root/shared utilities everywhere, cycles, unrelated writers to the same tables, mixed UI/domain/persistence code, global co-change, and no local build/test baseline.

If negative signals dominate, modularize in place before adding a network boundary.

Choose a decomposition route:
- **Component-based**: inventory, gather same-domain code, flatten accidental package depth, map dependencies/cycles, form capability domains, then extract a coarse service only after the boundary is proven.
- **Tactical fork**: copy then delete only when target boundaries are already unambiguous, contract/data tests exist, time pressure justifies drift risk, and code convergence/removal is explicit.

Use disintegrators as pressure to split:
- Different capability, change volatility, scale/throughput, failure isolation, trust/data sensitivity, or extension pressure.

Use integrators as pressure to keep together:
- One ACID invariant, high-frequency workflow, one volatile shared rule, strong identity/relationship, frequent join, or required shared state.

After a proposed split ask:
- Can units really deploy, start, scale, fail, secure, and recover independently?
- Does most traffic immediately cross the new boundary?
- Did the split introduce a distributed transaction to preserve an old local invariant?
- Does a permission/module boundary provide the needed isolation more cheaply?
- Is the connection/pool budget viable for service instances times pool size?

Do not choose service count from line count. Use component metrics, churn, fan-in/out, data writes, runtime calls, and defect history only to find where to inspect.

## Distributed Systems
- Remote calls are not local calls; assume latency, partial failure, retries, duplication, reordering, and observability gaps.
- Every remote call needs timeout, cancellation, retry policy, circuit breaker when appropriate, correlation ID, metrics, logs, and tracing.
- Retries require idempotency, budget, backoff, and failure classification.
- Synchronous calls fit immediate response and simple failure semantics.
- Asynchronous messaging fits buffering, decoupling, event reaction, long jobs, and resilience.
- Async requires ack, retry, DLQ, idempotency, ordering policy, schema versioning, and replay strategy.
- Avoid cross-service transactions as default; use coarser boundaries, events, compensation, or keep the operation local.
- Choose contract strictness (strict, loose, or consumer-driven) from consumer update speed, deployment control, breaking-change cost, and security-visible fields; a loose contract still needs explicit minimum semantics plus contract tests.

Classify every cross-boundary workflow on three independent axes:
- **Communication**: synchronous or asynchronous.
- **Consistency**: atomic or eventual.
- **Coordination**: orchestrated or choreographed.

Avoid async + atomic + choreography: it demands one outcome with no explicit state owner. Prefer sync + atomic only inside a small strongly consistent boundary; use async + eventual + orchestration for complex long workflows requiring state/recovery; use async + eventual + choreography for simple natural reactions with no global completion rule.

For every remote call also define remaining deadline propagation, cancellation, operation identity, payload/cardinality bound, success visibility, and unknown-outcome handling. Keep retry ownership in one layer to prevent multiplicative amplification.

## Workflow And Consistency Design
Semantic workflow coupling does not disappear when calls become events; it moves into an orchestrator, participants, contracts, and state.

Choose orchestration when progress queries, branches, cancellation, timeout, compensation, and repair are complex. Keep domain rules in participants; do not turn the orchestrator into a distributed god object.

Choose choreography for simple fact reactions and extensible fan-out with no central completion condition. If understanding completion requires reconstructing a hidden event tree, introduce an explicit process owner or state projection.

Place workflow state deliberately:
- Orchestrator-owned state for direct query/recovery, accepting a central dependency.
- Participant-owned state when local domain ownership dominates, accepting aggregate query cost.
- Derived projection for status views, with lag/gap/rebuild semantics.
- State carried in an envelope only when receivers truly need the context and payload/privacy/version bounds are controlled.

A Saga is a state machine of local transactions, not distributed rollback. Require process ID, current and terminal states, expected version, processed message IDs, durable deadline/retry, last successful step, compensation state, quarantine/manual repair, retention, and replay behavior. Compensation is a new forward action that can also fail or be observed; it cannot erase an email, shipment, payment, or history.

Every eventual-consistency path needs a consistency contract:
- Source of truth and authoritative writer.
- Expected convergence time and stale-state meaning.
- Duplicate, missing, out-of-order, gap, and poison handling.
- Drift detection, reconciliation, backfill, replay, and repair.
- Schema/version evolution and runtime lag/progress evidence.

## Data
- Service autonomy requires data ownership; shared database couples lifecycle and deployment.
- Strong consistency usually belongs inside one module, aggregate, service, or database transaction.
- Eventual consistency is a business rule, not a technical excuse.
- Cross-boundary data contracts should expose stable external meaning, not internal domain or ORM models.
- Store IDs across aggregate or service boundaries, not live object references.
- Avoid shared canonical models that force unrelated domains to change together.
- Make source of truth explicit before introducing caches, replicas, projections, indexes, search copies, warehouses, materialized views, or denormalized fields.
- Write-path success semantics (accepted/persisted/visible/applied/durable) and derived-data staleness/lag/rebuild/repair are runtime-observable behavior; see `runtime-ops-diagnostics.md` Data-Intensive Runtime Semantics.
- Schema, event, enum, status, and payload changes must account for old readers, old writers, old stored data, in-flight messages, rolling upgrades, and cross-service formats.
- Match partitioning to workload locality and consistency keys; check hot keys, skew, routing metadata, rebalancing, secondary indexes, and cross-partition operations.
- Use transactions and isolation to protect named invariants; map lost updates, write skew, phantoms, stale reads, and conflict handling to business rules.
- Build a write-owner matrix before a service/data split, and inventory cross-schema foreign keys, views, triggers, and stored procedures spanning candidate boundaries as blocking integrators:

| Data set | Canonical writer | Other writers/readers | Invariant/transaction | Schema owner | Copies/consumers | Freshness/repair |
| --- | --- | --- | --- | --- | --- | --- |

- Prefer one writer. Common ownership often means one data domain; joint ownership of fields/stages risks lost updates and ambiguous schema control. Repair with table/record split, delegation to one owner, a coarser data domain, or service consolidation.
- Choose cross-boundary reads by forces:
  - Inter-service query for fresh low-frequency data with acceptable availability coupling.
  - Selected field replication for frequent local reads that tolerate bounded staleness and repair.
  - Replicated cache only with warm-up, miss, version, invalidation, authorization context, capacity, and fallback semantics.
  - Shared data domain when joins, constraints, and ACID matter more than deployment autonomy.
- Choose database type from access, transaction, relationship, write/read, partition, backup, restore, migration, driver, and operational evidence. Polyglot persistence must repay its added operation and skill surface.
- Separate operational and analytical contracts. A data product includes schema, ingestion/transformation, lineage, quality, security, retention, version, deployment, and monitoring. Do not let reporting pipelines become uncontrolled writers or force transactional schemas to serve every analytical view.
- For generic compatibility and the versioned Expand-Migrate-Contract state machine, use `technical-tradeoffs-and-modeling.md` Compatibility And Evolution. This file owns the architecture-specific data/write boundary, not migration mechanics.

## Evolution
- Design for change by keeping options open, not by building speculative end-state architecture.
- Use evolutionary architecture when requirements, scale, or deployment topology will shift.
- Govern evolution with tests, contract checks, migration gates, observability, and deprecation policy.
- Prefer incremental migration: facade, adapter, strangler fig, feature flag, parallel run, measured cutover.
- Do not preserve two implementations indefinitely; every migration needs an exit condition.
- Keep volatile decisions reversible: vendors, databases, transport protocols, platform services, deployment topology, and policy choices should harden only when evidence justifies the commitment.
- Use tracer bullets or thin end-to-end slices to validate integration, architecture, and assumptions before building piles of isolated components.
- Use prototypes to learn; state what the prototype proves, what it does not prove, and which shortcuts must be discarded before production.
- Distinguish refactor (behavior preserved), restructure (architecture/deployment shape changes), and rewrite (a migration with old/new compatibility). Do not hide a rewrite inside a refactor label.
- Use feature flags, canary, shadow/parallel execution, strangler routing, and fidelity comparison only with owner, safe default, stop threshold, rollback, cleanup, and an exit date/condition.
- Isolate vendor protocols and model meaning behind a translation boundary. Do not build a generic abstraction until a real second implementation or exit scenario proves which semantics are common.

## Fitness Functions And Architecture Experiments
Turn a critical architecture rule into a check with:
- Protected quality attribute and scoped quantum.
- Evidence source, metric/rule, unit, threshold, and provenance.
- Static/dynamic and continuous/triggered execution point.
- Failure action: report, block, shed, roll back, or quarantine.
- Owner, exception approval, expiry, and false-positive review.
- Version and retirement/replacement condition.

Start new checks in report mode when the baseline is unknown; make them blocking only after false positives, runtime cost, and migration strategy are understood. A check that freezes one implementation instead of protecting a quality attribute is architecture damage.

Useful fitness functions include dependency direction/cycles, forbidden package access, API/schema compatibility, payload/cardinality bounds, query count, build/deploy independence, migration compatibility, latency/error/SLO guardrails, data freshness/completeness/lineage, restore tests, and old-path usage reaching zero.

Use a PoC only for the highest-risk assumption. Define hypothesis, representative input/environment, success/failure thresholds, time/resource box, artifacts/evidence, non-goals, and disposal or hardening path. Never infer whole-system production readiness from a happy-path prototype.

Record significant decisions in an ADR with status quo, alternatives, protected guarantees, decision, consequences/new failure modes, assumptions/reversal thresholds, verification, rollout/rollback, and supersession condition.

## Decision Arbitration
- Let complexity, information hiding, and caller obligations arbitrate module/API shape.
- Let policy isolation and dependency direction arbitrate framework, database, transport, vendor, and delivery boundaries.
- Let source of truth, consistency, durability, replication, partitioning, schema evolution, event flow, replay, and repair arbitrate data architecture.
- Let production failure, overload, isolation, observability, rollback, and dependency survival arbitrate runtime topology.
- A decision is architecture-level when impact scope x change cost x failure consequence x expected lifetime scores high — that is what warrants an ADR and verification (decision significance, distinct from the risk heatmap's risk ranking); low scores stay local design.
- Do not load heavyweight architecture pressure for simple local CRUD or low-risk cleanup; use the smallest mechanism that changes the decision.

## Architecture Modeling
- Model only enough to answer the decision question.
- Model quality as component behavior plus workload plus deployment resources plus composition.
- Use actual telemetry to calibrate usage, resource demand, failure rate, and cost assumptions.
- Compare alternatives by performance, reliability, cost, deployability, and operational risk.
- Prefer percentiles, histograms, queues, saturation, and tail behavior over averages.
- Treat predictions as assumptions until calibrated against measurements.
- For model-or-measure selection, workload modeling, calibration/holdout validation, sensitivity, reliability/cost, and Pareto comparison, read `technical-tradeoffs-and-modeling.md`; do not duplicate its model card here.
