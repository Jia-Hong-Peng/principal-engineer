# Implementation And Code Quality

## Contents
- Core
- Change Discipline
- Structure
- Functions
- Naming
- State And Data
- Errors
- Tests
- Refactoring
- Debugging
- Performance
- Review
- Anti-Patterns

## Core
- Optimize for code that is correct, readable, testable, maintainable, and safe to change.
- Correctness beats cleverness, brevity, and style preference.
- Code is read more than written; name and structure for the next maintainer.
- Lower complexity before adding machinery.
- Do not abstract until there is real variation or stable repetition.
- Do not optimize without measurement and a known hot path.
- Follow local project style, tools, structure, and conventions.
- Treat reduced cognitive load as a construction outcome: fewer hidden facts, fewer jumps, fewer caller obligations, and clearer ownership.
- Own the result: surface risks and tradeoffs instead of blaming tools, framework defaults, schedule pressure, or existing code.
- Keep one authoritative representation for each system fact; derive, generate, validate, or trace duplicates instead of letting them drift.

## Change Discipline
- Identify the behavior change before editing.
- Make small changes that compile and test between steps when possible.
- Separate structural changes from behavior changes when feasible.
- Tidy only when it directly makes the next change cheaper or safer.
- Stop tidying once the behavior change is easy enough.
- Do not do aesthetic rewrites, broad cleanup, or speculative refactors.
- If behavior and structure are tangled, either split commits or explicitly explain why they cannot be separated.

## Legacy Change Discipline
- Treat any area without trustworthy tests as legacy risk, even if the code is new.
- State the requested behavior delta and the behavior that must be preserved before editing.
- Follow the loop: find the change point, check protection, characterize unclear behavior, create the smallest useful seam, break the blocking dependency, change behavior, then refactor locally.
- Use characterization tests when consumers may depend on ugly or unclear behavior.
- Choose seams for sensing, separation, or both; avoid magical public-for-test or subclass-only seams unless there is a cleanup path.
- Break the first real testability barrier: constructor work, hidden allocation, global state, static construction, time, randomness, files, network, database, framework object, or hard parameter.
- When direct edits are risky, add behavior with sprout or wrap techniques, then fold temporary structure back once tests support safer design.
- Do not rewrite, rename broadly, or format large legacy areas while the current behavior is still poorly understood.

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
- Avoid primitive obsession for money, ID, date ranges, status, quantity, percentage, and permissions.
- Keep mutable shared state out of core logic.
- Isolate global state, time, randomness, I/O, and environment behind boundaries.
- Choose data structures by access pattern, invariants, and change cost.

## Errors
- Treat error handling as design, not afterthought.
- Validate untrusted input at boundaries.
- Separate recoverable errors, domain rule violations, infrastructure failures, and programming errors.
- Do not swallow exceptions, return fake success, or lose diagnostic context.
- Error messages need useful context without leaking secrets, tokens, connection strings, SQL, paths, or internals.
- Test normal path, error path, boundary values, invalid input, and state transitions.
- Resource cleanup must be deterministic: using, defer, finally, RAII, or equivalent.

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
- Negative paths are first-class: validation failures, unauthorized/denied access, rejected input, dependency failures, catch branches, and early returns need tests when touched.
- Edge coverage should include null, empty, zero, negative, one item, max size, unicode, special characters, and concurrency where the code can observe them.
- Tests must not depend on shared mutable state, order, wall clock, timezone, locale, random data without seed, real networks, or sleep-based timing.
- Security enforcement tests should prove denial, malicious-input rejection, rate-limit blocking, CSRF/CORS behavior, webhook signature failure, and sanitized output where relevant.
- Changed public functions, handlers, jobs, utilities, and API-facing code need direct contract coverage unless stronger integration coverage already proves the same behavior.
- Test names should describe concrete domain behavior, not implementation mechanics.
- Use real objects for pure domain behavior; use fakes or integration tests for boundaries where mocks would only prove the mock configuration.
- Contract tests are valuable when multiple implementations must obey one interface: in-memory and database repositories, payment gateways, storage adapters, message publishers, feature flags, or SDK clients.
- Test builders are useful when setup noise hides the behavior under test; keep them domain-specific and avoid hiding required fields or invalid defaults.

