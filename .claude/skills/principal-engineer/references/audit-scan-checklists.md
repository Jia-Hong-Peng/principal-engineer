# Audit Scan Checklists

Source status: distilled from a maintenance-time corpus of 26 engineering books; predicates rewritten as repository-checkable conditions.

Subordinate contract:
- This file supplies scan predicates only; it declares no completion, owns no ordering, and contains no workflow.
- `playbook-project-optimization.md` step 2 selects individual predicates as probes; use sections wholesale only when the user explicitly requests a full scan.
- The New repository branch of P2 checks its setup against the Day-One Baseline section (advisory candidates, not a completion gate).
- Every hit is a candidate only; it becomes a finding through promotion per SKILL scope rules (trigger, mechanism, impact, owner, evidence), executed at P1 step 3.
- Polarity convention: every predicate is phrased so that YES means healthy; any predicate that cannot be checked off is a candidate.
- During audits every check action takes its read-only form. Any action that executes repository or documented commands, mutates sources (mutation testing, breaking the SUT), enables logging or config on shared systems, runs load/soak/restore drills or fault-injection/chaos experiments, or checks out historical revisions requires explicit authorization and an isolated environment; record such checks as proposed follow-ups instead of executing them.
- Some predicates overlap the touched-surface gate matrix in `pre-landing-review-prevention.md`. That matrix governs landing a specific diff; these sections govern repository-wide scans. When both apply to a touched surface, the matrix wins.

## Day-One Baseline (new repository)

- [ ] Does one documented command from a fresh checkout build and test everything, without IDE buttons? — read README/scripts and the CI definition for a single entry command exercised in CI
- [ ] Do committed setup docs (README/CONTRIBUTING) state prerequisites and target platform, cover run and test steps for a fresh clone, and pin the toolchain via a version file (.nvmrc/.tool-versions/mise) or a devcontainer/bootstrap script, with the documented commands matching those in package.json/Makefile/CI? — read the setup docs and toolchain/bootstrap files and compare the documented commands against the actual scripts, without running them
- [ ] Are warnings-as-errors and the strictest analyzer/null-safety level enabled with zero current warnings? — read compiler/linter config and the latest CI build log
- [ ] Is a linter/formatter config committed and enforced in CI, so style never enters review? — check for config files and the CI step that fails on violation
- [ ] Do CI gates (tests, lint, secret scan, dependency audit) actually block merge? — read pipeline config and branch protection
- [ ] Are config files committed as structure/placeholders only, with startup crashing loudly on missing/invalid values instead of silently defaulting? — read config loading code
- [ ] Does one end-to-end vertical slice (entry point to persistence) exist and deploy before broad build-out? — trace one request path through the layers
- [ ] Are time, randomness, and environment reads injected rather than called inline in business logic? — grep for direct now()/random()/env access outside the composition root

A new repository should also trivially pass every other section; sweep them once the skeleton exists.

## Architecture & Coupling

- [ ] Is the package/component dependency graph acyclic? — trace imports with a static cycle detector (ArchUnit/dependency-cruiser/madge equivalent)
- [ ] Are business-rule modules free of UI, DB, framework, and serialization imports? — grep import/using lists of core modules for infrastructure names
- [ ] Are SQL strings confined to gateway/repository classes? — grep for SELECT/INSERT/UPDATE outside the data layer
- [ ] Is each vendor/cloud SDK name confined to one or two adapter files? — grep each vendor name and count containing files
- [ ] Are declared layering rules enforced by an executable check rather than a diagram? — search for architecture-test config; stated rules with no check is the miss
- [ ] Would removing the data-access module leave the rest compiling? — trace project/package references from domain to data access
- [ ] Do recent feature diffs stay within a vertical slice rather than smearing across every technical layer? — inspect the last ~10 feature commits
- [ ] Is every deployable unit purposefully named (no Other/Misc/Common), with no grab-bag utils module carrying repo-wide fan-in? — rank fan-in in the dependency graph; list deployable unit names
- [ ] Does every cross-service data access go through a contract rather than another service's tables/schemas? — grep connection strings and schema names across service boundaries
- [ ] Can each service be deployed independently, in any order? — read deployment scripts and release docs
- [ ] Does every layer transform or decide something for most requests (no layer where more than 80% of requests pass through untouched)? — sample layer methods for delegation-only bodies as a proxy; confirm with traffic data when available
- [ ] Are shared internal libraries versioned with no LATEST references in build files? — grep build manifests for floating versions
- [ ] Do files that change together sit within one module (in the last ~200 commits, no pairs co-changing 3+ times across module boundaries)? — mine git log for co-change pairs against module boundaries

