# Enterprise API And Domain Model

## Contents
- First-Pass Evidence Maps
- Enterprise Patterns
- Pattern Selection
- Persistence Mapping And Loading
- Transactions, Concurrency, And Session State
- API Design
- API Compatibility
- API Traffic And Runtime Contract
- API Security
- Gateway And Mesh
- Minimal DDD
- Bounded Context And Language
- Domain Modeling Procedure
- Domain Objects
- Transactions And Consistency
- Reliable Events And Long Processes
- CQRS And Event Sourcing Gates
- Dependency Injection

The current playbook owns this subtask's tracing, implementation, and verification; it completes the request only when primary and otherwise returns upward. Use this reference only for the active API, domain, persistence, transaction, or integration mechanism, then return to the playbook.

## First-Pass Evidence Maps
Before changing an enterprise flow, build only the maps the decision needs:

**Use-case map**
| Entry/command | Rule owner | Data read/write | Transaction | External effect | Error/duplicate behavior |
| --- | --- | --- | --- | --- | --- |

**API map**
| Route/event | Consumer/version | Runtime handler | Published spec | Auth | Size/rate/deadline | Retirement signal |
| --- | --- | --- | --- | --- | --- | --- |

**Domain map**
| Term/context | Identity | Invariant | Legal states/transitions | Aggregate/owner | Source of truth |
| --- | --- | --- | --- | --- | --- |

**Integration map**
| Producer/consumer | Sync/async | Contract | Commit/publish/ack points | Idempotency/order | Retry/DLQ/repair |
| --- | --- | --- | --- | --- | --- |

Trace one command from transport through authorization, application transaction, domain decision, persistence, event/outbox, external effect, response, and telemetry. A layer diagram is not evidence that these responsibilities are owned correctly.

## Enterprise Patterns
- Choose pattern by domain complexity, not fashion.
- Simple CRUD: transaction script plus simple gateway is usually enough.
- Complex, evolving business rules: domain model plus mapper/repository may pay off.
- Table-oriented platforms may fit table module and record set.
- Service layer coordinates use cases, transactions, notifications, workflows, and integrations; it should not absorb all domain rules.
- Data mapper keeps domain independent from database schema; active record fits only simple table-shaped logic.
- Unit of Work, Identity Map, and Lazy Load are for complex object persistence; avoid them for simple data access.
- Repository represents aggregate/domain collection access; it is not a table CRUD wrapper.
- Remote interfaces must be coarse-grained; never expose fine-grained local object models remotely.

## Pattern Selection
- Decide responsibility ownership before naming patterns: presentation, transport, application workflow, domain logic, persistence, transaction, concurrency, integration, session, and distribution.
- Use transaction script for short, independent, simple flows with little domain behavior.
- Use table module when the natural model is table-centered set logic.
- Use domain model when rules, invariants, identity, lifecycle, collaboration, or local language complexity justify richer objects.
- Let simple patterns stay simple; escalate only when duplication, lifecycle, invariants, or business language pressure grows.
- Treat DDD and enterprise patterns as different primary lenses. DDD is primary for model language, invariants, lifecycle, Core Domain, or Bounded Contexts. PoEAA-style enterprise pattern selection is primary for workflow, persistence, transactions, remoting, and simple business logic alternatives.
- Do not load DDD and generic enterprise pattern guidance as equal authority. If DDD is primary, use enterprise patterns only for specific infrastructure choices. If simple enterprise forces dominate, do not add Aggregates, Domain Events, or rich Repositories by ceremony.
- Escalate from Transaction Script only when the same rule repeats across use cases, state/strategy branches keep growing, changes require synchronized edits, ORM shape distorts policy, multiple entries require one transaction/auth/integration policy, or identity/change tracking can no longer be managed locally.
- Keep each added layer honest: it must isolate a distinct change source, rule, transaction, representation, or external dependency. Merge pure forwarding layers.
- Use these combinations as starting hypotheses, not packages:
  - Simple CRUD: Transaction Script + focused Table Data Gateway.
  - Table/set-oriented logic: Table Module + Record Set/Gateway.
  - Rich lifecycle/invariants: Domain Model + Data Mapper + Repository + Unit of Work.
  - External system: local Port + Gateway/Mapper/ACL + contract tests.
  - Remote public capability: coarse Service Layer/Remote Facade + DTO and failure contract.

