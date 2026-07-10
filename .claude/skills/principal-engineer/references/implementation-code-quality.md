# Implementation And Code Quality

## Contents
- Core
- Cognitive Load And Complexity Budget
- Structure
- Responsibility And Object Design
- Functions
- Naming
- State And Data
- Functional Core And Effect Boundary
- Defensive Boundaries And Resources
- Errors
- Tests
- High-Information Verification
- Algorithm, Cache, And Concurrency Mechanics
- Technical Slice, Deletion, And Public Surface
- AI And Generated Change Gate
- Review
- Anti-Patterns

## Core
- The current playbook owns the active subtask's baseline, execution order, scope, and verification; it completes the request only when primary and otherwise returns upward. Use this reference only for the active construction or code-quality decision, then return to the playbook.
- Lower complexity before adding machinery; do not abstract until there is real variation or stable repetition.
- Treat reduced cognitive load as a construction outcome (fewer hidden facts, fewer jumps, fewer caller obligations, clearer ownership), and keep one authoritative representation for each system fact — derive, generate, validate, or trace duplicates instead of letting them drift.
- Define clean code by evidence: a reader can reconstruct behavior and cost, a change stays within the owning concept, and verification can distinguish a correct implementation from plausible wrong ones.
- Treat style, SOLID, object rules, functional techniques, and patterns as pressure probes. Apply the technique only when it removes a named failure or reasoning cost in the current repository.

## Cognitive Load And Complexity Budget
- Budget facts a reader must hold simultaneously: state, inputs, invariants, side effects, error paths, dependencies, and lifecycle.
- A useful boundary lowers total facts and caller obligations. A boundary that only renames a call adds navigation cost.
- Separate local complexity from global interaction complexity. A locally simple method can still participate in an untraceable workflow; a locally complex parser can be acceptable when it concentrates unavoidable detail behind a small contract.
- Diagnose complexity along multiple dimensions: decision paths, nesting, parameter/state count, fan-out, mutation/effects, temporal coupling, navigation distance, and evidence gap.
- Combine those signals with change frequency, co-change, defect/incident history, runtime importance, and blast radius. Do not optimize a static metric in isolation.
- Prefer a deep function/module that hides a complete decision over a chain of tiny functions that expose all intermediate steps.
- Keep the main path top-down. Isolate rare compatibility, recovery, performance, and provider quirks from common reasoning.

## Structure
- A module/class/function should have one clear responsibility and one main reason to change.
- Keep related code close; split unrelated responsibilities.
- Public interface should expose capability, not implementation detail.
- Hide data structures, algorithms, external dependencies, and persistence details.
- Prefer composition over inheritance except for stable behavioral substitution.
- Avoid god objects, manager/helper/util dumping grounds, train wreck calls, and long method chains.
- Use vertical slices or feature organization when technical layering scatters one use case across too many places.
- Prefer deep modules: a small interface that hides substantial internal detail is better than many shallow helpers.
- Remove middle men and forwarding layers unless they protect a real boundary, volatile structure, or policy.
- Do not split code mechanically by line count; split when the new boundary captures a concept and lowers total reasoning cost.
- Keep volatile details behind stable interfaces: storage shape, protocols, cache behavior, file formats, vendor quirks, and performance hacks.

## Responsibility And Object Design
- Start from responsibilities: what the code knows, does, decides, coordinates, persists, validates, or translates.
- Name the role before adding a type: entity, value object, collection, use case, repository, gateway, mapper, coordinator, controller, or adapter.
- If a class can only be described with "and", check whether it mixes policy, orchestration, persistence, presentation, validation, or integration.
- Put behavior near the concept whose invariant it protects; avoid callers querying internals and reimplementing the rule outside the owner.
- Use value objects for important domain primitives such as money, IDs, date ranges, percentages, quantities, permissions, emails, statuses, and credentials when they carry validation, comparison, formatting, or invariant risk.
- Do not wrap every primitive by default. Wrap when the type removes ambiguity, prevents invalid state, or centralizes repeated validation.
- Prefer composition for swappable behavior, optional capabilities, and policy variation. Use inheritance only when substitutability is stable and tested.
- Treat object-calisthenics rules as smells, not laws: deep indentation, long parameter lists, train-wreck calls, excess mutable fields, and getter/setter data bags need diagnosis before refactoring.
- Repeated type switches should trigger a choice: keep as a table for simple stable data, use polymorphism/strategy for recurring behavior variation, or redesign the boundary if switches are duplicated across consumers.
- Fat interfaces, optional methods, `NotImplemented`, and empty implementations usually mean the port is shaped around the provider instead of the client.

