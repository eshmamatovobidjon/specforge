#!/usr/bin/env bash
# =============================================================================
# SpecForge — verify.sh
# Generate a structured verification prompt for a spec.
# Paste the output into your AI tool to audit implementation against contracts.
#
# Usage: .sdd/scripts/verify.sh <spec-id>
#
# This script makes NO AI calls. It produces a prompt you paste manually.
# Verification is always human-triggered and human-judged.
# =============================================================================
set -euo pipefail

# ── Resolve paths ─────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SDD_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

# ── Helpers ───────────────────────────────────────────────────────────────────
print_ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; }
print_err()  { printf '  \033[31m✗\033[0m %s\n' "$1" >&2; }
print_info() { printf '  %s\n' "$1"; }

extract_field() {
  local field="$1"
  local file="$2"
  grep -m1 "^${field}:" "${file}" 2>/dev/null \
    | awk -F': ' '{
        sub(/^[[:space:]]+/, "", $2)
        sub(/[[:space:]]+$/, "", $2)
        print $2
      }' \
  || true
}

print_usage() {
  printf '\n'
  print_info "Usage: .sdd/scripts/verify.sh <spec-id>"
  printf '\n'
  print_info "Generates a verification prompt to paste into your AI tool."
  print_info "The AI will audit the codebase against the spec's contracts."
  printf '\n'
  print_info "Example:"
  print_info "  .sdd/scripts/verify.sh freight-matching"
  printf '\n'
  print_info "Available specs:"
  local found=false
  for spec_dir in "${SDD_DIR}/specs"/*/; do
    local spec_id
    spec_id="${spec_dir%/}"
    spec_id="${spec_id##*/}"
    case "${spec_id}" in _*|.*) continue ;; esac
    [[ -f "${spec_dir}spec.md" ]] || continue
    print_info "  ${spec_id}"
    found=true
  done
  if [[ "${found}" == false ]]; then
    print_info "  (none yet — run new-spec.sh to create one)"
  fi
  printf '\n'
}

# ── Argument validation ───────────────────────────────────────────────────────
SPEC_ID="${1:-}"

if [[ -z "${SPEC_ID}" ]]; then
  print_usage
  exit 1
fi

SPEC_FILE="${SDD_DIR}/specs/${SPEC_ID}/spec.md"
NOTES_FILE="${SDD_DIR}/specs/${SPEC_ID}/notes.md"

if [[ ! -f "${SPEC_FILE}" ]]; then
  printf '\n'
  print_err "No spec found at: .sdd/specs/${SPEC_ID}/spec.md"
  print_err "Check the spec ID with: .sdd/scripts/list-specs.sh"
  printf '\n'
  exit 1
fi

# ── Extract spec metadata ─────────────────────────────────────────────────────
MODE="$(extract_field "mode"   "${SPEC_FILE}")"
STATUS="$(extract_field "status" "${SPEC_FILE}")"
TITLE="$(extract_field "title"  "${SPEC_FILE}")"

[[ -n "${MODE}"   ]] || MODE="unknown"
[[ -n "${STATUS}" ]] || STATUS="unknown"
[[ -n "${TITLE}"  ]] || TITLE="${SPEC_ID}"

# ── Status warning ────────────────────────────────────────────────────────────
printf '\n'

if [[ "${STATUS}" == "draft" ]]; then
  printf '  \033[33m⚠\033[0m  Spec status is "draft" — implementation may not have started yet.\n'
  printf '  \033[33m⚠\033[0m  Verify anyway? This is most useful when status is "in-progress".\n'
  printf '\n'
fi

if [[ "${STATUS}" == "deprecated" ]]; then
  printf '  \033[33m⚠\033[0m  Spec status is "deprecated" — this feature may no longer exist.\n'
  printf '\n'
fi

# ── Header ────────────────────────────────────────────────────────────────────
printf '  \033[1mSpecForge verification prompt\033[0m\n'
printf '  Spec:   %s\n' "${TITLE}"
printf '  ID:     %s\n' "${SPEC_ID}"
printf '  Mode:   %s\n' "${MODE}"
printf '  Status: %s\n' "${STATUS}"
printf '\n'
print_info "Copy everything between the lines and paste it into your AI tool:"
printf '\n'

# ── Generate the verification prompt ─────────────────────────────────────────
# The prompt uses heredoc for readability. Output goes to stdout so the
# developer can pipe it, copy it, or redirect it.

NOTES_INSTRUCTION=""
if [[ -f "${NOTES_FILE}" ]]; then
  NOTES_INSTRUCTION="  │    - \`.sdd/specs/${SPEC_ID}/notes.md\`"
fi

cat <<PROMPT
  ┌─────────────────────────────────────────────────────────────────────────
  │
  │  SPECFORGE VERIFICATION — ${SPEC_ID}
  │  This is an audit task only. Do NOT write any new code.
  │
  │  Step 1 — Load context
  │  Read the following files before doing anything else:
  │    - \`.sdd/memory/AGENTS.md\`
  │    - \`.sdd/specs/${SPEC_ID}/spec.md\`
${NOTES_INSTRUCTION}
  │
  │  Step 2 — Audit each contract
  │  For every item in the spec's "Contracts" (or "Change contract") section,
  │  examine the current codebase and report one of:
  │
  │    ✓  SATISFIED    — fully met. Cite the file and function/line.
  │    ~  PARTIAL      — partially met. State exactly what is missing.
  │    ✗  NOT MET      — not implemented. State what needs to be done.
  │    ?  UNVERIFIABLE — cannot be determined from static code inspection.
  │
  │  Step 3 — Check for undocumented behaviour
  │  List any implementation that exists but is NOT described in the spec.
  │  These are either scope creep or contracts that need to be added to spec.md.
  │
  │  Step 4 — Check constraints
  │  For each item in the spec's "Constraints" section, confirm whether the
  │  implementation respects it. Flag any violations.
  │
  │  Step 5 — Recommend status
  │  Based on your findings, recommend ONE of:
  │    → "Ready for stable"      — all contracts ✓, no violations
  │    → "Needs work"            — list what must be fixed first
  │    → "Spec needs updating"   — implementation diverged; spec.md should change
  │
  └─────────────────────────────────────────────────────────────────────────
PROMPT

# ── Post-prompt guidance ──────────────────────────────────────────────────────
printf '\n'
print_info "After running verification:"
print_info "  All contracts ✓ and no violations:"
print_info "    → .sdd/scripts/update-spec.sh ${SPEC_ID} stable"
printf '\n'
print_info "  Contracts failing or constraints violated:"
print_info "    → Fix the issues, then run verify.sh again"
printf '\n'
print_info "  Implementation diverged from the spec:"
print_info "    → Use /spec-update ${SPEC_ID} (Claude Code)"
print_info "    → Or run: .sdd/scripts/update-spec.sh ${SPEC_ID}"
printf '\n'