## API & Contracts

- [ ] Does every operation have its own route (no single endpoint dispatching on a body "action" field)? — read the route table
- [ ] Do error responses carry error status codes (no HTTP 200 with an error payload in the body)? — grep response construction for success codes paired with error fields
- [ ] Do list endpoints return wrapper objects that can grow pagination fields (no bare arrays)? — read list handler return shapes
- [ ] Are external error responses free of stack traces and internal debug fields? — read the exception serializer and error middleware
- [ ] Are URL templates free of email addresses, names, and other PII? — read route definitions
- [ ] Is the API spec (OpenAPI/proto) used for validation, codegen, or mocks rather than only documentation? — read the pipeline for spec-driven steps
- [ ] Does CI fail when a spec field is renamed, removed, retyped, or its wire tag changed? — check for a spec-diff/breaking-change gate
- [ ] Are at most 2 versions of each API simultaneously live, with deprecated versions carrying usage tracking and retirement dates? — list live versions and their deprecation notes
- [ ] Are resource IDs free of embedded API versions? — read route and ID formats
- [ ] Are GET endpoints side-effect-free and PUT/DELETE handlers idempotent? — read handlers registered on those verbs for writes
- [ ] Do consumers tolerate and preserve unknown fields and enum values? — read deserialization config and enum handling
- [ ] Are API resource shapes decoupled from storage tables (no one-to-one schema leak)? — compare representative payloads against table definitions
- [ ] Do providers run consumer-driven contract tests in their own CI? — search test directories and CI config for contract suites
- [ ] Is every contract payload field used by at least one consumer? — cross-reference payload fields against consumer code (requires consumer code; skip when unavailable)

## Domain Model & Data

- [ ] Do core entities carry behavior methods rather than only getters/setters with logic piled in service classes? — sample core entity classes
- [ ] Are monetary amounts in decimal/integer types and other unit-carrying quantities in dedicated types (no cross-addable bare primitives)? — grep money/amount/price fields for float/double; sample unit-carrying signatures
- [ ] Is missing/invalid expressed by explicit types rather than sentinel values (0, -1, 9999, empty string)? — grep comparisons against such literals in domain code
- [ ] Are value objects immutable with equals/hashCode overridden as a pair? — sample value types for setters and equality
- [ ] Does each transaction modify at most one aggregate/consistency unit? — trace transactional methods for multi-root writes
- [ ] Do aggregates reference each other by ID rather than direct object references? — sample cross-aggregate fields
- [ ] Is validation centralized at construction ("parse, don't validate")? — grep null/format re-checks below entry points; repeated re-checks in 3+ layers on one path is the hit
- [ ] Does each domain term carry one meaning per module boundary? — grep a suspect term and compare usages across modules
- [ ] Are timezones expressed as IANA IDs, never fixed offsets or abbreviations? — grep for "+08:00"-style offsets and zone abbreviations used as zones
- [ ] Are future-dated events stored as local time plus zone ID (UTC as derived), not bare UTC? — read the schema for scheduled items
- [ ] Are distinct time concepts (instant, date, duration, period) given distinct types instead of one DateTime? — sample time-valued fields
- [ ] Is domain code free of implicit system-default locale/zone dependence (default-locale formatting, parsing, or case conversion)? — grep default-locale/zone APIs outside the composition root
- [ ] Are primary keys meaningless, immutable surrogates (no SSN/date/business data as PK)? — read table definitions
- [ ] In multi-tenant code, does every repository query carry the tenant ID? — grep finder implementations for tenant parameters
- [ ] Are externally referenced records soft-deleted/disabled rather than physically removed? — read delete flows for hard DELETE on shared entities
- [ ] Do stored fields hold non-expiring source facts (store birthdate and compute age; no 2-digit years or signed 32-bit epoch seconds)? — read schema for derivable or truncated representations
- [ ] Is lifecycle status an explicit state machine with legal transitions, not a pile of booleans and nulls? — grep status/flag fields and their mutation sites

## Distributed Consistency & Workflow