## Functions
- Function name should state intent or result.
- Function should operate at one abstraction level.
- Separate command from query when practical.
- Avoid boolean flag parameters; split or name the mode.
- Keep parameters few; use parameter object when the group has meaning.
- Avoid output parameters; return values or explicit result objects.
- Use guard clauses to reduce nesting.
- Convert complex conditions to named predicates or table-driven rules.
- Do not hide important side effects behind innocent names.
- Make cost visible in names and contracts: loading, remote work, retry, allocation, blocking, mutation, and destructive action must not masquerade as a cheap query/getter.
- Keep evaluation at one abstraction level. Do not mix domain decisions with JSON, SQL, HTTP, retry loops, or framework callbacks in the same flow.
- A short function is not automatically cohesive; split by intent, lifecycle, or effect boundary, not a line count.

## Naming
- Use precise, searchable, domain-aligned names.
- Use one word for one concept; do not use one word for different concepts.
- Avoid vague names: data, info, temp, obj, helper, manager, processor unless they are truly domain terms.
- Avoid unnecessary abbreviations.
- Boolean names should answer a true/false question.
- Scope controls length: broader scope needs clearer names.
- Naming failure usually signals design failure.

## State And Data
- Prefer immutable values and explicit state transitions.
- Minimize variable scope, lifetime, mutability, and semantic reuse.
- Initialize variables at declaration when possible.
- Use types to encode constraints and prevent invalid states.
- Keep mutable shared state out of core logic.
- Isolate global state, time, randomness, I/O, and environment behind boundaries.
- Choose data structures by access pattern, invariants, and change cost.
- Distinguish absent meanings when they drive different behavior: unknown, not applicable, not yet supplied, cleared, not found, and failed are not one `null`.
- Model lifecycle with explicit states and transition methods when behavior depends on history/order. Avoid both combinatorial mega-enums and unconstrained boolean state bags.
- Treat derived state as a cache/projection with an authoritative source, invalidation trigger, freshness meaning, drift detection, reconciliation, and rebuild.
- State numerical unit, precision, range, rounding, and overflow. State text encoding, normalization, comparison/case, and byte/code-point/grapheme length where it matters.
- If an index/slot/handle can be recycled, include a generation/version and validate both. A deleted stale handle must not silently address a new object occupying the same slot.

## Functional Core And Effect Boundary
- Map current state, pure decisions, and effects. Move deterministic policy into a functional core and keep database, network, filesystem, clock, random, UI, logging, and message effects in an imperative shell when that lowers coupling.
- Represent state as an immutable snapshot when historical versions, sharing, concurrency, caching, or replay benefit. Do not copy large structures blindly; measure structural sharing, locality, allocation, and GC.
- Let a transition return next state plus explicit commands/events/errors when the shell must execute effects. Do not execute remote effects from a supposedly pure transition.
- Use typed expected failures (`Result`, discriminated union, equivalent) when callers must branch. Use exceptions for abnormal failures that cannot be handled locally. Do not force both mechanisms on every caller without a clear boundary.
- Treat laziness as deferred cost and deferred failure. Define evaluation time, repetition/memoization, resource lifetime, exception timing, and materialization bound.
- Choose recursion only when input depth is bounded or the language/runtime provides proven tail-call behavior for the exact form. For unbounded or adversarial depth, use iteration, a trampoline, or an explicit stack; verify representative maximum depth, CPU, memory, and stack behavior.
- Immutable data does not eliminate races around ordering, stale reads, multiple writers, external effects, or compare-and-set. Keep concurrency invariants explicit.
- Use property/model-based tests for algebraic rules, state machines, round trips, idempotency, monotonicity, and conservation. Preserve failing input and seed.

## Defensive Boundaries And Resources
- Define trust transitions rather than sprinkling defensive checks everywhere. Validate and normalize external input once at the owning boundary, then construct a valid internal type.
- Use preconditions, postconditions, invariants, schemas, and database constraints where each has authority. Assertions are for programmer-impossible internal states, not user rejection, dependency timeout, or normal resource exhaustion.
- For parser size/overflow/text, unsafe/native/FFI ownership, and resource exit-path mechanics, read `engineering-evidence-and-delivery.md` Correctness Construction; those mechanics are canonical there.

