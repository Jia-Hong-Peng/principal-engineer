# Refactoring And Change Safety

## Contents
- Purpose
- Tidy Timing Gate
- Transformation Decision Table
- Coupling, Cohesion, And Hotspots
- Legacy Safety Ladder
- Language And Runtime Semantics
- C# And .NET Refactoring Gates
- Large Replacement And Differential Proof
- Verification Matrix
- Review And Finding Format

## Purpose
- Use this reference for a structural change, legacy modernization, broad rename/move/extract, behavior-preserving migration, or a refactor whose safety is not obvious.
- The current playbook owns this subtask's baseline, execution order, stop conditions, and evidence; it completes the request only when primary and otherwise returns upward. This reference supplies transformation mechanics, semantic hazards, and verification choices only.
- Treat a refactor as a controlled movement of responsibilities and dependencies under behavior evidence, not as a cleanup label.

## Tidy Timing Gate
**Prepare structure first** only when one small S change immediately reduces the cost or risk of the requested B change by shortening the path, centralizing a duplicated rule, exposing an input, or enabling a reliable test.

**Tidy after** when the real obstacle becomes visible only after B is implemented and the local context is still warm.

**Defer with a trigger** when S has value but does not help the current outcome, needs more runtime/change evidence, or can be migrated incrementally later. Record the first independent step, trigger, evidence, and cost it will remove.

**Do not tidy** when the only reason is aesthetics, principle compliance, a guessed future variation, an inactive area, or a regression/migration cost larger than the current obstacle. A single tidying stretch beyond about one hour usually means the minimal structural change set supporting the next behavior change has been lost; stop and return to the behavior change.

Decision questions:
1. What is the next observable B change?
2. Is the obstacle understanding, edit fan-out, verification, or rollback?
3. Which single S move removes that obstacle?
4. Can it preserve result, error, effects, evaluation order, exception timing, resource lifetime, and performance contract?
5. Which evidence proves preservation?
6. Can it be reverted quickly?
7. At which exact point must work return to B?

## Transformation Decision Table
| Trigger | Smallest move | Preservation hazards | Stop condition |
| --- | --- | --- | --- |
| Main path buried in guards | Guard clauses or named predicate | Short-circuit order, cleanup/finally, transaction/lock scope | Main path reads linearly |
| Proven unreachable code | Delete one closed unit | Reflection, plugins, config, serializers, conditional build | No callers/dynamic entry; build/tests pass |
| Equivalent forms imply false difference | Normalize one form | Lazy/eager evaluation, allocation, exception timing, thread safety | The target rule is visually comparable |
| Legacy API blocks one caller | New client-shaped adapter over old implementation | Defaults, null/error, timeout/retry, observability | Target caller can express B safely |
| Related code is distant | Move one concept closer | Initialization/registration order, build/package/resource lookup | Requested change is local |
| Variable lifetime is long | Move declaration to initialization/use | Evaluation, capture, allocation, dispose/lock duration | Source and purpose are local |
| Dense expression hides meaning | Introduce intent variable | Evaluation count, short circuit, side effect | Main expression exposes policy |
| Magic value encodes policy | Typed/named local constant | Same literal with different rule or unit | One authoritative policy point |
| Ambient input blocks testing | Pass one explicit input; split edge/core | Sampling time/scope, context lifetime | Signature reveals required fact |
| Linear phases are hidden | Separate blocks, then extract only a real phase | Formatter churn, resource lifetime | Stages can be inspected independently |
| One coherent block has a small interface | Extract intent-named function/module | Return/control flow, exception stack, mutation, transactions | Caller knows less, not more |
| Micro-helpers obscure flow | Inline thin layers, observe full flow, re-split by cohesion | Scope, early return, effect order | Natural stages/boundary become visible |
| One rule has real repeated variation | Table/strategy/polymorphism selected by forces | False substitution, class explosion | Variation is explicit and tested |
| Data clump shares identity/lifecycle | Parameter/value object | Optionality, serialization, equality | Type enforces a real concept |

Do not mechanically shorten functions. Prefer a deep function that hides a coherent decision over many shallow helpers that force callers and readers to reconstruct the algorithm.

## Coupling, Cohesion, And Hotspots
Ask “which change to A forces B to change?” rather than merely “does A call B?” Inspect:
- Shared rule/model/schema/config and duplicate authority.
- Call order, timing, transaction, availability, identity, unit, error, and special values.
- Distance across function, module, package, process, repository, deployment, and external consumer.
- Volatility from co-change history, incidents, dependency churn, and inferred upcoming constraints.

Keep strong coupling local. Reduce high-strength distant coupling through ownership, translation, a stable contract, or by moving the coupled elements closer. Do not fragment a cohesive local concept simply to reduce dependency counts.

