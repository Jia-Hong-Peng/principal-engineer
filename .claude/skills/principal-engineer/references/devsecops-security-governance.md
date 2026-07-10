# DevSecOps And Security Governance

> Source status: this file is practice-based synthesis. The project-provided technical material
> does not cover CI/CD security tooling, secret managers, or scan governance; treat specifics as
> defaults to adapt, and verify vendor capabilities (GitHub Actions, GHAS, Checkmarx, Azure Key
> Vault) against current vendor docs before committing a design to them.

## Contents
- Core
- Pipeline Design Rules
- Scanning Integration And Finding Governance
- Secret Management
- Access, Audit, And Accountability
- Vulnerability Governance Loop
- Anti-Patterns
- Template: DevSecOps Pipeline Design

## Core
- Security controls that live in the pipeline are enforceable; security controls that live in a wiki are optional. Convert policy to automation (see `playbook-phased-delivery.md` Phase 3).
- A control that does not block anything is telemetry, not a control. Decide per control: gate, warn, or measure — and say which.
- Optimize for developer feedback latency: a slow security stage gets bypassed culturally long before it gets bypassed technically.
- Every hard gate ships with a break-glass path, designed on day one: an emergency merge/deploy route with named approvers, automatic audit trail, and mandatory post-hoc review. Hard gates without a governed emergency path do not stop bypass — they force it underground.

## Pipeline Design Rules
- Pipeline definitions are code: reviewed, versioned, revertable; a pipeline change can ship malware, so review it like production code.
- Least-privilege per stage: no stage holds write scopes beyond its own outputs — build cannot deploy, scan cannot write artifacts, and a deployer cannot rewrite the artifact repository. Prefer short-lived federated identity (OIDC) over stored long-lived credentials, and scope the federation trust to specific repo + ref/environment claims — a wildcard subject claim is an org-level privilege-escalation hole, worse than a well-scoped stored secret.
- Build once, sign, promote the same artifact through environments; rebuilding per environment invalidates what earlier gates proved. Signing only pays off if promotion verifies: deploy stages must check signature/provenance before rollout, or the signature is theater.
- Pin third-party pipeline actions/steps to immutable versions; an unpinned action is an unreviewed dependency with pipeline credentials.
- Treat caches, build containers, and runners as attack surface: isolate per trust level, rebuild regularly, never share runners between public and private trust zones.
- Protect the trunk with required checks, and keep required checks fast enough that nobody campaigns to remove them; pair them with the break-glass path required by Core.

## Scanning Integration And Finding Governance
- Place scanners at two points: fast incremental checks on PR (feedback in minutes), deep/full scans on schedule (completeness). Gating a PR on a 40-minute full scan trades trunk safety for bypass pressure.
- Gate on NEW findings against a recorded baseline; the pre-existing backlog is burned down as governed work (see Tech-Debt Governance template), not as a merge blocker for unrelated changes.
- Govern the baseline like a suppression store: any addition to the baseline needs owner + reason + expiry and a defined approver — an ungoverned re-baseline is a mass suppression with no audit trail.
- Findings from scheduled deep scans must feed back into gates: a known critical/high on an artifact blocks its further promotion (or opens a blocking, SLA-tracked item) — otherwise deep scans produce reports while known-vulnerable artifacts keep shipping.
- Every suppression/false-positive marking needs owner + reason + expiry; unexpiring suppressions are how scanners go blind. Audit suppressions periodically.
- Deduplicate across tools (SAST, SCA, secret scanning, DAST) before routing to owners; duplicate findings destroy triage credibility.
- Measure MTTR per severity and finding inflow/outflow rates, not open counts; open counts punish the team that scans the most.
- Route findings to the owning team automatically; a shared security queue nobody owns is where findings expire.

## Secret Management
- One central secret store per trust domain (e.g., a vault service); application code receives secrets by reference/injection, never from source, images, or CI variables copied by hand.
- Prefer workload identity (managed identity / federated credentials) over any stored secret; the best secret is one that does not exist.
- Design rotation before the first secret is stored: versioned secrets, consumers that reload without redeploy, an owner paged when rotation fails. Rotate with an overlap window — old and new versions both valid until zero usage of the old is confirmed, then retire it; instant revocation on rotate is a self-inflicted outage. Rotation that requires a deploy will not happen under incident pressure.
- Per-environment isolation: production secrets are unreadable from non-production identities and pipelines.
- Secret access is audited: who/what read which secret when, queryable, with anomaly review.
- Run secret scanning on repos and history; a leaked secret is an incident with a defined procedure. Order by situation: under active abuse, revoke first and eat the outage; otherwise issue-new → cut consumers over → revoke old → verify no further use. History cleanup comes last and never counts as containment — forks, clones, and caches retain the leak, so the credential is compromised until revoked.
- A self-service secrets portal is an access-control product: request → approval by resource owner → time-boxed grant → audit trail → expiry-driven review. Build the expiry and audit first; convenience features second.