## Refactoring
- Refactoring preserves external behavior unless explicitly fixing a bug.
- Before refactoring, understand current behavior and test safety.
- Extract by intent, not by arbitrary line count.
- Remove duplication only when meaning and change reason are the same.
- Keep temporary duplication when rules may diverge.
- Long routine: split by intent and abstraction level.
- Large class: split by responsibility and change reason.
- Data clump: create a meaningful type.
- Feature envy: move behavior toward the data or concept it uses.
- Shotgun surgery: improve boundary, ownership, or dependency direction.
- Large migration: use adapter, facade, feature flag, parallel run, and exit plan.
- Diagnose the smell before choosing a technique: symptom, maintenance cost, scope, cleaner end state, verification path, and stop condition.
- Use the smallest named treatment that reduces the diagnosed smell; escalate only when smaller moves are blocked.
- Preserve public compatibility or provide a transition path when changing signatures, constructors, visibility, type hierarchy, serialized shape, plugin points, or externally reachable APIs.
- Before extraction or movement, identify inputs, outputs, mutated variables, callers, visibility, construction paths, and invariants.
- Before condition consolidation or algorithm substitution, verify side effects, ordering, truth tables, edge cases, and performance-sensitive behavior.
- Stop when the named smell is gone or the requested change is safe; record unrelated smells separately.

## Debugging
- Reproduce before changing.
- Describe the symptom, scope, timeline, input, and expected behavior.
- Trace data flow, state flow, and call chain backward to the earliest wrong fact.
- Change one variable at a time.
- Convert reproducible bugs into tests.
- Search for sibling defects after fixing one root cause.
- Use bisection or version history when the introduction point matters.
- Fix root cause; do not only suppress the symptom.
- Debug from reproduced facts: observe, isolate, explain, fix, and verify before blaming compilers, operating systems, libraries, vendors, or environments.
- If code works for reasons nobody can explain, prove the behavior with data before depending on it.

## Performance
- First make it correct and clear.
- Then measure with representative data and release-like settings.
- Locate bottleneck before optimizing.
- Prefer algorithm, data structure, I/O, network, and database fixes before micro-optimization.
- Cache only when invalidation, memory, freshness, and failure behavior are designed.
- Concurrency increases state and timing complexity; encapsulate it.
- Re-measure correctness and performance after optimization.

## Review
- Review order: behavior bug, security, data loss, transaction consistency, concurrency, contract break, dependency direction, boundary leak, tests, maintainability, naming, style.
- Findings must include concrete risk and actionable fix.
- Do not block on style when formatter/linter should decide.
- Do not request broad refactor without explaining the risk it reduces.
- If no issue, say so and name residual test or runtime risk.
- In legacy areas, review no tests around modified logic, mixed structural and behavioral edits, hard-coded collaborators, global/static reach-through, constructor side effects, and business logic trapped in framework entry points as change-safety risks.
- In refactoring patches, verify the patch has a named smell, behavior preservation evidence, reviewable steps, and a stop condition.
- Before finalizing a change, run a scope-aware pre-landing prevention pass for staff-review catch points: test gaps, dead code, magic literals, stale comments, duplicated setup, conditional side effects, boundary violations, and unverified claims.
- When introducing enum/status/mode/type values, search sibling values and read all consumers outside the diff before claiming completeness.
- Conditional side effects are review blockers: if one branch updates state, emits events, logs success, invalidates cache, or records audit data, verify sibling branches preserve the same required invariants.
- Review new abstractions with the same suspicion as new behavior: name the variation point, current consumers, hidden cost, contract, and why local duplication or a direct call is not safer.
- Review inheritance and interface changes for LSP/ISP failures: unsupported operations, weakened preconditions, stronger caller obligations, changed error semantics, lifecycle surprises, or implementations that only satisfy tests by accident.

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
