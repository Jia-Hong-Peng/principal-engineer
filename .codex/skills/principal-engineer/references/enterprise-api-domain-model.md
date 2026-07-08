# Enterprise API And Domain Model

## Contents
- Enterprise Patterns
- Pattern Selection
- API Design
- API Compatibility
- API Security
- Gateway And Mesh
- Minimal DDD
- Bounded Context And Language
- Domain Objects
- Transactions And Consistency
- Dependency Injection

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

## API Design
- API is a long-lived contract, not a transport dump.
- Design public APIs for stability, documentation, security, compatibility, and versioning.
- Design internal APIs for explicit contracts, performance, ownership, and observability.
- REST fits public resource-oriented APIs.
- gRPC fits controlled internal low-latency contracts.
- GraphQL fits client-driven query aggregation, not universal API replacement.
- AsyncAPI/events fit asynchronous integration and event contracts.
- Do not expose PII, tokens, secrets, stack traces, SQL, internal paths, or diagnostic internals.
- Return consistent error bodies with status, code, message, and trace ID.
- Wrap collections in objects when evolution requires metadata, pagination, or links.

## API Compatibility
- Treat public fields, status codes, error semantics, pagination, auth requirements, event schemas, and gRPC field numbers as contracts.
- Breaking changes include removing fields, renaming fields, changing types, adding required fields, reusing gRPC field numbers, and changing error meaning.
- Add optional fields for compatible evolution when consumers can ignore them.
- Reserve removed gRPC fields and numbers.
- Deprecate before removal; provide deadline, replacement, and migration path.
- Use OpenAPI/AsyncAPI/Protobuf contracts for docs, mocks, validation, generated clients, and CI diff.
- Contract tests should cover status, body, headers, auth, pagination, empty state, errors, and compatibility.
- Adding required parameters, changing HTTP methods, default limits, page shape, auth requirements, webhook payloads, or error format is a breaking-change risk unless versioned or bridged.
- Older clients, mobile apps, SDKs, generated clients, subscribers, and mixed-version deploys must be considered before changing contract semantics.
- Documentation drift is contract drift: update OpenAPI/Swagger, README, examples, SDK notes, and generated clients when behavior changes.

## API Security
- Authentication identifies caller; authorization decides allowed action.
- API keys identify applications, not users.
- Access tokens should be short-lived, scoped, revocable, and audience-checked.
- Validate JWT signature, issuer, audience, expiration, not-before, and required claims.
- Scope is coarse permission; still enforce object-level and function-level authorization.
- Check BOLA, BFLA, mass assignment, excessive data exposure, injection, broken auth, DoS, and sensitive data in URL.
- Use allowlist validation for input, output, and writable fields.
- Default deny; explicitly allow.
- Gateway controls ingress policy but never replaces service-level authorization.
- Audit security-sensitive actions with actor, target, result, reason, and trace ID.
- Validate user input, query parameters, request bodies, file uploads, webhooks, external responses, and LLM/tool outputs at trust boundaries before persistence or downstream action.
- Webhook processing needs signature verification and replay protection when supported.
- User-controlled URLs, redirects, webhook targets, and fetches need SSRF protection and allowlists or blocklists for internal ranges.
- Avoid command, template, LDAP, header, path traversal, XSS escape hatch, and unsafe deserialization vectors.
- Secrets, tokens, API keys, credentials, PII, stack traces, SQL, and internal paths must not leak to logs, URLs, errors, user responses, or LLM-visible context.
- Security-sensitive randomness, hashing, encryption, and secret comparison need current primitives: secure RNG, password hashing, salt, constant-time comparison, and no hardcoded keys or IVs.

## Gateway And Mesh
- API Gateway is for north-south traffic: routing, TLS, auth, rate limit, logging, metrics, tracing, policy.
- Do not put domain logic or payload-driven business workflow in the gateway.
- Gateway is critical path; design HA, SLO, audit log, and rollback.
- Service mesh is for east-west service traffic: discovery, mTLS, retries, timeouts, circuit breaking, traffic split, telemetry.
- Do not add mesh for a few simple services or weak operations maturity.
- Mesh handles communication policy, not business authorization or domain workflow.

## Minimal DDD
- Do not use DDD for simple CRUD.
- Create domain model only for complex rules, state transitions, invariants, lifecycle, money, limits, permissions, review, or credentials.
- Create bounded context only when same terms mean different rules, ownership differs, consistency differs, or external semantics pollute local meaning.
- Create aggregate only for invariants that must be transactionally consistent.
- Aggregate root is the only external mutation path.
- One command should usually modify one aggregate.
- Keep aggregates small; do not enlarge for foreign keys or query convenience.
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
- Choose context relationships deliberately: Partnership, Shared Kernel, Customer/Supplier, Conformist, Anticorruption Layer, Open Host Service, Published Language, Separate Ways, or Big Ball of Mud containment.
- Shared Kernel requires small stable overlap, joint ownership, and tests; without governance, choose translation instead.
- Anticorruption Layer means real translation of language, status, protocol, schema, and semantics, not a renamed client wrapper.

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

## Transactions And Consistency
- Application service owns transaction boundary.
- One command usually equals one transaction.
- Strong invariants live inside one aggregate and one transaction.
- Cross-aggregate rules use events, compensation, or eventual consistency.
- Distributed transaction is not the default.
- Async handlers must be idempotent and tolerate duplicates, retries, out-of-order delivery, and partial failure.
- Expected-version concurrency protects aggregates and event streams.

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
