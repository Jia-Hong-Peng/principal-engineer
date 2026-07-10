# .NET / ASP.NET Core Enterprise Notes

> Source status: C# refactoring semantics are grounded in project-provided technical material;
> ASP.NET Core and EF Core specifics are practice-based defaults. Verify version-sensitive SDK
> details against current Microsoft documentation and prefer this repository's tested behavior.

## Contents
- Scope
- Dependency Injection And Composition
- Layering And Project Structure
- ASP.NET Core API Design
- EF Core And Data
- Async And Background Work
- C# Refactoring Semantics
- LINQ And Deferred Execution
- Nullable, Equality, And Records
- Analyzer And Code Fix Safety
- Testing
- Legacy .NET Modernization
- Anti-Patterns

## Scope
- Use this file when the repository is .NET/ASP.NET Core and the task touches solution structure, DI, API surface, data access, async, or modernization. General design rules still come from the other references; this file maps them onto the .NET stack.
- Dedup note: general DI, service-locator, DTO-boundary, and repository rules are canonical in `enterprise-api-domain-model.md` and `implementation-code-quality.md`; bullets here state only the .NET-specific manifestation and cost.

## Dependency Injection And Composition
- Register services with deliberate lifetimes: a singleton holding scoped state (DbContext, per-request cache) is a correctness bug, not a style issue; validate with scope-validation enabled in development.
- Constructor injection for required dependencies; injecting `IServiceProvider` and resolving inside is service-locator — it hides the dependency graph (see `implementation-code-quality.md` Anti-Patterns).
- Bind configuration through the options pattern with validation at startup (fail fast on bad config), not ad-hoc config reads scattered through code (one authoritative owner per config meaning).
- Keep registration in one composition area per host; conditional registrations deserve a comment stating the condition's source.

## Layering And Project Structure
- Split projects only where you need an enforced boundary (dependency direction, internal visibility); folders are cheaper than projects when no rule needs enforcing.
- Keep the domain project free of framework references (no ASP.NET, no EF attributes) when domain complexity justifies a domain layer at all — see `enterprise-api-domain-model.md` for when it does not.
- Dependency direction: API/host → application → domain; infrastructure implements interfaces owned by the inner layers.

## ASP.NET Core API Design
- Controllers vs minimal APIs is a repo convention decision; follow what exists, do not mix per taste.
- DTOs at the boundary; exposing EF entities in responses couples the wire contract to the schema and leaks fields by default.
- Error contract: use ProblemDetails consistently; never leak exception internals; map domain errors deliberately (see `enterprise-api-domain-model.md` API sections for contract/compat rules).
- Version the public API deliberately; removing/renaming a field is a breaking change governed by `pre-landing-review-prevention.md` API And Contract Safety.

## EF Core And Data
- Shape aggregates deliberately: load what the invariant needs (explicit Includes or projections), do not rely on lazy loading in hot paths — it is the classic N+1 source (`pre-landing-review-prevention.md` Performance And Scale).
- Use `AsNoTracking` for read-only queries; tracking thousands of read-only entities is quiet memory and CPU cost.
- Migrations are schema contracts: review generated SQL, never edit an applied migration, and apply the staged-deploy gates in `pre-landing-review-prevention.md` Data Migration Safety for NOT NULL/rename/drop.
- Transactions: one aggregate per transaction as the default (see `enterprise-api-domain-model.md`). A scoped `DbContext` normally carries Unit-of-Work/change-tracking identity; each `SaveChanges` is transactional by default, while multiple calls can still be atomic inside one explicit transaction. Inspect the actual transaction scope, execution strategy/retry, and external effects before classifying partial-failure behavior.

## Async And Background Work
- Async all the way: blocking on async (`.Result`, `.Wait()`, `GetAwaiter().GetResult()`) risks thread-pool starvation and deadlocks; if a sync boundary is unavoidable, isolate and comment it.
- Propagate `CancellationToken` through I/O paths; a cancellable request that ignores its token still burns the resources the caller tried to reclaim.
- Long-running work belongs in `BackgroundService`/hosted services with graceful shutdown handling, not in fire-and-forget tasks from request handlers (unobserved exceptions vanish); queue + worker beats in-process fire-and-forget when work must survive restarts (see `runtime-ops-diagnostics.md` for retry/idempotency semantics).
- Give hosted work a bounded channel/queue, admission policy, durable state when restart survival matters, per-item timeout/cancellation, idempotency, retry/DLQ/repair, and completion/drain behavior. `BackgroundService` is a lifecycle host, not a delivery guarantee.

## C# Refactoring Semantics
- Use compiler-aware rename/move/extract tools, then search strings, attributes, DI registration, reflection, JSON/property names, Razor/templates, configuration, source generators, P/Invoke, and external consumers. A successful compile does not prove dynamic reachability.
- Optional parameter defaults are embedded into compiled callers. Changing a default can leave old binaries using the old value while new callers use the new value; prefer overloads or explicit options for cross-assembly contracts.
- Signature changes must review named arguments, generic inference, overload resolution, interface/base implementation, reflection, expression trees, source/binary callers, and nullable annotations.
- Changing a `using` block to a using declaration can delay disposal from block end to method end. Recheck connection, transaction, stream, lock, and temporary resource lifetime.
- Catch only a type the boundary can handle or translate. Use `throw;` to retain the original stack; `throw ex;` changes diagnostic origin. Preserve the primary exception when cleanup/disposal also fails.
- Primary-constructor parameters remain in type scope but do not automatically become public properties. Compact syntax must not hide validation, lifetime, or ownership.
- Treat `required` and `init` as assignment controls, not content validation or deep immutability. Verify every constructor/factory creates the same invariant.

