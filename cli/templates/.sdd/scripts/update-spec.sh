#!/usr/bin/env bash
# =============================================================================
# SpecPact — update-spec.sh
# Update a spec's status after implementation, and manage the notes.md lifecycle.
# Also generates an AI prompt to sync spec.md if implementation diverged.
#
# Usage: .sdd/scripts/update-spec.sh <spec-id> [new-status]
#
#   spec-id     — the spec to update
#   new-status  — optional: draft | in-progress | stable | deprecated
#                 If omitted, you will be prompted to choose.
# =============================================================================
set -euo pipefail

# ── Resolve paths ─────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SDD_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

# ── Helpers ───────────────────────────────────────────────────────────────────
print_ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; }
print_err()  { printf '  \033[31m✗\033[0m %s\n' "$1" >&2; }
print_warn() { printf '  \033[33m⚠\033[0m %s\n' "$1"; }
print_info() { printf '  %s\n' "$1"; }

# Portable in-place sed. Works on BSD sed (macOS) and GNU sed (Linux).
sed_inplace() {
  local expression="$1"
  local file="$2"
  sed -i.bak "$expression" "$file"
  rm -f "${file}.bak"
}

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

is_valid_status() {
  local s="$1"
  [[ "${s}" == "draft"       ]] ||
  [[ "${s}" == "in-progress" ]] ||
  [[ "${s}" == "stable"      ]] ||
  [[ "${s}" == "deprecated"  ]]
}

print_usage() {
  printf '\n'
  print_info "Usage: .sdd/scripts/update-spec.sh <spec-id> [new-status]"
  printf '\n'
  print_info "  new-status (optional): draft | in-progress | stable | deprecated"
  printf '\n'
  print_info "Examples:"
  print_info "  .sdd/scripts/update-spec.sh freight-matching"
  print_info "  .sdd/scripts/update-spec.sh freight-matching stable"
  print_info "  .sdd/scripts/update-spec.sh auth-jwt-migration deprecated"
  printf '\n'
  print_info "Available specs:"
  local found=false
  for spec_dir in "${SDD_DIR}/specs"/*/; do
    local spec_id
    spec_id="${spec_dir%/}"
    spec_id="${spec_id##*/}"
    case "${spec_id}" in _*|.*) continue ;; esac
    [[ -f "${spec_dir}spec.md" ]] || continue
    local s
    s="$(extract_field "status" "${spec_dir}spec.md")"
    print_info "  ${spec_id}  (${s:-?})"
    found=true
  done
  if [[ "${found}" == false ]]; then
    print_info "  (none yet)"
  fi
  printf '\n'
}

# ── Argument validation ───────────────────────────────────────────────────────
SPEC_ID="${1:-}"
NEW_STATUS="${2:-}"

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

# Validate new-status if it was provided as an argument
if [[ -n "${NEW_STATUS}" ]] && ! is_valid_status "${NEW_STATUS}"; then
  printf '\n'
  print_err "Invalid status: '${NEW_STATUS}'"
  print_err "Status must be one of: draft, in-progress, stable, deprecated"
  printf '\n'
  exit 1
fi

# ── Read current state ────────────────────────────────────────────────────────
CURRENT_STATUS="$(extract_field "status" "${SPEC_FILE}")"
CURRENT_MODE="$(extract_field "mode" "${SPEC_FILE}")"
TITLE="$(extract_field "title" "${SPEC_FILE}")"

[[ -n "${CURRENT_STATUS}" ]] || CURRENT_STATUS="unknown"
[[ -n "${CURRENT_MODE}"   ]] || CURRENT_MODE="unknown"
[[ -n "${TITLE}"          ]] || TITLE="${SPEC_ID}"

TODAY="$(date +%Y-%m-%d)"

# ── Display current state ─────────────────────────────────────────────────────
printf '\n'
printf '  \033[1mUpdating spec:\033[0m %s\n' "${TITLE}"
printf '  ID:    %s\n' "${SPEC_ID}"
printf '  Mode:  %s\n' "${CURRENT_MODE}"
printf '  Status: %s\n' "${CURRENT_STATUS}"
printf '\n'

# ── Prompt for new status if not provided ─────────────────────────────────────
if [[ -z "${NEW_STATUS}" ]]; then
  print_info "Status flow: draft → in-progress → stable → deprecated"
  printf "  New status (leave blank to keep '${CURRENT_STATUS}'): "
  read -r NEW_STATUS
  NEW_STATUS="${NEW_STATUS:-}"

  # If blank, keep current — skip status update
  if [[ -z "${NEW_STATUS}" ]]; then
    NEW_STATUS="${CURRENT_STATUS}"
    print_info "Status unchanged: ${CURRENT_STATUS}"
  fi
fi