## Persistence Mapping And Loading
Choose data access from the relationship between domain and storage:

| Pattern | Trigger | Primary risk |
| --- | --- | --- |
| Table Data Gateway | Scripts/table modules need centralized SQL | Gateway leaks columns/dialect or becomes raw-SQL escape hatch |
| Row Data Gateway | Simple row-shaped data with reusable row operations | Persistence object is mistaken for a domain entity |
| Active Record | Table and object are nearly identical; rules are simple/local | Callbacks and schema lifecycle absorb complex policy |
| Data Mapper | Domain model and schema need independent evolution | Mapping/loading complexity and accidental ORM recreation |
| Repository | Aggregate-oriented collection queries use domain language | Generic CRUD/IQueryable leaks persistence and unbounded queries |
| Query Object/Specification | A bounded set of composable queries is needed | A weak SQL interpreter permits unindexed arbitrary work |

Use Unit of Work when one use case changes several objects and needs ordered atomic persistence. Scope it to one request/command/transaction; never share it across threads or silently extend it across user interaction.

Use Identity Map when one transaction/session could load one mutable entity more than once. It protects in-session identity, not cross-session concurrency.

Use Lazy Load only when most operations avoid a proven expensive relation and a valid data session exists at access time. Measure query count and data volume. Reject hidden I/O in innocent getters, serialization-triggered graph loads, detached access, and N+1 behavior.

Select relational mapping by real query/write/migration evidence:
- Embedded values for owner-lifetime value concepts.
- Association entities when a relationship owns state, time, priority, or behavior.
- Dependent mapping only when child identity/lifecycle is completely owned.
- Serialized large objects only when partial query/update/constraint is unnecessary and version/size/corruption recovery is designed.
- Inheritance mapping only after comparing polymorphic queries, joins, nullability/constraints, indexes, and migration cost.

Do not build metadata mapping or a generator until several stable mappings repeat. Generated mapping must be reproducible, reviewable, testable, and never hand-edited.

## Transactions, Concurrency, And Session State
Let the application use case own the system transaction. Repositories, controllers, and domain objects must not each open hidden transactions.

Keep transactions short: do pure computation early, then revalidate versions and write; do not wait on human input or slow remote calls while holding database connections or locks.

Choose isolation from the anomaly that violates a named invariant, not from a “stronger is safer” slogan. Test actual database semantics for lost update, non-repeatable/inconsistent read, phantom/write skew, deadlock, and retry under concurrency.

Use optimistic concurrency by default when conflicts are uncommon:
```text
UPDATE ... SET ..., version = version + 1
WHERE id = :id AND version = :expected
```
Treat zero affected rows as a conflict; include delete and relevant read-set versions. Reload and rerun policy before retrying. Never overwrite silently.

Use pessimistic locking only when conflict frequency or late-conflict cost justifies reduced concurrency. Define lock owner, order, scope, timeout, lease/recovery, monitoring, and crash release. Align coarse lock scope with the invariant, not implementation convenience.

Audit bulk updates, raw SQL, imports, migrations, callbacks, and secondary writers that can bypass implicit version/locking mechanisms.

For multi-request business transactions, persist draft/session state and use short system transactions. Revalidate version and invariant on final submission; do not hold a database transaction across requests.

Choose session location explicitly:
- Client state is untrusted; sign/validate it, minimize it, and never store final authorization, price, or secret decisions there.
- Server memory needs size/expiry, failover, affinity, and version behavior.
- Database/distributed state adds I/O and cleanup but supports multi-node/failover.

Request-scoped application service, Unit of Work, and mutable domain objects must not leak into singletons or background work. A singleton must be immutable or explicitly thread-safe.

