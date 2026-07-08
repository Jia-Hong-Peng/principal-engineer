# Worked Examples

## Contents
- Purpose
- Example 1 — Enum Value Added, Consumer Missed
- Example 2 — Success Side Effect On Happy Path Only
- Example 3 — Check-Then-Write Race
- Example 4 — Single-Implementation Interface With "Not Supported"
- Example 5 — N+1 In A Serializer

## Purpose
- These are calibration samples, not a catalog. Each shows a small change, the finding a principal-level review should raise, the fix direction, and the rule it anchors to.
- Use them to recognize the shape of a real finding. Do not pattern-match blindly; the anchored rule is the authority, the example is the illustration.
- Pseudocode is language-neutral. Apply the reasoning to the concrete repository, not the syntax.

## Example 1 — Enum Value Added, Consumer Missed
Change: a new status is added.
```
enum OrderStatus { PENDING, PAID, SHIPPED }        // + REFUNDED
```
Elsewhere, unchanged and outside the diff:
```
switch (order.status) {
  case PENDING: return "awaiting payment"
  case PAID:    return "processing"
  case SHIPPED: return "in transit"
}                                                   // no REFUNDED branch, no default
```
Finding: adding an enum value is a data-contract change. Every consumer — switches, filters, serializers, UI labels, persistence, docs, tests — must be located before claiming completeness. A missing branch silently mislabels or drops the new value.
Fix direction: grep sibling values, read every consumer outside the diff, add the branch (or a fail-closed default), and add a test that exercises the new value end to end.
Anchors: `pre-landing-review-prevention.md` Core Critical Gates (enum/value completeness); `implementation-code-quality.md` Review; `runtime-ops-diagnostics.md` Data-Intensive Runtime Semantics.

## Example 2 — Success Side Effect On Happy Path Only
Change: add auditing/notification to an update path.
```
function applyRefund(order) {
  if (order.canRefund()) {
    order.refund()
    emit(RefundIssued(order.id))       // event + audit + cache invalidation
    return ok()
  }
  return rejected()                    // sibling branch: no event, no audit, no invalidation
}
```
Finding: conditional side effects are a review blocker. If one branch emits an event, logs success, invalidates a cache, or writes audit data, the sibling branches must preserve the same required invariants — or the omission must be deliberate and justified. Here a rejected refund leaves no audit trail.
Fix direction: decide the invariant (every refund decision is audited), then make both branches satisfy it; add a negative-path test asserting the rejected case records what it must.
Anchors: `pre-landing-review-prevention.md` Maintainability And Scope (conditional side effects), Adversarial Final Pass; `implementation-code-quality.md` Anti-Patterns.

## Example 3 — Check-Then-Write Race
Change: create-if-absent for a unique resource.
```
user = db.find(email)
if (user == null) {
  user = db.insert({ email })          // two concurrent requests both pass the check
}
```
Finding: read-check-write without atomicity is a race. Under concurrency both callers see `null` and both insert, producing duplicates or a constraint crash. Correctness cannot rest on timing.
Fix direction: enforce a unique constraint at the store and use insert-or-conflict semantics (upsert / `ON CONFLICT` / catch-unique-and-reload); treat the constraint, not the pre-check, as the source of truth. Add a test that drives two concurrent creates.
Anchors: `pre-landing-review-prevention.md` Core Critical Gates (concurrency, data integrity); `architecture-system-design.md` Data (distinguish accepted/persisted/durable).

## Example 4 — Single-Implementation Interface With "Not Supported"
Change: introduce an abstraction "for flexibility".
```
interface Storage { read(); write(); stream(); batch() }

class LocalStorage implements Storage {
  read()  { ... }
  write() { ... }
  stream() { throw NotSupported }      // no caller needs it; no second implementation exists
  batch()  { throw NotSupported }
}
```
Finding: principle-driven churn plus a false abstraction. There is one implementation, no named variation point, and `NotSupported` methods prove the port is shaped around a provider rather than a client. The interface adds names without hiding decisions and lies about what it supports.
Fix direction: delete the interface and call the concrete class directly, or narrow the port to what callers actually use (`read`/`write`). Reintroduce abstraction only when a real second implementation or variation point appears.
Anchors: `SKILL.md` Tradeoff Rules; `implementation-code-quality.md` Anti-Patterns (principle-driven churn, fat ports); `architecture-system-design.md` Complexity And Information Hiding (reject shallow boundaries).

## Example 5 — N+1 In A Serializer
Change: render a list with a nested association.
```
for (order in orders) {
  out.push({ id: order.id, customer: order.customer.name })  // lazy load per row → 1 + N queries
}
```
Finding: a query per row. At list scale this is a latency and load defect that a happy-path test with two rows will not reveal.
Fix direction: eager-load or batch the association (join, preload, or DataLoader-style aggregation), bound the page size, and review indexes on the join predicate. Verify with a query count assertion or before/after latency on a realistic row count.
Anchors: `pre-landing-review-prevention.md` Performance And Scale; `runtime-ops-diagnostics.md` CPU Memory Disk Network (avoid N+1).