## Errors
- Treat error handling as design, not afterthought.
- Validate untrusted input at boundaries.
- Separate recoverable errors, domain rule violations, infrastructure failures, and programming errors.
- Do not swallow exceptions, return fake success, or lose diagnostic context.
- Error messages need useful context without leaking secrets, tokens, connection strings, SQL, paths, or internals.
- Test normal path, error path, boundary values, invalid input, and state transitions.
- Resource cleanup must be deterministic: using, defer, finally, RAII, or equivalent.
- Use a stable failure taxonomy: invalid input, domain rejection, authorization denial, concurrency conflict, transient dependency, permanent dependency, saturation, corrupt data, programming defect, cancellation/deadline, unknown remote outcome.
- Let the category decide retry, alert, response, audit, quarantine, and repair. Do not translate every failure to not-found, null, empty, or try-later.
- Catch only to recover, add actionable context, or translate at a real boundary. Preserve cause and stack; avoid logging the same failure at every layer.
- Every asynchronous task/future/promise must be awaited, returned, joined, or assigned an owner, failure sink, shutdown behavior, and observability. Fire-and-forget is an operational component.
- For parallel branches define fail-fast, collect-all, or partial success. Propagate cancellation and prevent timed-out work from creating duplicate effects.

## Tests
- Tests provide feedback; they do not create quality by themselves.
- Add tests where behavior, risk, or refactoring needs protection.
- Unit tests should be fast, isolated, repeatable, and diagnostic.
- Integration tests should verify real boundaries: database, repository, API, queue, filesystem, or external contract.
- E2E tests should cover few high-value journeys, not every branch.
- Test behavior and contract, not incidental implementation.
- A bug fix should add a regression test when practical.
- Hard-to-test code often signals hidden coupling, excess responsibility, or side effects in the wrong place.
- Coverage is a signal, not proof.
- Gate-level test requirements are selected from `pre-landing-review-prevention.md` Required Gates; apply only the rows triggered by the touched surfaces.
- Test names should describe concrete domain behavior, not implementation mechanics.
- Use real objects for pure domain behavior; use fakes or integration tests for boundaries where mocks would only prove the mock configuration.
- Contract tests are valuable when multiple implementations must obey one interface (e.g., an in-memory and a database repository, or adapters for the same external service).
- Test builders are useful when setup noise hides the behavior under test; keep them domain-specific and avoid hiding required fields or invalid defaults.

## High-Information Verification
Choose cases that eliminate plausible wrong implementations:
- Equivalence classes plus below/at/above boundaries.
- First/middle/last, zero/one/many, duplicate, missing, unknown, invalid, and maximal values.
- Data-flow paths, decision/control paths, state transitions, failure/cleanup paths, and concurrency conflicts.
- Deliberately wrong implementation or mutation check for critical rules: prove the test fails when comparison, branch, authorization, event, or invariant is broken.
- Property tests for round-trip, idempotency, commutativity/order sensitivity, monotonicity, conservation, and model agreement.
- Fuzz/metamorphic tests for parsers, serializers, query/config/template languages, native boundaries, and untrusted files.

Do not reproduce the production algorithm in the test oracle. Prefer independent examples, invariants, a simpler reference model, or differential comparison.

Snapshot tests are broad characterization, not automatic approval. Normalize only volatile data, review every update, and add focused assertions for high-risk semantics.

Flaky evidence is a defect. Preserve the first failure, classify environment/test assumption/product race/nondeterminism, and make input/time/order reproducible. Do not use rerun-until-green as the fix.

## Algorithm, Cache, And Concurrency Mechanics
- Prefer algorithm, data structure, I/O, network, and database fixes before micro-optimization.
- Cache only when invalidation, memory, freshness, and failure behavior are designed.
- Concurrency increases state and timing complexity; encapsulate it.
- Calculate the theoretical maximum end-to-end gain before micro-optimizing a small fraction of work. Stop when the local speedup cannot materially move the quality contract.
- Treat cache as derived state and authorization context: define key, freshness, invalidation, negative/error caching, TTL/capacity/eviction, stampede, cold start, multi-node consistency, and unavailable behavior.
- Treat concurrency as a capacity experiment, not free speed. Measure pool/queue/lock/downstream saturation, context switching, memory, tail latency, and rejection after changing worker count.

## Technical Slice, Deletion, And Public Surface
Use a minimum end-to-end technical slice to attack the most dangerous unknown in integration, deployment, data, security, or performance. Define the slice outcome, representative environment, quality floor, evidence, shortcuts, and production/delete exit gate.