## API Design
- Design public APIs for stability, documentation, security, compatibility, and versioning.
- Design internal APIs for explicit contracts, performance, ownership, and observability.
- REST fits public resource-oriented APIs.
- gRPC fits controlled internal low-latency contracts.
- GraphQL fits client-driven query aggregation, not universal API replacement.
- AsyncAPI/events fit asynchronous integration and event contracts.
- Do not expose PII, tokens, secrets, stack traces, SQL, internal paths, or diagnostic internals.
- Return consistent error bodies with status, code, message, and trace ID.
- Wrap collections in objects when evolution requires metadata, pagination, or links.
- Select the exchange style from consumer control, payload/query shape, latency, streaming, failure, and evolution:
  - REST for stable resource/HTTP semantics and broad consumers.
  - gRPC for controlled typed internal calls with strict protobuf lifecycle.
  - GraphQL for client-shaped aggregation when query cost, authorization, depth/cardinality, and N+1 are governed.
  - Events/AsyncAPI for facts and temporal decoupling with replay/idempotency/order contracts.
- Keep one contract authority. Continuously diff published specification, runtime route/handler, gateway routing, generated client, examples, and observed traffic. Drift is a release defect.
- Treat omission, explicit null, clear/delete, default, and unknown as distinct update semantics. Protect updates with version/ETag/CAS or field masks when old clients could overwrite fields they do not know.

## API Compatibility
- Apply the public-contract row in `pre-landing-review-prevention.md` Required Gates before landing.
- API-design-specific contract surface beyond that gate: event schemas and gRPC field numbers are contracts too — reserve removed field numbers rather than reusing them, add optional fields for compatible evolution, deprecate before removal with a deadline and replacement, and back the contract with OpenAPI/AsyncAPI/Protobuf plus contract tests covering status, body, headers, auth, pagination, empty state, and errors.
- Track active consumers, versions, endpoints, auth scopes, error/status use, payload size, and deprecation traffic. Documentation-only retirement is not evidence that a consumer is gone.
- Test producer-to-consumer direction explicitly across old/new clients, servers, stored data, messages, and rolling deployment. Preserve unknown fields/enum values through the real translation and round-trip path when compatibility requires it.
- Every public option, header, filter, callback, or field becomes long-lived semantic cost. Add it only with an actual consumer need, bounded behavior, observability, and retirement policy.

## API Traffic And Runtime Contract
Allocate an end-to-end deadline across ingress, queue/network, service work, dependencies, and return margin. Each downstream timeout must fit the remaining upstream budget; propagate deadline and cancellation.

Retry only transient, replay-safe operations within the remaining budget. Assign one layer as retry owner, use bounded attempts/time with backoff and jitter, and require an idempotency key or status query for side-effecting commands. Timeout after a write means outcome unknown.

Before adding retry calculate worst-case amplification across gateway, mesh, SDK, service, and worker. Prevent every layer from multiplying attempts.

Use rate limits to constrain a caller/tenant/operation and load shedding to protect finite system capacity. Define key, burst, sustained rate, distributed counter failure, status/error/Retry-After, cost class, and internal friendly-fire behavior. Shed before thread/connection/queue saturation becomes universal timeout.

At ingress and aggregation:
- Bound fan-out, payload, header, query depth/complexity, response, and concurrent work.
- Give each child call a budget and define partial failure/fallback semantics.
- Keep domain branching and compensation out of the gateway; use a BFF/application service when aggregation owns real policy.

Separate deploy from release. Feature flag, canary, mirror/dark launch, blue-green, and cache behavior need explicit safety:
- Flag type/default/failure, metric, rollback, and removal.
- Canary p95/p99/error/saturation/core-result guardrails and stop criteria.
- Mirror traffic cannot duplicate irreversible effects or expose credentials/PII; compare normalized outputs without contaminating production data/cache/queues.
- Blue-green must handle schema, queue consumers, cache/session/jobs, and whether old code understands new writes.
- Cache keys must include only the minimal non-secret authorization partition needed for correctness, such as tenant, subject/policy version, or a controlled fingerprint, plus API/content version where relevant. Never place raw tokens, credentials, cookies, or sensitive claims in cache keys, metrics, traces, or eviction logs; invalidate or re-key when authorization changes.

