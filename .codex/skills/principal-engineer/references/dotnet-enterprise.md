# .NET / ASP.NET Core Enterprise Notes

> Source status: legacy-modernization and analyzer guidance is grounded in the corpus
> (Refactoring with C#); ASP.NET Core and EF Core specifics are practice-based defaults —
> verify API details against current Microsoft docs, and always defer to this repo's existing
> conventions over these defaults.

## Contents
- Scope
- Dependency Injection And Composition
- Layering And Project Structure
- ASP.NET Core API Design
- EF Core And Data
- Async And Background Work
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
- Transactions: one aggregate per transaction as the default (see `enterprise-api-domain-model.md`); `SaveChanges` is the unit-of-work boundary — multiple `SaveChanges` in one operation is a partial-failure design decision, make it explicit.

## Async And Background Work
- Async all the way: blocking on async (`.Result`, `.Wait()`, `GetAwaiter().GetResult()`) risks thread-pool starvation and deadlocks; if a sync boundary is unavoidable, isolate and comment it.
- Propagate `CancellationToken` through I/O paths; a cancellable request that ignores its token still burns the resources the caller tried to reclaim.
- Long-running work belongs in `BackgroundService`/hosted services with graceful shutdown handling, not in fire-and-forget tasks from request handlers (unobserved exceptions vanish); queue + worker beats in-process fire-and-forget when work must survive restarts (see `runtime-ops-diagnostics.md` for retry/idempotency semantics).

## Testing
- Prefer integration tests through `WebApplicationFactory` for API behavior (routing, filters, serialization, auth all participate) over controller unit tests that mock the pipeline away.
- Test data access against a real database (container-based) for query semantics; the in-memory provider diverges on relational behavior — use it only where relational semantics do not matter.
- Contract-test the wire format (snapshot or schema assertions) when external consumers exist.

## Legacy .NET Modernization
- Modernize with analyzer-guided, incremental refactoring: enable analyzers/code-style enforcement, fix by category with characterization tests around unclear behavior (corpus-grounded: Refactoring with C#, Parts 2-4).
- Adopt nullable reference types module-by-module with `#nullable` boundaries, not solution-wide in one diff; each enablement is a real audit of that module's null contract.
- Framework→Core migrations are Phase 0-5 initiatives (`playbook-phased-delivery.md`): inventory API surface and dependency compatibility first; strangler routing beats big-bang rewrites (see `architecture-system-design.md`).

## Anti-Patterns
- Singleton-captured scoped service; `IServiceProvider` passed around as an argument.
- EF entities as API DTOs; lazy loading inside a loop; migrations edited after being applied.
- `async void` outside event handlers; fire-and-forget `Task.Run` for work that must not be lost.
- God `Startup`/`Program` with hundreds of unordered registrations and no composition structure.
- "Repository over EF Core" wrappers that re-expose `IQueryable` — a pass-through layer adding names without hiding anything (see shallow-wrapper rules in `SKILL.md` Design Heuristics).
