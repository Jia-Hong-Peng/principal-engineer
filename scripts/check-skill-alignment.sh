#!/usr/bin/env bash
# Fitness function: the three host variants of the principal-engineer skill must stay aligned.
#
# The repo intentionally ships the same skill for Codex (.codex), GitHub Copilot (.github),
# and Claude Code (.claude). References must be byte-identical across all three; SKILL.md must
# be identical after normalizing the host name. This script fails on any drift so CI (and a
# local run) enforce the alignment the readme asks contributors to keep by hand.
#
# Usage: bash scripts/check-skill-alignment.sh
set -euo pipefail

# SKILL_ALIGN_ROOT overrides the repo root (a seam for the hermetic test harness).
root="${SKILL_ALIGN_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
rel="skills/principal-engineer"
status=0

# 1. Reference parity. Treat .claude as the canonical reference set; .codex/.github must match.
ref_dir="$root/.claude/$rel/references"
for f in "$ref_dir"/*.md; do
  name="$(basename "$f")"
  for v in .codex .github; do
    other="$root/$v/$rel/references/$name"
    if [[ ! -f "$other" ]]; then
      echo "MISSING: $v/$rel/references/$name"; status=1; continue
    fi
    if ! diff -q "$f" "$other" >/dev/null; then
      echo "DRIFT (reference): $name differs between .claude and $v"; status=1
    fi
  done
done

# Catch reference files present in .codex/.github but absent from .claude.
for v in .codex .github; do
  for f in "$root/$v/$rel/references"/*.md; do
    name="$(basename "$f")"
    if [[ ! -f "$ref_dir/$name" ]]; then
      echo "EXTRA (reference): $v has $name not present in .claude"; status=1
    fi
  done
done

# 2. SKILL.md parity after host-token normalization (the only legitimate difference).
# Normalize ONLY the description line, so a host name that legitimately appears in the
# body (e.g. an example) still counts as real drift instead of being silently masked.
normalize() { sed -E '/^description:/ s/Claude Code|Copilot|Codex/__HOST__/g' "$1"; }
base="$root/.claude/$rel/SKILL.md"
for v in .codex .github; do
  other="$root/$v/$rel/SKILL.md"
  if ! diff -q <(normalize "$base") <(normalize "$other") >/dev/null; then
    echo "DRIFT (SKILL.md): $v differs from .claude beyond the host name"; status=1
  fi
done

# 3. Each SKILL.md must still name its own host (guards a bad normalization masking real drift).
grep -q "when Codex must implement changes"       "$root/.codex/$rel/SKILL.md"  || { echo "SKILL.md .codex missing its host token";       status=1; }
grep -q "when Copilot must implement changes"     "$root/.github/$rel/SKILL.md" || { echo "SKILL.md .github missing its host token";      status=1; }
grep -q "when Claude Code must implement changes" "$root/.claude/$rel/SKILL.md" || { echo "SKILL.md .claude missing its host token";      status=1; }

if [[ $status -eq 0 ]]; then
  echo "OK: all three skill variants are aligned."
fi
exit $status