Minimum API telemetry: rate, status/error class, p50/p95/p99, saturation/pools/queue, dependency, version/consumer, payload/cardinality, retry, auth deny, rate-limit/load-shed, deprecation use, and trace/deadline propagation. Separate journal/audit facts from diagnostic detail and never log credential material.

## API Security
- Apply the auth and trust-boundary rows in `pre-landing-review-prevention.md` Required Gates before landing.
- API-specific identity: API keys identify applications, not users; access tokens must be short-lived, scoped, revocable, and audience-checked; validate JWT signature, issuer, audience, expiration, not-before, and required claims.
- Name API-specific vulnerability classes explicitly — BOLA, BFLA, mass assignment, excessive data exposure — and enforce with object- and function-level authorization plus allowlist validation for input, output, and writable fields.
- Gateway enforces ingress policy but never replaces service-level authorization; webhooks need signature verification and replay protection when supported; user-controlled URLs, redirects, and fetches need SSRF protection via allowlist/blocklist for internal ranges; audit security-sensitive actions with actor, target, result, reason, and trace ID.

## Gateway And Mesh
- API Gateway is for north-south traffic: routing, TLS, auth, rate limit, logging, metrics, tracing, policy.
- Do not put domain logic or payload-driven business workflow in the gateway.
- Gateway is critical path; design HA, SLO, audit log, and rollback.
- Service mesh is for east-west service traffic: discovery, mTLS, retries, timeouts, circuit breaking, traffic split, telemetry.
- Do not add mesh for a few simple services or weak operations maturity.
- Mesh handles communication policy, not business authorization or domain workflow.
- Before a mesh, prove repeated multi-language east-west pain in service identity, discovery, mTLS, traffic control, timeout/retry, or telemetry. Measure proxy/library cost and control-plane failure behavior.
- Assign timeout, retry, circuit, TLS, identity, and trace-header ownership once across application library, sidecar, gateway, and mesh. Duplicate policies create hidden amplification and inconsistent failure.
- Treat gateway and mesh configuration as hot-path code: validate atomically, version, observe, stage, roll back, rotate credentials, and test control-plane outage and proxy/resource exhaustion.

## Minimal DDD
- Do not use DDD for simple CRUD.
- Create domain model only for complex rules, state transitions, invariants, lifecycle, money, limits, permissions, review, or credentials.
- Create bounded context only when same terms mean different rules, ownership differs, consistency differs, or external semantics pollute local meaning.
- Create aggregate only for invariants that must be transactionally consistent.
- Aggregate root is the only external mutation path.
- One command should usually modify one aggregate.
- Use domain events for facts after state change, cross-model reaction, async sync, retry, or eventual consistency.
- Do not create domain events for plain CRUD.
- Use ACL when external API, database, event, naming, or status model must not leak into domain.
- Use CQRS only when read and write needs differ substantially.
- Use event sourcing only when event history is the source of truth.