# Re-validate after potential prompt input
if ! is_valid_status "${NEW_STATUS}"; then
  printf '\n'
  print_err "Invalid status: '${NEW_STATUS}'"
  print_err "Status must be one of: draft, in-progress, stable, deprecated"
  printf '\n'
  exit 1
fi

# ── Apply status update ───────────────────────────────────────────────────────
STATUS_CHANGED=false

if [[ "${NEW_STATUS}" != "${CURRENT_STATUS}" ]]; then
  # Update status field in front matter
  sed_inplace "s|^status: .*|status: ${NEW_STATUS}|" "${SPEC_FILE}"
  # Update the updated date
  sed_inplace "s|^updated: .*|updated: ${TODAY}|"    "${SPEC_FILE}"
  print_ok "Status updated: ${CURRENT_STATUS} → ${NEW_STATUS}"
  STATUS_CHANGED=true
else
  # Still bump the updated date on explicit invocation
  sed_inplace "s|^updated: .*|updated: ${TODAY}|" "${SPEC_FILE}"
  print_ok "Updated date refreshed: ${TODAY}"
fi

# ── Notes.md lifecycle ────────────────────────────────────────────────────────
# notes.md is ephemeral. Prompt to delete it when spec reaches stable.
if [[ "${NEW_STATUS}" == "stable" && -f "${NOTES_FILE}" ]]; then
  printf '\n'
  print_warn "notes.md exists and status is now 'stable'."
  print_info "notes.md is ephemeral — it provided implementation context"
  print_info "and is no longer needed once the spec is stable."
  printf "  Delete .sdd/specs/${SPEC_ID}/notes.md? (y/n): "
  read -r DELETE_NOTES
  if [[ "${DELETE_NOTES}" =~ ^[Yy]$ ]]; then
    rm "${NOTES_FILE}"
    print_ok "notes.md deleted."
  else
    print_info "notes.md kept. You can delete it manually at any time."
  fi
fi

# ── Deprecation reminder ──────────────────────────────────────────────────────
if [[ "${NEW_STATUS}" == "deprecated" ]]; then
  printf '\n'
  print_warn "Spec marked as deprecated."
  print_info "Remember: do NOT delete the spec folder."
  print_info "Deprecated specs are kept as a permanent record of what was built and why."
  if [[ -f "${NOTES_FILE}" ]]; then
    printf "  Delete notes.md now that spec is deprecated? (y/n): "
    read -r DEL_NOTES_DEP
    if [[ "${DEL_NOTES_DEP}" =~ ^[Yy]$ ]]; then
      rm "${NOTES_FILE}"
      print_ok "notes.md deleted."
    fi
  fi
fi

# ── Spec-sync prompt ──────────────────────────────────────────────────────────
# Offer the spec-sync AI prompt whenever status changes, in case implementation
# diverged from what the spec says.
printf '\n'
if [[ "${STATUS_CHANGED}" == true ]]; then
  print_info "If the implementation diverged from the spec during development,"
  print_info "use this prompt to bring spec.md back in sync with what was built:"
  printf '\n'

cat <<PROMPT
  ┌─────────────────────────────────────────────────────────────────────────
  │
  │  SPECPACT SPEC SYNC — ${SPEC_ID}
  │  Bring spec.md in sync with what was actually implemented.
  │
  │  Step 1 — Load context
  │  Read these files:
  │    - \`.sdd/memory/AGENTS.md\`
  │    - \`.sdd/specs/${SPEC_ID}/spec.md\`
  │
  │  Step 2 — Compare spec against implementation
  │  Examine the current codebase. Find differences between what spec.md
  │  declares and what is actually implemented. Focus on:
  │    - Contracts: are any missing or inaccurate?
  │    - Interfaces: do the actual signatures match the spec?
  │    - Data shapes: do the actual fields match the spec?
  │    - Constraints: are any constraints no longer accurate?
  │
  │  Step 3 — Propose specific edits to spec.md
  │  Show every proposed change clearly as: BEFORE → AFTER
  │
  │  Rules you must follow:
  │    • Do NOT change the spec's intent, title, or id
  │    • Do NOT remove contracts that are still met by the implementation
  │    • DO add contracts that are met but were not documented
  │    • DO correct interface signatures that changed during implementation
  │    • DO update the "updated:" date in front matter to today
  │    • Keep the spec compact — it must still fit on one screen
  │
  │  Step 4 — Ask for confirmation before applying any changes
  │  Show the proposed diff and wait for "apply" before editing spec.md.
  │
  └─────────────────────────────────────────────────────────────────────────
PROMPT

fi

# ── Final summary ─────────────────────────────────────────────────────────────
printf '\n'
print_info "Spec file: .sdd/specs/${SPEC_ID}/spec.md"
printf '\n'