- [ ] Does every remote call site set an explicit timeout aligned with the caller's SLA, and every retry state its idempotency basis? — grep call sites, client construction, and retry wrappers
- [ ] Is a timeout treated as "outcome unknown" rather than "did not happen"? — read client error handling for the timeout branch
- [ ] Is deduplication a single atomic upsert keyed by an upstream-generated persisted ID, not check-then-write? — read consumer/write paths
- [ ] Are event/message payloads complete state snapshots (or documented deltas) in a self-describing envelope (type, unique ID, occurrence timestamp, version) with a partition key for ordering? — read event type definitions and the message schema
- [ ] Do consumers record processed message IDs in the same transaction as the model change (idempotent receiver)? — read handler transaction scope
- [ ] Is "model committed but event never sent" impossible (outbox, event store + forwarder, or shared transaction)? — trace the publish path relative to commit
- [ ] Do long-running cross-service processes have an explicit state machine with failure states, timeouts, and compensation, not null-means-pending? — search for process/saga managers
- [ ] Do external dependencies get circuit breakers and capped exponential backoff, with fallback behavior recorded as a business decision? — grep resilience config
- [ ] Are broker acknowledgement, autocommit, and offset-reset settings explicit and consistent with the claimed delivery semantics? — read messaging config
- [ ] Do event-driven flows have durable subscriptions and a dead-letter queue with a repair path? — read broker/queue configuration
- [ ] Does every all-or-nothing business operation live within a single service (no cross-service ACID assumptions)? — trace critical business operations against service boundaries
- [ ] Are calls between services of different scaling/elasticity profiles buffered through an async channel? — read the interaction topology
- [ ] Do failover, backfill, and rebuild paths have rate caps so recovery cannot melt the system? — grep those code paths for throttles
- [ ] On broker outage, does the publisher back off and queue for replay, with consumer re-registration after recovery covered by a drill record? — read the publish failure branch and drill notes

## Code Construction

- [ ] Are functions within the complexity threshold (cyclomatic above 10 flagged, target below 5) and classes/methods within size norms (~200-line classes, ~20-line methods), with the threshold enforced in CI? — measure with a static complexity/size tool and rank outliers
- [ ] Is nesting at most 3 levels deep, with guard clauses flattening deeper conditionals? — lint or grep for deep indentation
- [ ] Are numeric and string literals in logic named constants (0/1 allowlisted)? — read linter magic-number findings or grep literals in conditionals
- [ ] Is the codebase free of commented-out code, unused members, and public functions with no non-test caller? — grep comment blocks containing code; use static dead-code analysis
- [ ] Does each piece of logic (conversion, validation, query) exist in exactly one place? — use a duplication detector
- [ ] Do signatures stay within 3 parameters (investigate at 4+), with related parameters grouped into objects? — sample signatures
- [ ] Are function signatures free of boolean flag parameters? — grep call sites passing bare true/false literals
- [ ] Do objects talk only to direct collaborators (no a.getB().getC().doD() chains outside builder/fluent boundaries)? — grep chained accessor calls
- [ ] Is type dispatch (instanceof/typeof/type tags) confined to system edges, with each such switch appearing only once? — grep type checks and switches over the same enum
- [ ] Are getX-named methods cheap and side-effect-free? — sample accessor bodies
- [ ] Does every abstraction have at least 2 real consumers (no speculative generality)? — for each interface, count non-test implementations and callers
- [ ] Is mutable global state absent (no singletons/getInstance()/static mutable fields)? — grep those patterns
- [ ] Is each concept named identically across modules (no fetch/retrieve/get or amount/fee/price mixes)? — grep synonym sets and compare

## Error Handling & Robustness