Rank refactor candidates with evidence:
- Change frequency and co-change spread.
- Complexity/decision paths and navigation cost.
- Fan-out and public blast radius.
- Defects, incidents, rollback, and repair history.
- Runtime importance and held remote/resource effects.
- Missing behavior evidence.

Metrics locate anomalies; they do not prove a refactor. A stable complex parser can be lower priority than a smaller authorization path changed weekly without tests.

## Legacy Safety Ladder
Use the cheapest sufficient rung:

1. Existing focused behavior tests.
2. Characterization around the public entry and observable effects.
3. Golden/snapshot output with volatile fields normalized and manual diff review.
4. Seam around time, randomness, filesystem, database, network, framework context, or hidden construction.
5. Differential run of old and candidate on the same recorded input.
6. Shadow/read-only production-like comparison with side effects isolated.

Create a seam to sense or substitute behavior, not to expand production public API for tests. Remove temporary subclass hooks, probes, shims, flags, and compatibility paths after the safer structure becomes available.

Use sprout or wrap techniques when a direct edit is too risky: add new behavior beside or around the old path, protect it, then fold temporary structure back. Do not rename, reformat, or reorganize a wide unprotected legacy region while its behavior remains unclear.

## Language And Runtime Semantics
Before a mechanical-looking refactor check:
- Evaluation and side-effect order.
- Short-circuiting and lazy/deferred execution.
- Exception type, stack, timing, and cleanup.
- Null/missing/unknown/default distinctions.
- Numeric overflow, precision, unit, equality, hashing, and ordering.
- Resource acquisition, disposal, transaction, lock, lease, and cancellation scope.
- Async scheduling, context propagation, reentrancy, backpressure, and unobserved work.
- Serialization shape, field names/numbers, generated code, ABI/FFI, and binary compatibility.
- Reflection, decorators/annotations, static initialization, and registration order.

Cross-language or auto-translated code requires semantic checks, not only compilation: integer width/sign, overflow, string/byte units, null/default, collection ordering, exceptions/results, async/cancellation, equality/hash, resource ownership, and ABI layout/calling convention.

## C# And .NET Refactoring Gates
When a .NET refactor touches LINQ cardinality/deferred execution, optional defaults/signature compatibility, disposal, nullable contracts, equality/records, constructor syntax, interfaces/lifetimes, or Roslyn analyzers/code fixes, read only the matching sections of `dotnet-enterprise.md`. Those .NET-specific semantics are canonical there; return to `playbook-safe-existing-code-change.md` for execution and completion.

## Large Replacement And Differential Proof
Treat a rewrite or large restructure as a migration:
1. Freeze observable behavior and contract, including edge and failure semantics.
2. Introduce a stable routing/adapter boundary with 100% old path.
3. Build one end-to-end candidate slice.
4. Feed old and new the same representative inputs.
5. Define domain-aware equivalence and normalize only truly nondeterministic fields.
6. Keep the candidate side-effect-free, use fake/read-only dependencies, or replay offline.
7. Record mismatches with input, versions, and exact difference.
8. Canary/cut over only after mismatch, performance, and failure thresholds pass.
9. Remove old code, routing, flags, synchronization, and comparison infrastructure at the exit gate.

Do not maintain two authoritative writers without a data-ownership and reconciliation contract. Do not let a temporary dual path become permanent flexibility.

## Verification Matrix
| Risk | Primary proof |
| --- | --- |
| Pure calculation/branch/mapping | Unit, table/property cases, mutation check |
| Unknown legacy output | Characterization or reviewed snapshot |
| Database/ORM/transaction | Real-provider integration and rollback/concurrency check |
| HTTP/message/serialized shape | Contract and compatibility test |
| Resource/lifetime | Success, exception, cancel, timeout, cleanup-failure paths |
| Concurrency | Invariant-oriented stress/race test with reproducible evidence |
| Old/new equivalence | Differential/parallel run |
| Performance-sensitive structure | Same release-like workload before/after plus correctness |
| Public/multi-module migration | Mixed-version, staged rollout, and rollback evidence |

Run the closest check after each risky transformation and the full required gate at the end. A test that only passes on the new code is incomplete evidence for a bug fix; prove it detects the old defect when practical.

## Review And Finding Format
Review in this order: behavior drift, data/security/concurrency/contract, resource and failure semantics, test evidence, boundary quality, maintainability, naming/style.

Use:

```text
[severity] path:line - <structural symptom>
Mechanism and observable risk:
Affected callers/contracts:
Behavior-preserving change? yes/no/mixed
Smallest safe treatment:
Required evidence:
Rollback and stop condition:
```

Do not report function length, metric score, duplication, inheritance, or a pattern name as the finding. Report the concrete change cost or failure mechanism it creates.