## LINQ And Deferred Execution
- Select cardinality operators by contract: `First` means at least one, `Single` means exactly one, `FirstOrDefault` permits none and ignores extras, `SingleOrDefault` permits none but rejects extras. Do not replace one with another as a style cleanup.
- Know whether an expression is `IEnumerable` in memory or `IQueryable` translated by a provider. The same method can have different semantics, performance, supported operations, null behavior, and exception timing.
- Deferred queries re-execute on each enumeration and observe current underlying state. Materialize deliberately when a stable snapshot, one database round trip, resource lifetime, or repeated use requires it.
- Audit hidden multiple enumeration, N+1, client-side evaluation, unbounded `ToList`, ordering assumptions, and side-effecting iterators.
- Preserve cancellation in async enumeration/query operations. Do not convert async provider execution into blocking enumeration in a refactor.
- Use loops when they express early exit, mutation, exception handling, or resource lifetime more clearly. LINQ concision is not evidence of lower total complexity.

## Nullable, Equality, And Records
- Enable nullable reference analysis by real boundary/project and ratchet warnings. Start with external inputs/outputs, constructors, required state, then internal flow. Do not blanket-disable warnings or scatter `!` without proof.
- `T?` is a contract; `?.` and `??` encode fallback behavior; `!` only suppresses the compiler and adds no runtime safety.
- If equality is overridden, align `Equals`, `IEquatable<T>` where useful, `GetHashCode`, and public `==`/`!=` semantics. Define null, runtime type/inheritance, and all value components.
- Never mutate fields participating in a hash key after insertion into a dictionary/set.
- Use records for value-oriented immutable messages, DTOs, snapshots, and value objects when generated equality matches the contract. Do not convert identity entities to records for convenience.
- Record `with` is a shallow copy. Nested mutable references remain shared; verify actual immutability, ORM tracking, serialization, and inheritance behavior.
- `ToString`/`DebuggerDisplay` must be cheap, side-effect-free, non-throwing enough for diagnosis, and exclude secrets/PII. Never treat `ToString` as a stable serialization contract.

## Analyzer And Code Fix Safety
Create a custom Roslyn analyzer only when the defect recurs, the syntax/semantic model can detect it objectively, false positives can be controlled, the fix direction is clear, and existing compiler/BCL/mature analyzers do not cover it.

Require a stable diagnostic ID, precise location, actionable message, risk-proportional severity, generated-code policy, thread-safe concurrent execution, and the cheapest applicable syntax/symbol/operation/compilation action.

Analyzer tests must cover valid and invalid code, exact span/ID, generic/partial/nested/record/nullable boundaries, generated code, multiple diagnostics, suppression/severity configuration, and performance on representative large input.

Offer a CodeFix only when it can preserve semantics mechanically. It must preserve trivia/comments/directives/attributes/nullability, honor cancellation, compile after the fix, remove the diagnostic, be idempotent, and support Fix All only for independent order-insensitive edits.

Prefer analyzer NuGet packaging for project-pinned, CI-consistent enforcement. Verify package layout/version/feed/access and rollback; do not rely on a developer-only VSIX for a repository gate.

## Testing
- Prefer integration tests through `WebApplicationFactory` for API behavior (routing, filters, serialization, auth all participate) over controller unit tests that mock the pipeline away.
- Test data access against a real database (container-based) for query semantics; the in-memory provider diverges on relational behavior — use it only where relational semantics do not matter.
- Contract-test the wire format (snapshot or schema assertions) when external consumers exist.
- For EF concurrency, test expected-version conflict and transaction rollback against the real provider. For mapping, test value equality, collection/order, null, precision, identity tracking, delete, and migration behavior.
- For DI, build/validate the real service graph and deliberately break registration, lifetime, and decorator order. Unit tests of individual constructors do not prove composition.
- For a broad refactor, use old/new differential execution on identical inputs with external effects isolated; compare domain meaning, not object reference or volatile IDs/timestamps.

## Legacy .NET Modernization
- Modernize with analyzer-guided, incremental refactoring: enable analyzers/code-style enforcement, fix by category, and protect unclear behavior with characterization tests.
- Adopt nullable reference types module-by-module with `#nullable` boundaries, not solution-wide in one diff; each enablement is a real audit of that module's null contract.
- Framework→Core migrations are Phase 0-5 initiatives (`playbook-phased-delivery.md`): inventory API surface and dependency compatibility first; strangler routing beats big-bang rewrites (see `architecture-system-design.md`).
- Baseline warnings, then require new changes not to add high-confidence correctness/nullability/disposal/security findings. Increase severity by rule/project after the existing set is understood; keep suppressions local and justified.
- Use metrics/analyzers to find hotspots, then combine churn, fan-out, failures, runtime importance, and evidence gaps. Do not refactor solely to lower maintainability index or cyclomatic complexity.
- Read `refactoring-change-safety.md` for B/S/M classification, behavior cards, differential proof, and stop gates before a large C# change.

## Anti-Patterns
- Singleton-captured scoped service; `IServiceProvider` passed around as an argument.
- EF entities as API DTOs; lazy loading inside a loop; migrations edited after being applied.
- `async void` outside event handlers; fire-and-forget `Task.Run` for work that must not be lost.
- God `Startup`/`Program` with hundreds of unordered registrations and no composition structure.
- "Repository over EF Core" wrappers that re-expose `IQueryable` — a pass-through layer adding names without hiding anything (see shallow-wrapper rules in `SKILL.md` Design Heuristics).
- Changing optional defaults, LINQ cardinality, deferred/materialized execution, disposal scope, equality, or nullable behavior under a “mechanical refactor” label.
- Custom analyzer that encodes taste, reports noisy whole-file findings, ignores generated code cost, or offers a destructive/non-idempotent Fix All.