Delete before abstracting when a feature, flag, branch, compatibility path, dependency, option, or generated artifact is proven unnecessary. A deletion gate requires static callers plus dynamic entry review (reflection, plugins, routes, jobs, config, templates, serialization, external consumers), build/tests, and runtime usage when static proof is insufficient.

Every public option or extension point creates permanent test, documentation, compatibility, security, and support cost. Add one only for a current consumer variation with bounded semantics. Prefer a private closed API until the need is proven.

For a large change require a material benefit against a measured current state. Use adapter, parallel/differential run, canary, and removal criteria instead of a flag that preserves two systems indefinitely.

## AI And Generated Change Gate
Treat AI-generated code as an untrusted high-throughput proposal. Require it to:
- Cite the repository facts and contracts it relied on.
- Preserve user changes and local conventions.
- Compile/type-check and pass focused tests/analyzers.
- Prove public/data/error/concurrency/security compatibility for touched surfaces.
- Avoid invented APIs, versions, packages, requirements, and callers.
- Inspect the final diff for placeholders, fake success, unsupported branches, broad suppressions, test-only production hooks, secrets, and accidental generated-file edits.
- Search for sibling consumers and update all authoritative copies.

For machine translation or code generation, verify semantics across language/runtime boundaries: numeric width/sign/overflow, null/default, equality/hash/order, string/byte encoding, exceptions/results, async/cancellation, ownership/disposal, FFI layout, and platform-dependent behavior.

Use `engineering-evidence-and-delivery.md` for deterministic generator, build, artifact, and release gates.

## Review
- Review order: behavior bug, security, data loss, transaction consistency, concurrency, contract break, dependency direction, boundary leak, tests, maintainability, naming, style; findings need concrete risk and an actionable fix, style is not a blocker when a formatter/linter should decide, and a broad-refactor request needs the risk it reduces named.
- In legacy areas, treat no tests around modified logic, mixed structural/behavioral edits, hard-coded collaborators, global/static reach-through, constructor side effects, and business logic trapped in framework entry points as change-safety risks; in refactoring patches, verify a named smell, behavior-preservation evidence, reviewable steps, and a stop condition.
- If no issue, say so and name residual test or runtime risk. Before finalizing, apply the triggered enum, effect, and abstraction rows in `pre-landing-review-prevention.md` Required Gates; do not finalize with a required gate unverified.
- A valid finding states trigger, mechanism, observable failure/change cost, affected contract, smallest fix, and required proof. A smell or metric without a mechanism is only an investigation lead.

## Anti-Patterns
- Clever code that saves characters but increases reasoning cost.
- Deep nesting with hidden exceptional paths.
- Global mutable state and ambient context.
- Public setters on domain state.
- Service locator and hidden dependencies.
- Dead code and permanent compatibility layers.
- Comments that compensate for bad naming.
- Tests that only cover happy path.
- Feature flags without owner, default, expiry, or cleanup.
- One large PR mixing feature, refactor, formatting, and dependency churn.
- Shallow wrappers, helpers, or services that only forward calls.
- Principle-driven churn: adding interfaces, factories, value objects, patterns, or inheritance because they sound "SOLID" without reducing current risk or caller complexity.
- Fat ports that combine read, write, admin, batch, streaming, and optional behavior until every implementation lies about what it supports.
- Mocking around untestable structure without reducing the dependency knot.
- Temporary seams, probes, subclass tricks, and compatibility layers with no cleanup obligation.
- Prototype, generated, or scaffolded code silently becoming production truth without being inspected and hardened.
- Tests that pass only because order, clock, external service, locale, or randomized data happened to cooperate.
- Success logs, events, cache invalidations, or related-record updates that fire only on the happy path when failure or edge paths require them too.
- Partial implementations where missing edge cases, negative tests, or straightforward consumers are left for later without a real scope boundary.
- Getter/query names that conceal remote I/O, mutation, retries, blocking, or unbounded work.
- Assertions used as validation for untrusted input or normal failure.
- `null`, empty, zero, default, and catch-all errors used to erase distinct domain or failure meaning.
- Async work with no owner, bounded queue, cancellation, failure sink, or shutdown path.
- Generated output that is manually patched, nondeterministic, stale, or tested only by a generator-derived oracle.
- AI changes accepted because they are plausible rather than because repository-native evidence falsified likely mistakes.
