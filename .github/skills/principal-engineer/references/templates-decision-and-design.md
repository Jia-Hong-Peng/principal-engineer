# Templates: Decision And Design Artifacts

## Contents
- How To Use These Templates
- Template: Software Design Doc
- Template: Architecture Design Doc
- Template: ADR (Architecture Decision Record)
- Template: RFC (Request For Comments)

## How To Use These Templates
- Copy the block, fill every section; write "None" or "N/A" with a reason rather than deleting a section — an empty section is a finding, not a formatting choice.
- Keep repository reality in every section: file paths, real contract names, measured numbers. Decidable test used by every gate below: a section is "generic" when it contains no repository path, no real contract/type name, and no measured number.
- Choose by artifact: single component or feature → Software Design Doc; system/service topology → Architecture Design Doc; one decision to record → ADR; proposal needing async review and consensus → RFC.

## Template: Software Design Doc
When to use: a nontrivial feature, module, or component inside an existing system.

```markdown
# Design: <feature/component name>

## Problem
<user-visible or engineering problem, with evidence: issue link, incident, metric>

## Constraints
<hard constraints: compatibility, performance target, data rules, deadline, team skills>

## Proposed Design
<boundaries, public contract/API, data model changes, control flow; reference real files/modules>

## Alternatives Considered
<≥1 credible alternative and the concrete reason it loses under the constraints above>

## Behavior Changes
<observable changes: outputs, errors, timing, side effects — or "behavior-preserving">

## Test Strategy
<what proves it: unit/integration/characterization; negative paths; the checks that gate merge>

## Rollout And Rollback
<flag/config/migration steps; how to undo each step; data implications of rollback>

## Monitoring
<signals that show it works or fails in production; where they surface>

## Risks And Open Questions
<unknowns, assumptions to verify, decisions needed and from whom>
```

Gate: reject the doc if Alternatives, Rollback, or Risks are empty or generic.

## Template: Architecture Design Doc
When to use: service topology, system boundaries, cross-service data flow, or platform-level structure.

```markdown
# Architecture: <system/initiative name>

## Context And Problem
<current architecture, the force demanding change, evidence (scale, coupling, incidents, cost)>

## Quality Attributes (ranked)
<the 3-5 attributes this design optimizes, ranked; e.g., evolvability > availability > latency>

## Proposed Architecture
<components, ownership boundaries, contracts between them, data ownership, sync/async choices;
one diagram maximum, then prose that a reviewer can challenge>

## Data
<source of truth per entity; consistency model; schema evolution plan; retention>

## Failure Model
<what fails, blast radius per failure, timeouts/retries/idempotency, degraded modes>

## Alternatives Considered
<per alternative: shape, why rejected against the ranked quality attributes>

## Landing Phases
<Phase 0-5 instantiation or explicit collapse; see playbook-phased-delivery.md>

## Operational Cost
<what this adds to on-call, deploys, infra spend, and team cognitive load>

## Risks And Open Questions
<top risks with mitigations; decisions needed>
```

Gate: reject if quality attributes are unranked ("we want everything") or the failure model is missing.

## Template: ADR (Architecture Decision Record)
When to use: one significant, hard-to-reverse decision worth recording where future readers will look. Number sequentially (`adr/NNNN-title.md`), never rewrite an accepted ADR — supersede it.

```markdown
# ADR-NNNN: <decision, stated as a decision>

- Status: Proposed | Accepted | Superseded by ADR-MMMM
- Date: <YYYY-MM-DD>
- Deciders: <who>

## Context
<forces in tension: technical, organizational, cost; why now>

## Decision
<what we will do, in one or two sentences, active voice>

## Options Considered
<each option: one-line shape, main gain, main cost; mark the chosen one>

## Consequences
<what becomes easier; what becomes harder; new constraints accepted; migration implied>

## Verification
<how we will know the decision holds: fitness function, metric, review date>
```

Gate: a decision with no rejected option is a description, not a decision — reject.

## Template: RFC (Request For Comments)
When to use: a proposal that needs review and consensus across owners before work starts.

```markdown
# RFC: <title>

- Author / Reviewers / Status / Review deadline

## Summary
<the proposal in ≤5 sentences, decision-ready>

## Problem And Evidence
<why act; measured pain or concrete risk>

## Goals / Non-Goals
<explicit non-goals prevent scope drift during review>

## Proposal
<enough design detail to be criticized: boundaries, contracts, data, sequencing>

## Alternatives
<including "do nothing" with its cost>

## Rollout Plan
<phases, flags, migration, rollback per phase>

## Security, Data, And Operational Impact
<authz/authn changes, data handling, new secrets, on-call and cost impact>

## Open Questions
<numbered, so review comments can target them>
```

Gate: an RFC without non-goals and a review deadline invites unbounded debate — reject.
