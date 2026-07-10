# Architecture And System Design

## Contents
- Core
- Complexity And Information Hiding
- Modularity
- Coupling
- Responsibility And Dependency Principles
- Style Selection
- Distributed Systems
- Data
- Evolution
- Reference Arbitration
- Architecture Modeling
- Output

## Core
- Optimize for the top 1-3 quality attributes; more priorities dilute the design.
- Confirm business goal, change pattern, data ownership, consistency, deployment, operations, and team capability.
- Prefer decisions that are reversible, observable, governable, and cheap to validate.
- Use ADRs for significant decisions: context, decision, alternatives, consequences, compliance, status.
- Use fitness functions for rules that must stay true: dependency direction, cycles, contracts, performance budget, security, deployability.

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

## Distributed Systems
- Remote calls are not local calls; assume latency, partial failure, retries, duplication, reordering, and observability gaps.
- Every remote call needs timeout, cancellation, retry policy, circuit breaker when appropriate, correlation ID, metrics, logs, and tracing.
- Retries require idempotency, budget, backoff, and failure classification.
- Synchronous calls fit immediate response and simple failure semantics.
- Asynchronous messaging fits buffering, decoupling, event reaction, long jobs, and resilience.
- Async requires ack, retry, DLQ, idempotency, ordering policy, schema versioning, and replay strategy.
- Avoid cross-service transactions as default; use coarser boundaries, events, compensation, or keep the operation local.

## Data
- Service autonomy requires data ownership; shared database couples lifecycle and deployment.
- Strong consistency usually belongs inside one module, aggregate, service, or database transaction.
- Eventual consistency is a business rule, not a technical excuse.
- Cross-boundary data contracts should expose stable external meaning, not internal domain or ORM models.
- Store IDs across aggregate or service boundaries, not live object references.
- Avoid shared canonical models that force unrelated domains to change together.
- Make source of truth explicit before introducing caches, replicas, projections, indexes, search copies, warehouses, materialized views, or denormalized fields.
- Write-path success semantics (accepted/persisted/visible/applied/durable) and derived-data staleness/lag/rebuild/repair are runtime-observable behavior; canonical in `runtime-ops-diagnostics.md` Data-Intensive Runtime Semantics (52-53).
- Schema, event, enum, status, and payload changes must account for old readers, old writers, old stored data, in-flight messages, rolling upgrades, and cross-service formats.
- Match partitioning to workload locality and consistency keys; check hot keys, skew, routing metadata, rebalancing, secondary indexes, and cross-partition operations.
- Use transactions and isolation to protect named invariants; map lost updates, write skew, phantoms, stale reads, and conflict handling to business rules.

## Evolution
- Design for change by keeping options open, not by building speculative end-state architecture.
- Use evolutionary architecture when requirements, scale, or deployment topology will shift.
- Govern evolution with tests, contract checks, migration gates, observability, and deprecation policy.
- Prefer incremental migration: facade, adapter, strangler fig, feature flag, parallel run, measured cutover.
- Do not preserve two implementations indefinitely; every migration needs an exit condition.
- Keep volatile decisions reversible: vendors, databases, transport protocols, platform services, deployment topology, and policy choices should harden only when evidence justifies the commitment.
- Use tracer bullets or thin end-to-end slices to validate integration, architecture, and assumptions before building piles of isolated components.
- Use prototypes to learn; state what the prototype proves, what it does not prove, and which shortcuts must be discarded before production.

## Reference Arbitration
- A Philosophy of Software Design should arbitrate module/API boundaries when complexity, deep modules, information hiding, and interface shape are the main risk.
- Clean Architecture should arbitrate dependency direction and policy isolation when business rules must survive framework, database, transport, vendor, or deployment change.
- Designing Data-Intensive Applications should arbitrate data ownership, consistency, durability, replication, partitioning, schema evolution, event flow, replay, and derived-data maintenance.
- Release It! should arbitrate production failure semantics, overload, isolation, observability, rollback, and dependency survival.
- Do not load heavyweight architecture pressure for simple local CRUD or low-risk cleanup; use the smallest mechanism that changes the decision.

## Architecture Modeling
- Model only enough to answer the decision question.
- Model quality as component behavior plus workload plus deployment resources plus composition.
- Use actual telemetry to calibrate usage, resource demand, failure rate, and cost assumptions.
- Compare alternatives by performance, reliability, cost, deployability, and operational risk.
- Prefer percentiles, histograms, queues, saturation, and tail behavior over averages.
- Treat predictions as assumptions until calibrated against measurements.

## Output
- Recommend one option and reject at least one plausible alternative when useful.
- State top quality attributes, constraints, tradeoffs, risks, and governance.
- For risks, include impact, likelihood, mitigation, and verification.
- For architecture diagrams, show only decision-relevant boundaries, dependencies, data ownership, and failure paths.