## Bounded Context And Language
- Name the Bounded Context before interpreting terms, modules, services, repositories, events, APIs, persistence, or integrations.
- Keep one Ubiquitous Language per context across code, tests, commands, events, repositories, services, packages, APIs, and documents.
- Treat the same word in different contexts as potentially different concepts; translate instead of sharing domain classes or enums.
- Classify subdomains as Core, Supporting, or Generic; spend the richest modeling effort on the Core Domain and keep supporting or generic areas simpler.
- Choose context relationships deliberately: Shared Kernel, Customer/Supplier, Conformist, Anticorruption Layer, Open Host Service, Published Language, or Separate Ways (Evans's original set), plus Partnership and Big Ball of Mud containment (later DDD additions).
- Shared Kernel requires small stable overlap, joint ownership, and tests; without governance, choose translation instead.
- Anticorruption Layer means real translation of language, status, protocol, schema, and semantics, not a renamed client wrapper.
- Keep problem space and solution space separate: subdomain classifies the problem; Bounded Context owns one model. A repository, DLL, database, or service is not automatically a context.
- Context too large: same term has conflicting lifecycle/rules, unrelated areas must deploy together, or multiple authorities mutate one model. Context too small: chatty calls, every command crosses contexts for ACID, translation exceeds model complexity, or the same invariant is duplicated without semantic difference.
- Allocate the richest model and strongest evidence to Core Domain. Keep Supporting and Generic capabilities simpler or behind stable ports.

## Domain Modeling Procedure
Before adding tactical patterns, create four executable artifacts:

1. **Terminology table**: term, context, definition, examples/counterexamples, code/schema location, conflicting external meaning.
2. **Invariant table**: rule, command, required state, minimum data, transaction boundary, concurrency attack, enforcement/evidence.
3. **State-event table**: states, commands/events, transition/reject/repeat/defer/impossible, effects, timeout.
4. **Context map**: upstream/downstream, contract, translation, data owner, consistency, failure, version, relationship pattern.

Use counterexamples to refine the model. If two experts give different answers for the same scenario, the model is not ready to be encoded as a class hierarchy.

Derive an aggregate:
1. List commands and commit-time invariants.
2. Find the minimum state required to enforce them atomically.
3. Choose one root as the only mutation path.
4. Reference other aggregates by identity.
5. Attack the boundary with concurrent commands and version conflicts.
6. Move cross-boundary rules to explicit eventual consistency only when intermediate state is acceptable and repairable.

Measure aggregate root count, child cardinality, serialized/load size, query count, update frequency, conflict rate, and transaction p95. A hot or conflict-heavy root may indicate an oversized boundary, not a database tuning problem.

Use a Specification only when one domain predicate genuinely needs multiple uses such as validation, selection, or explanation. Do not leak SQL/query-provider behavior through it.

## Domain Objects
- Entity has identity and lifecycle; equality by ID.
- Value object has no identity, is immutable, and compares by value.
- Prefer value objects over primitive strings, numbers, and decimals for important concepts.
- Domain entity is not ORM entity by default.
- Hide setters; mutate through named methods that preserve invariants.
- Domain service is stateless domain logic that does not fit one entity or value object.
- Repository serves aggregate roots; it should not expose SQL, ORM, IQueryable, or infrastructure exceptions.
- Application service orchestrates use case, transaction, repositories, domain calls, and integration.
- API layer maps formats, validates entry, invokes authorization entry, and calls application layer; business rules stay out.
- Reference other aggregates by identity, not live object graphs.
- Keep aggregates small and root-protected; do not enlarge them for foreign keys, query convenience, or client rendering.
- Domain events are meaningful past-tense business facts after state change, not commands, CRUD notifications, or every property change.
- Event payloads should preserve local model meaning and be versioned or translated at boundaries.
- Use DTOs, projections, use-case queries, or adapters when client needs differ from aggregate shape; do not expose aggregate internals to satisfy representation pressure.
- Root methods must be named state transitions, protect child collections, advance the root version for internal changes, and record domain facts without publishing directly to a broker.
- A Factory must atomically create a valid aggregate when construction is genuinely complex; it must not hide a long workflow, commit, or publish.
- Match Repository contract to store semantics. Collection-oriented repositories rely on Unit of Work/change tracking; persistence-oriented stores require an explicit `save(root, expectedVersion)`. Do not pretend these obligations are interchangeable.
- Use a dedicated query/read model for views spanning aggregates. Do not load full aggregates merely to render reports or serialize a client DTO.

## Transactions And Consistency
- Application service owns transaction boundary.
- One command usually equals one transaction (see Minimal DDD: aggregates exist for transactionally consistent invariants).
- Cross-aggregate rules use events, compensation, or eventual consistency.
- Distributed transaction is not the default.
- Async handlers must be idempotent and tolerate duplicates, retries, out-of-order delivery, and partial failure.
- Expected-version concurrency protects aggregates and event streams.
- Persist aggregate change and outbound integration work in the same local transaction. Never direct-dual-write database and broker and assume the gap cannot fail.

## Reliable Events And Long Processes
Separate a Domain Event in local language from a stable external Integration Event. Translate after commit/outbox so external schemas do not freeze aggregate internals.

For every durable event include only necessary facts plus event ID/type/schema version, occurred-at time, aggregate identity/version, and applicable tenant/correlation/causation. Exclude ORM proxies, secrets, and unnecessary PII.

Use a transactional outbox or equivalent durable event log:
1. Persist domain state and pending event atomically.
2. Relay unprocessed events.
3. Publish with retry.
4. Advance a durable cursor/mark.
5. Accept duplicate delivery and make consumers idempotent.

Consumer processing needs an atomic inbox/dedup claim plus domain write where possible. A single “last message ID” is insufficient for out-of-order delivery. Carry aggregate/stream version, detect gap/duplicate/stale events, and quarantine or fetch missing data rather than applying blindly.

Define subscriber failure classification, bounded retry/backoff/jitter, acknowledgement after durable success, DLQ/quarantine contents, replay, retention, and correction. Swallowing a handler exception as success is data loss.

Use a Process Manager/Saga only for a multi-transaction workflow with waiting, timeout, branch, or compensation. Persist process/correlation ID, state/version, processed message IDs, deadlines/next retry, completed steps, compensation, last error/trace, terminal/abandoned state, and repair/retention.

Timers must be durable and rebuildable after restart. A late result needs explicit accept/ignore/compensate semantics. Compensation is a new idempotent domain command, not rollback, and requires its own failure/quarantine path.

## CQRS And Event Sourcing Gates
Use the smallest CQRS first when read and write shapes materially differ: commands use application/domain/repository; queries use purpose-built SQL/projection DTO, possibly in the same database.

Split stores and update projections asynchronously only when scale, deployment, or autonomy evidence pays for lag/rebuild/operations. Projection handlers must be idempotent, order/gap-aware, rebuildable from zero, catch up while live updates continue, version their schema, expose freshness/as-of, and preserve authorization.

Use Event Sourcing only when immutable ordered change history is the authoritative state and time reconstruction/reprojection is core value. An outbox or audit log alone is not Event Sourcing.

Require atomic expected-version append, deterministic side-effect-free replay, event-schema/upcaster compatibility, durable subscriptions/checkpoints, backup/restore/integrity, and observable stream length/replay/append/lag/rebuild.

Add snapshots only after measured replay p95/p99 requires them. Treat a snapshot as discardable derived state with stream version and schema lifecycle. Recheck aggregate boundaries before masking huge streams.

Do not bundle events, CQRS, and Event Sourcing. Each has an independent trigger and stop condition.

## Dependency Injection
- DI separates object graph composition from object behavior.
- Composition Root is the only place that knows concrete wiring.
- Consumer should declare dependencies explicitly through constructor injection.
- Do not inject containers, registries, service locators, or ambient mutable context into business code.
- Stable dependencies can be constructed directly; volatile dependencies should be injected.
- Property injection is only for optional dependencies with safe defaults.
- Constructor over-injection signals excessive responsibility; split responsibility or introduce a real domain concept.
- Lifetime must match operation boundary; singleton must not capture scoped, disposable, or non-thread-safe dependencies.
- Prefer decorators for logging, validation, authorization, auditing, caching, retry, and circuit breaker.
- Use DI container as composition tool, not as design repair.
- Classify before injecting: stable local implementation, volatile boundary, or runtime data. Runtime values belong in method/command/context data, not in a container registration.
- Require `consumer lifetime <= dependency lifetime`; a long-lived object must not capture a shorter-lived, disposable, tenant/request-specific, or non-thread-safe dependency.
- Define disposal ownership. The creator/container usually disposes what it owns; borrowed dependencies are not disposed opportunistically by consumers.
- Decorator order is behavior: authorization, validation, transaction, retry, cache, telemetry, and audit can change result or side effects when reordered. Test the actual object graph and deliberate broken order/lifetime/registration cases.
- Use Pure DI for small explicit graphs. Use a container when graph size, scopes, decorators, or late binding produce real value; verify registrations at startup/composition tests rather than waiting for a runtime request.