- [ ] Is every failure observed (no empty catch blocks or ignored return values)? — grep catch bodies; read analyzer unchecked-result findings
- [ ] Is catch-all (Exception/Throwable/bare except) confined to a single top-level handler that guarantees users never see stack traces or internals? — grep catch clauses by type; read the outermost middleware
- [ ] Does every resource acquisition (file, socket, lock, connection) have a guaranteed release (RAII/using/finally/defer)? — grep open/acquire sites for scoping constructs
- [ ] Does the codebase use one error model throughout (exceptions, codes, or Result types — not a mix)? — sample failure paths across modules
- [ ] Is each error logged exactly once at its final handler, with no log-and-rethrow at intermediate layers? — grep for log statements adjacent to throw/raise
- [ ] Are expected business outcomes handled with normal returns rather than exceptions as control flow? — sample catch blocks for normal branching
- [ ] Are third-party exception/error types translated at the boundary rather than leaked through public signatures? — read thrown/declared types on the public surface
- [ ] Do public entry points fail fast with named-parameter guard clauses instead of deep null crashes? — sample entry validation
- [ ] Does every unmet precondition produce a signal (return value or exception) rather than a silent no-op? — sample conditional early returns without notification
- [ ] Does every async task submission have a failure observation path (awaited result or uncaught-exception handler)? — grep executor/promise submission sites
- [ ] Do long-lived counters and size arithmetic have overflow protection, and narrowing conversions checks? — grep accumulators and casts on hot paths
- [ ] Do error messages state the violated rule and the next action, without leaking sensitive data? — sample user-facing messages and logged payloads
- [ ] After a failed step, is its output prevented from being consumed downstream? — trace a representative failure through the pipeline
- [ ] Do error paths complete cleanup so the operation is safely re-invokable? — read error branches of stateful operations

## Tests & Verification

- [ ] Is the test suite pyramid-shaped (unit-dominated, not e2e-dominated)? — count tests per tier
- [ ] Does the unit tier avoid all external side effects (no DB, network, filesystem, mail)? — grep test setup for external access; (authorization-gated) execute the tier disconnected
- [ ] Are tests deterministic and order-independent? — read CI history for intermittent failures; (authorization-gated) re-run the suite shuffled
- [ ] Are tests free of real-time dependence (no sleeps, calendar dates, unseeded randomness)? — grep sleep/now()/random in test code
- [ ] Are expected values precomputed constants and assertions specific (never recomputed with production logic, never just not-null/no-throw)? — sample assertions; (authorization-gated) run a mutation tool on a core module
- [ ] Do validation and loop boundaries have three-point tests (just below, at, just above) plus empty/zero/negative/oversized inputs? — sample tests around boundary code
- [ ] Does every fixed bug have a regression test written before the fix? — sample recent bug-fix commits for paired tests
- [ ] Are characterization tests added before modifying untested legacy code? — inspect diffs that touch uncovered legacy files
- [ ] Can each test actually fail? — review assertion strength; (authorization-gated) verify by temporarily mutating an isolated copy of the SUT
- [ ] Does the developer test tier finish in about 10 seconds, with slow suites staged separately? — read CI timing reports and test-stage config
- [ ] Is coverage measured at branch level and used to locate gaps, not enforced as a build-failing KPI that breeds assertion-free tests? — read CI coverage config
- [ ] Do business-logic tests pass without DB or web server, using in-memory doubles only at boundaries? — read domain test imports for DB/server dependencies; (authorization-gated) execute the suite isolated
- [ ] Are only non-domain dependencies mocked, with real domain objects in tests? — sample test setup for mocked business types
- [ ] Are input-only variants parameterized instead of copy-pasted test bodies? — grep near-duplicate test methods

## Security

