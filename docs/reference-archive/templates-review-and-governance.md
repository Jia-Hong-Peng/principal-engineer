# Templates: Review And Governance Artifacts

## Contents
- Template: Design Review
- Template: Code Review
- Template: Tech-Debt Register Entry
- Template: Tech-Debt Governance Cycle
- Template: Executive Summary

## Template: Design Review
When to use: reviewing someone else's design doc/RFC before implementation. Review the decision quality, not the prose.

```markdown
# Design Review: <doc under review>

## Verdict
Approve | Approve with required changes | Request redesign — <one sentence why>

## Findings (severity-ordered)
1. [must-fix] <finding: the concrete failure this design allows, with the section it comes from>
2. [should-fix] <...>
3. [consider] <...>

## Checked Dimensions
- Problem/evidence real and current: <ok/finding>
- Alternatives credible (not strawmen): <ok/finding>
- Failure model and blast radius: <ok/finding>
- Data: source of truth, migration, rollback: <ok/finding>
- Security and trust boundaries: <ok/finding>
- Operational cost and on-call impact: <ok/finding>
- Landing plan phased and reversible: <ok/finding>

## Questions Blocking Approval
<numbered questions the author must answer>
```

Gate: every must-fix names a concrete failure scenario, not a preference. See `pre-landing-review-prevention.md` for the gate catalog.

## Template: Code Review
When to use: structuring review output on a nontrivial diff (see Review Stance in `SKILL.md` and `implementation-code-quality.md` Review for how to find issues; this is the reporting shape).

```markdown
# Code Review: <PR/change>

## Verdict
<approve / request changes> — <highest-severity reason>

## Findings
1. [must-fix] <file:line — defect, the input/state that triggers it, suggested fix direction>
2. [should-fix] <file:line — ...>
3. [style/optional] <...>

## Behavior Changes Detected
<observable changes found in a "refactor"/"cleanup" diff, or "none">

## Test Gaps
<missing negative paths, boundary cases, or contract coverage for the touched scope>

## Not Reviewed
<what this review did not cover (e.g., perf under load, migration on real data) — so the
approval's scope is honest>
```

Gate: findings carry file:line and a failure scenario; "Not Reviewed" is never empty for a nontrivial diff.

## Template: Tech-Debt Register Entry
When to use: recording debt so it can be governed instead of remembered.

```markdown
- ID: TD-NNN
- Title: <what is wrong, concretely>
- Location: <files/modules/services>
- Interest: <what it costs today: incident risk, slowed change, on-call load — with evidence>
- Principal: <estimated effort to fix, T-shirt size + assumptions>
- Blast radius if unaddressed: <what breaks or slows as it compounds>
- Trigger to act: <the condition that makes fixing this urgent (e.g., "before adding a second consumer")>
- Owner / Review date
```

## Template: Tech-Debt Governance Cycle
When to use: running debt management as a process, typically per planning cycle.

```markdown
# Tech-Debt Review: <period>

## Inventory Delta
<new entries added, entries closed, entries whose interest changed>

## Prioritization (this cycle)
Rank by interest-to-principal ratio and trigger proximity, not by annoyance:
1. TD-NNN — <why now: trigger near, interest rising, or cheap while touching the area>
2. ...

## Funded This Cycle
<which entries get time, how much, expected evidence of completion>

## Explicitly Deferred
<entries deferred with the risk accepted and the next review date — silence is not a decision>

## Ratchets
<automation added so this class of debt stops growing (lint rule, CI check, template)>
```

Gate: a cycle that funds zero ratchets is treating symptoms; flag it.

## Template: Executive Summary
When to use: reporting a technical initiative or decision upward. One page maximum; no jargon the reader must decode.

```markdown
# <initiative>: Executive Summary

## Bottom Line
<the decision/status in 2-3 sentences: what we are doing, what it costs, what it buys>

## Why This Matters To The Business
<risk avoided or capability gained, in outcome terms (availability, delivery speed, compliance, cost)>

## Status Against Plan
<current P5/staged-delivery state, on/off track, evidence - not activity lists>

## Decisions Needed From You
<numbered, each with options, recommendation, and deadline — or "none">

## Top Risks
<≤3, each with owner and mitigation>

## Cost
<people-time and money, spent and remaining>
```

Gate: if "Decisions Needed" and "Top Risks" are both empty, this is a newsletter, not an executive summary — cut it or say why it is informational.
