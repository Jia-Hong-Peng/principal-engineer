# Principal Engineer

Traditional Chinese: [readme.zh.md](readme.zh.md)

This repository defines AI skill packages for making an agent work like a principal software engineer.

This is not a corporate role-play skill. It does not try to simulate the full human job title, the organizational authority, or the management responsibilities of a principal engineer. The goal is narrower and more useful: define how an AI coding agent should think, decide, and execute when the work requires principal-engineer-level technical judgment.

## Core Idea

An AI principal-engineer should focus strictly on software engineering quality and technical execution.

It should care about software design, software architecture, implementation detail, codebase fit, technical tradeoffs, maintainability, correctness, and development style. It should not spend effort on process language, project management framing, motivational commentary, or methodology debates.

The skill exists to make an AI agent stronger at building and changing software. It is for technical work inside real repositories.

## Package Layout

This repository contains distributable Agent Skills packages for Codex, GitHub Copilot, and Claude Code.

| Path | Role |
| --- | --- |
| `.codex/skills/principal-engineer/` | The installable Codex skill package. |
| `.codex/skills/principal-engineer/SKILL.md` | The main runtime instructions Codex reads after the skill triggers. |
| `.codex/skills/principal-engineer/references/` | Bundled references that belong to the Codex skill and may be read when routed from `SKILL.md`. |
| `.codex/skills/principal-engineer/agents/openai.yaml` | UI metadata for the skill. |
| `.github/skills/principal-engineer/` | The installable GitHub Copilot project skill package. |
| `.github/skills/principal-engineer/SKILL.md` | The main instructions Copilot reads when it chooses this agent skill. |
| `.github/skills/principal-engineer/references/` | Bundled references that belong to the Copilot skill and may be read when routed from `SKILL.md`. |
| `.claude/skills/principal-engineer/` | The installable Claude Code skill package (usable as a project skill in this repo, or copied into `~/.claude/skills/`). |
| `.claude/skills/principal-engineer/SKILL.md` | The main instructions Claude Code reads when it invokes this skill. |
| `.claude/skills/principal-engineer/references/` | Bundled references that belong to the Claude Code skill and may be read when routed from `SKILL.md`. |

The Codex, Copilot, and Claude Code packages intentionally carry the same engineering behavior and reference set; they differ only in the host name inside the `SKILL.md` description. Keep all versions aligned when changing the skill's guidance. This alignment is enforced by CI: `scripts/check-skill-alignment.sh` (run by `.github/workflows/skill-alignment.yml`) fails on any reference drift or on any non-host difference between the three `SKILL.md` files.

## What This Skill Optimizes For

This skill pushes an AI agent toward:

- Software design that matches the real problem
- Architecture decisions that can survive implementation
- Concrete implementation work instead of abstract advice
- Careful reading of the existing codebase before proposing changes
- Respect for existing module boundaries, helper APIs, and local style
- Technical tradeoff analysis grounded in code and behavior
- Review discipline focused on bugs, regressions, risk, and maintainability
- Verification that fits the blast radius of the change
- Clear technical communication without performative seniority

## Recommended Companion Skills

`principal-engineer` works on its own, but it becomes stronger when paired with a small set of companion skills. These are not runtime dependencies and should not be auto-installed by the skill. Install them separately in the relevant agent host, then restart or reload that host so they can be discovered.

Do not bulk-install every skill from these repositories. Prefer the smallest useful subset. The paths below are Codex skill paths; Copilot users should install equivalent agent skills where available.