## Access, Audit, And Accountability
- Least privilege with just-in-time elevation for privileged operations; standing admin access is a finding.
- Every privileged action must be attributable to a person or a workload identity — shared accounts break the audit chain.
- Audit log design: actor, action, target, timestamp, before/after where feasible; append-only storage; retention set by compliance needs; and a consumer — an audit log nobody reviews is a compliance prop.
- Access reviews are periodic, owned, and produce revocations; a review that never revokes is a rubber stamp.

## Vulnerability Governance Loop
- Run findings through an explicit loop: intake → dedupe/triage → SLA by severity and exposure → fix, or accept risk with owner + expiry → verify fix → report trends. "Scan and forget" is worse than not scanning: it manufactures false assurance.
- Exposure modifies severity: an internal-only medium may wait; an internet-facing medium may not. Triage on reachability and data sensitivity, not scanner score alone.
- Track third-party/dependency vulnerabilities the same way; upgrades are the fix path, so keep upgrade capability healthy (lockfiles, dependency update automation, test coverage that makes upgrades cheap).

## Anti-Patterns
- Security stage that everyone force-merges past: the gate is miscalibrated — fix latency or precision, do not normalize bypass.
- One credential that can do everything, used by every stage.
- Compliance checklist passed while the audit log has no reader and suppressions have no expiry.
- Blocking on total finding count: punishes teams for scanning coverage, rewards not looking.
- Secret rotation "supported" but never rehearsed; break-glass access with no expiry or audit.

## Template: DevSecOps Pipeline Design
Copy and fill with the org's concrete toolchain (e.g., GitHub Actions, GHAS, Checkmarx, Azure Key Vault). The design rules are the sections above — the template holds the slots; a slot that contradicts a rule above needs a written justification, not silence.

```markdown
# Pipeline Design: <repo/org scope>

## Objectives And Constraints
<what the pipeline must guarantee (provenance, gates, speed budget per stage); org constraints
(runners, network, approvals, compliance)>

## Stages
| Stage | Trigger | Runs | Identity + write scopes (own outputs only) | Time budget | Gate (blocks on) |
|---|---|---|---|---|---|
| build | PR | <compile, unit tests> | <...> | <n min> | <red tests> |
| security | PR + scheduled | <SAST/SCA/secret scan tools> | <...> | <n min> | <new findings ≥ severity X> |
| package | main merge | <build once, sign, SBOM> | <...> | | <provenance attached> |
| deploy-staging | package success | <promote same artifact> | <...> | | <signature/provenance verified + health/smoke> |
| deploy-prod | approval/schedule | <promote same artifact> | <...> | | <signature/provenance verified + canary stop conditions> |

## Scan Policy
- Baseline location and its governance (approver, expiry policy): <...>
- Suppression process (owner + reason + expiry): <...>
- Finding SLA by severity (as MTTR): <critical: n days / high: n / medium: n>
- Deep-scan feedback into promotion gates: <mechanism>

## Secrets
- Store / injection mechanism: <...>
- Pipeline identity (OIDC federation, subject-claim scoping): <repo + ref/environment claims>
- Rotation (overlap window, failure paging): <...>
- Access audit location and review cadence: <...>

## Break-Glass
- Emergency path, approvers, audit trail, post-hoc review: <...>

## Failure And Rollback
- Broken pipeline = stop-the-line for: <affected paths, who fixes, what is blocked>
- Deploy rollback mechanism and last rehearsal: <...>
- Pipeline-config rollback (pipeline-as-code revert path): <...>

## Ownership And Audit
- Pipeline definition owner; review rules (pipeline changes reviewed like production code): <...>
- Deployment audit trail (who/what/where/when, queryable at): <...>

## Risks And Open Questions
<numbered>
```

Gate: reject a design where any stage's identity can write outside its own outputs, where deploy gates do not verify signature/provenance, or where scan gates measure total backlog instead of new findings.