- [ ] Does every handler enforce object-level authorization (changing a resource ID cannot reach another user's data), with non-guessable external IDs? — trace a handler's authorization check; read ID generation
- [ ] Do PUT/PATCH endpoints bind only allowlisted writable fields (no whole-body mass assignment)? — read model-binding code
- [ ] Is all SQL parameterized, never built by string concatenation? — grep query construction for interpolation
- [ ] Is user- or external-controlled data context-escaped or auto-encoded before it reaches a raw-HTML or no-escape render sink (XSS)? — grep raw-render sinks (raw HTML assignment, dangerous inner-HTML, template autoescape-off) on paths carrying request/user data
- [ ] Are the repository and its full git history free of secrets, connection strings, and credentials, with none flowing into logs? — scan history with a secrets detector and grep log statements near credentials; report file/line locations and counts only, never copy matched values into any artifact or conversation, treat hits as already leaked (rotation is a separate authorized action), and do not rewrite history
- [ ] Are tokens short-lived (typically 1-60 minutes), JWTs signature-verified before claims are read, and API keys cryptographically random (typically 32 characters / 256 bits)? — read auth middleware and key generation
- [ ] Are cryptographic primitives sound — no MD5/SHA-1 for signatures or token derivation, passwords via a salted adaptive KDF (bcrypt/scrypt/argon2/PBKDF2), and secrets/tokens/HMACs compared constant-time? — read hashing, password-storage, and secret-comparison sites
- [ ] Is the OAuth grant matched to client type (auth code for confidential, PKCE for public, client credentials for machine), with no Implicit/ROPC remnants? — read auth configuration
- [ ] Are internal service-to-service calls authenticated (mTLS/service identity) with default-deny network policy? — read mesh/network policy config
- [ ] Are admin/management endpoints network-separated from the service plane, with egress restricted so leaked credentials cannot freely exfiltrate? — read IaC/NetworkPolicy/firewall rule files and deployment manifests
- [ ] Is the codebase free of dangerous constructs (unbounded input reads, eval on external strings, deserialization that can execute code)? — grep the known-dangerous API list for the language
- [ ] Are OS/shell commands built from argument arrays rather than by interpolating user-controlled data into a shell-parsed string? — grep shell-exec/subprocess sites for interpolation into the command string
- [ ] Are regexes applied to untrusted input screened for catastrophic backtracking, with timeouts? — scan regex literals on input paths
- [ ] Are dependencies pinned via a committed lockfile, with CVE scanning as a blocking CI gate and licenses reviewed on intake? — read manifest/lockfile and pipeline config
- [ ] Do CI workflows avoid running untrusted fork code with repository secrets — no pull_request_target/workflow_run that checks out the PR head ref, and no attacker-controllable github.event field (PR title, body, or branch name) interpolated into a run: shell step? — read .github/workflows for a PR-head checkout under those triggers and for github.event interpolation in run: blocks
- [ ] Do services and DB accounts run least-privilege, with no shared all-powerful account across workloads? — read infra/IAM definitions
- [ ] Are HTTPS and HSTS enforced, and TLS at minimum version 1.2 at every termination point? — read server/gateway config
- [ ] Is outbound TLS certificate verification never disabled in non-test code (InsecureSkipVerify, NODE_TLS_REJECT_UNAUTHORIZED=0, rejectUnauthorized: false, verify=False)? — grep client/HTTP-call sites for these disable flags, skipping test files
- [ ] Are control headers (role/permission assertions) stripped from external requests at the edge? — read gateway header rules
- [ ] Is CORS treated as a browser-read restriction only (never as API security), with an exact-origin allowlist, no wildcard-with-credentials, and authentication still enforced on every endpoint? — read gateway/server CORS config
- [ ] Is sensitive data encrypted in transit and at rest, and redacted in logs? — grep log serializers for redaction; read storage config
- [ ] Are rate limiting and load shedding deployed at the edge and between internal services? — read gateway and service config
- [ ] Does every security control (identity provider, rate limiter, policy store) fail closed by default on dependency failure, with any deliberate fail-open limiting exposure and leaving audit evidence? — read auth/rate-limit/policy client error branches

## Performance & Runtime

- [ ] Do user-facing services have explicit tail-latency targets (99th percentile) bound to an offered-load ceiling, with dashboards showing median+p99 rather than mean±stddev? — read SLO docs and dashboard definitions
- [ ] Are hot flows free of N+1 query patterns (per-item SELECT inside loops)? — grep loops containing fetch calls; (authorization-gated) enable query logging on a hot flow
- [ ] Is every read bounded (LIMIT on queries, pagination on lists, no whole-collection loads), and do distributed join/shuffle/broadcast operations carry size/skew guards? — grep query construction and handler code
- [ ] Does every optimization carry before/after measurements under the same conditions, with hot paths identified by a profiler rather than intuition? — grep commit history for optimization claims lacking numbers; look for profiling artifacts behind tuned code
- [ ] Are caches separate components with hit/miss/eviction statistics and tested invalidation, not embedded in domain objects? — read cache usage sites
- [ ] Are async/event-loop paths free of blocking synchronous calls? — grep async handlers for sync I/O APIs
- [ ] Do servers enforce an in-flight request limit with a fast-reject (too-busy) path? — read server/middleware config
- [ ] Are thread/worker pool sizes bounded relative to available CPUs, with heavy batch work off request threads? — read pool configuration and job scheduling
- [ ] Do hot-path containers and algorithms have worst-case analysis (reallocation spikes, O(n²) traps)? — inspect the hottest loops' data structures
- [ ] Are critical sections small and I/O-free, with no single lock guarding an entire shared structure? — grep lock scopes for I/O and allocation
- [ ] Do long-running services show stable file-descriptor/socket/memory counts under sustained load? — read existing soak/leak results and production telemetry; (authorization-gated) run a soak test
- [ ] Have default timeouts, pool sizes, and retry settings of every production library been reviewed against the SLA? — read client/library configuration versus documented defaults
- [ ] Does every traffic-bearing design have back-of-envelope arithmetic (data volume × frequency) recorded before build-out? — search design docs for the calculation
- [ ] Was capacity established by loading past the tail-latency limit and backing off, rather than by maximizing CPU utilization? — read the load test method and results

## Operations & Observability

- [ ] Are logs structured (key-value, UTC, sub-second precision) and shipped to an indexed store? — sample emitted log lines and read the shipping config
- [ ] Does a correlation/trace ID propagate across every service hop and through queues? — grep middleware and message envelopes for the ID
- [ ] Are rate/error/duration metrics split by status class (4xx and 5xx never merged), with latency reported as percentiles separately for successes and failures? — read metric definitions and dashboard queries
- [ ] Is every alert tied to user impact with a threshold and a configured routing target? — read alert rules
- [ ] Do logs have a retention policy and PII governance (access control, lifecycle)? — read logging configuration
- [ ] Do services run startup sanity checks (expected instance counts, data files present and plausible) that page on failure? — read startup code
- [ ] Are queue depth and consumer lag on dashboards with declared expected bounds? — read monitoring config
- [ ] Is the last successful backup-restore drill recorded with a date? — read runbooks and drill records
- [ ] Do resilience claims (timeout, retry, circuit breaker, failover) have failure-injection or drill evidence covering dependency, network, instance, and data failures? — read drill records and fault-injection test configs
- [ ] Do certificates, credentials, and domains have renewal/expiry alerting configured? — read renewal and alerting config
- [ ] Is there a feature-flag inventory with ages, with decided flags removed rather than reused? — grep the flag registry against flag references in code
- [ ] Is deployment a single automated pipeline from pushes to the main branch, with gradual rollout, a rehearsed rollback, and deployment decoupled from release? — read the pipeline and rollout config
- [ ] Is every server reproducible from committed infrastructure code (no hand-tuned snowflakes)? — compare running config against IaC coverage
- [ ] Are unhandled exceptions in production logged, counted, and driven toward zero as defects? — query the error tracker trend

## Change Safety & Tooling

- [ ] Are structural and behavioral changes separated into distinct commits/PRs (no rename+logic mixed diffs)? — sample the last 20 commits
- [ ] Are schema migrations versioned, append-only, and replayable to reconstruct any environment, with shared-schema changes done expand/contract? — read the migrations directory and history
- [ ] Do migrations avoid narrowing a column's type (width or precision reduction) that can silently truncate existing data without a pre-check or backfill? — read ALTER/column-modify statements for width or precision reductions
- [ ] Do all branches integrate with the main branch within a few days? — list branches with age and divergence
- [ ] Is generated code never hand-edited, with the generator failing loudly on unsupported input? — read generator config and ownership markers; (authorization-gated) diff a regeneration
- [ ] Is the build reproducible (pinned toolchain and dependencies; years-old releases rebuildable)? — read toolchain/dependency pinning and build docs; (authorization-gated) attempt a historical rebuild
- [ ] Is there a warning ratchet (count may never increase), with every suppression carrying a written justification? — read analyzer config and grep suppress attributes
- [ ] Are refactoring priorities driven by churn × complexity hotspot data rather than opinion? — compute churn from git log joined with complexity metrics
- [ ] Are low-churn, high-fan-in modules genuinely stable rather than fear-frozen? — check for workarounds routed around them, missing tests, and TODO clusters referencing them
- [ ] Do "will be rewritten/retired soon" freeze zones have explicit, periodically reconfirmed dates? — grep deprecation notes for dates; stale ones are the miss
- [ ] Are long-tail migrations tracked to completion, with the old API actually deleted on schedule? — check migration lists against remaining old-API call sites
- [ ] Are large call-site rewrites done by script plus assertion-verified inference, gated on a covered test suite? — read the mechanical-change tooling and its verification step
- [ ] Do framework dependencies lag no more than two major versions, with an upgrade cadence recorded in the repo? — compare manifest versions against upstream releases; check for recurring update commits/config
