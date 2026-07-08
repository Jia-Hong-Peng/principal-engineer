#!/usr/bin/env bash
# Regression tests for check-skill-alignment.sh.
# Hermetic: each case builds a throwaway fixture tree and points the checker at it
# via the SKILL_ALIGN_ROOT seam, so tests never touch the real repo.
set -uo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
script="$here/check-skill-alignment.sh"
rel="skills/principal-engineer"
fails=0
ROOT=""

expect() { # <label> <expected-exit>
  local label="$1" want="$2" got
  SKILL_ALIGN_ROOT="$ROOT" bash "$script" >/dev/null 2>&1
  got=$?
  if [[ "$got" == "$want" ]]; then
    echo "PASS: $label (exit $got)"
  else
    echo "FAIL: $label (want $want, got $got)"; fails=1
  fi
}

build_fixture() { # aligned baseline tree into a fresh $ROOT
  ROOT="$(mktemp -d)"
  local spec dir name base
  for spec in codex:Codex github:Copilot claude:"Claude Code"; do
    dir=".${spec%%:*}"; name="${spec#*:}"
    base="$ROOT/$dir/$rel"
    mkdir -p "$base/references"
    printf '%s\n' \
      '---' \
      'name: principal-engineer' \
      "description: \"Use this. Make sure to use when $name must implement changes, and so on.\"" \
      '---' \
      '' \
      '# Principal Engineer' \
      '- shared body line' > "$base/SKILL.md"
    printf '%s\n' '# Ref' '- shared reference line' > "$base/references/architecture-system-design.md"
  done
}

# Case 1: an aligned tree passes.
build_fixture
expect "aligned tree passes" 0

# Case 2: a reference byte difference is caught.
build_fixture
printf '%s\n' '- drift' >> "$ROOT/.github/$rel/references/architecture-system-design.md"
expect "reference drift caught" 1

# Case 3 (the regression this fix adds): host-specific text in the BODY of each variant.
# The packages must be byte-identical apart from the description, so per-host body text is
# real divergence. A global host-token normalization would collapse all three to the same
# text and pass; description-scoped normalization keeps them distinct and fails.
build_fixture
printf '%s\n' '- see Codex docs'       >> "$ROOT/.codex/$rel/SKILL.md"
printf '%s\n' '- see Copilot docs'     >> "$ROOT/.github/$rel/SKILL.md"
printf '%s\n' '- see Claude Code docs' >> "$ROOT/.claude/$rel/SKILL.md"
expect "SKILL.md body host-token divergence caught" 1

# Case 4: a reference missing from one variant is caught.
build_fixture
rm "$ROOT/.codex/$rel/references/architecture-system-design.md"
expect "missing reference caught" 1

if [[ $fails -eq 0 ]]; then echo "ALL TESTS PASSED"; else echo "SOME TESTS FAILED"; fi
exit $fails