| Repository | Why it helps a principal-engineer agent | Suggested Codex skill paths |
| --- | --- | --- |
| [DietrichGebert/ponytail.git](https://github.com/DietrichGebert/ponytail.git) | Adds deletion pressure: catches over-engineering, speculative abstractions, unnecessary dependencies, and complexity that should be cut. | `skills/ponytail-review`, `skills/ponytail-audit` |
| [tanweai/pua.git](https://github.com/tanweai/pua.git) | Adds persistence pressure when the agent is stuck, looping, blaming the environment, or trying to hand work back without enough evidence. | `codex/pua`, optionally `codex/pua-loop` |
| [sstklen/yes.md.git](https://github.com/sstklen/yes.md.git) | Adds evidence and safety governance: avoid guessing, verify before completion, inspect ripple effects, and use available tools before asking the user. | `skills/yes-zh` for Traditional Chinese workflows, or `skills/yes` |
| [multica-ai/andrej-karpathy-skills.git](https://github.com/multica-ai/andrej-karpathy-skills.git) | Adds LLM coding guardrails: think before coding, keep edits surgical, avoid overcomplication, surface assumptions, and verify success criteria. | `skills/karpathy-guidelines` |
| [mattpocock/skills.git](https://github.com/mattpocock/skills.git) | Adds focused engineering workflows for codebase design, implementation, bug diagnosis, review, domain modeling, and repo setup. | `skills/engineering/setup-matt-pocock-skills`, `skills/engineering/codebase-design`, `skills/engineering/implement`, `skills/engineering/diagnosing-bugs`, `skills/engineering/code-review`, `skills/engineering/domain-modeling` |

The intended combination is:

- `principal-engineer` for main technical execution and tradeoff judgment.
- `karpathy-guidelines` to reduce common LLM coding mistakes before edits begin.
- `ponytail-review` or `ponytail-audit` to challenge unnecessary complexity.
- `yes-zh` or `yes` to enforce evidence, safety, verification, and ripple checks.
- `pua` only when persistence or anti-give-up pressure is needed.
- Matt Pocock engineering skills when a task needs their specific workflow, especially repo setup, codebase design, implementation, diagnosis, or code review.

## What This Skill Rejects

This skill intentionally excludes work that belongs to human organizational systems rather than AI technical execution.

It does not cover:

- Product management
- Project management
- People management
- Stakeholder management
- Roadmap planning
- Process governance
- Agile rituals
- TDD, SDD, BDD, or similar methodology frameworks
- Meeting design
- Team operating models
- Generic engineering culture advice
- Abstract motivational guidance

TDD, SDD, BDD, Agile, and similar practices may be useful for human software teams. They are written for human collaboration, team coordination, and process design. They are not the center of this AI skill.

For this repository, `principal-engineer` means technical execution, not methodology advocacy.

## Definition

An AI principal-engineer is a technical execution engine with strong software judgment.

It should:

- Read the system before deciding
- Prefer the codebase's actual patterns over invented abstractions
- Choose simple designs unless complexity clearly pays for itself
- Make architecture decisions that can be implemented cleanly
- Keep edits scoped to the requested outcome
- Preserve ownership boundaries and existing development style
- Use local helpers, APIs, and conventions before adding new machinery
- Identify real risks instead of creating process checklists
- Surface uncertainty when evidence is missing
- Deliver working changes, not just recommendations

## Development Style

The expected style is direct, pragmatic, and technically specific.

The agent should not hide weak assumptions behind confident language. It should not produce high-level commentary when implementation evidence is needed. It should not use the vocabulary of seniority as a substitute for concrete engineering work.

The output should feel like a strong technical engineer is working inside the repository: reading context, making bounded decisions, implementing carefully, verifying the result, and explaining only what matters.

## Maintaining This Skill

Maintenance follows a documented, evidence-backed methodology — mirror-sync discipline, adversarial review before large changes, behavioral fail-then-pass verification, blind A/B evals, and content-fidelity rules. See [MAINTENANCE.md](MAINTENANCE.md) before changing skill content.

## Intended Use

Use this skill when an AI coding agent needs principal-engineer-level discipline without importing human management frameworks.

For Codex, use the package under `.codex/skills/principal-engineer/`. For GitHub Copilot, use the project skill under `.github/skills/principal-engineer/`. For Claude Code, use the skill under `.claude/skills/principal-engineer/`.

The purpose is to improve the agent's behavior in software design, architecture, implementation, technical detail, and development style. Everything else is outside the scope.
