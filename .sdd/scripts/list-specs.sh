#!/usr/bin/env bash
# =============================================================================
# SpecForge — list-specs.sh
# Display all specs in the registry with their status, mode, and title.
#
# Usage: .sdd/scripts/list-specs.sh [--no-colour]
#
#   --no-colour   Disable ANSI colour output (useful for piping or CI)
# =============================================================================
set -euo pipefail

# ── Resolve paths ─────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SDD_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
SPECS_DIR="${SDD_DIR}/specs"

# ── Colour flag ───────────────────────────────────────────────────────────────
USE_COLOUR=true
if [[ "${1:-}" == "--no-colour" || "${1:-}" == "--no-color" ]]; then
  USE_COLOUR=false
fi
# Also disable colour if stdout is not a terminal (e.g. piped to a file)
if [[ ! -t 1 ]]; then
  USE_COLOUR=false
fi

# ── Helpers ───────────────────────────────────────────────────────────────────
print_info() { printf '  %s\n' "$1"; }

# colour_status <status>
# Prints the status string wrapped in the appropriate ANSI code, or plain text.
colour_status() {
  local status="$1"
  if [[ "${USE_COLOUR}" == false ]]; then
    printf '%s' "${status}"
    return
  fi
  case "${status}" in
    draft)       printf '\033[33m%s\033[0m' "${status}" ;;   # yellow
    in-progress) printf '\033[34m%s\033[0m' "${status}" ;;   # blue
    stable)      printf '\033[32m%s\033[0m' "${status}" ;;   # green
    deprecated)  printf '\033[90m%s\033[0m' "${status}" ;;   # grey
    *)           printf '%s'                "${status}" ;;   # unrecognised — plain
  esac
}

# extract_field <field_name> <file>
# Reads a YAML front matter field value from a spec.md file.
# Returns empty string if field is not found.
# Works with grep + awk — no python, jq, or yq dependency.
extract_field() {
  local field="$1"
  local file="$2"
  # Match lines of the form "field: value" inside the front matter block.
  # We stop after the first match (head -1) to avoid false positives in the body.
  grep -m1 "^${field}:" "${file}" 2>/dev/null \
    | awk -F': ' '{
        # Strip leading/trailing whitespace from the value
        sub(/^[[:space:]]+/, "", $2)
        sub(/[[:space:]]+$/, "", $2)
        print $2
      }' \
  || true
}

# ── Preflight ─────────────────────────────────────────────────────────────────
if [[ ! -d "${SPECS_DIR}" ]]; then
  printf '\n'
  print_info "  \033[31m✗\033[0m Specs directory not found: .sdd/specs/"
  print_info "  The .sdd/ directory may be incomplete. Re-install SpecForge."
  printf '\n'
  exit 1
fi

# ── Collect specs ─────────────────────────────────────────────────────────────
# We build two parallel arrays: one for display rows, one for sort key.
# This avoids spawning a subshell per spec and keeps things fast at 100+ specs.
SPEC_COUNT=0

# Temporary storage for rows — we accumulate then print.
# Each row stored as a pipe-delimited string: ID|MODE|STATUS|TITLE
# (pipe is safe here because none of those fields contain pipes)
ROWS=()

for spec_dir in "${SPECS_DIR}"/*/; do
  # basename without trailing slash
  spec_id="${spec_dir%/}"
  spec_id="${spec_id##*/}"

  # Skip _prefixed dirs (examples, internal) and hidden dirs
  case "${spec_id}" in
    _*|.*) continue ;;
  esac

  spec_file="${spec_dir}spec.md"

  # Skip if spec.md doesn't exist in this folder
  [[ -f "${spec_file}" ]] || continue

  # Extract fields
  mode="$(extract_field "mode"   "${spec_file}")"
  status="$(extract_field "status" "${spec_file}")"
  title="$(extract_field "title"  "${spec_file}")"

  # Fallback values for malformed specs
  [[ -n "${mode}"   ]] || mode="?"
  [[ -n "${status}" ]] || status="?"
  [[ -n "${title}"  ]] || title="${spec_id}"

  ROWS+=("${spec_id}|${mode}|${status}|${title}")
  SPEC_COUNT=$(( SPEC_COUNT + 1 ))
done

# ── Render ────────────────────────────────────────────────────────────────────
printf '\n'
printf '  \033[1mSpecForge — Spec Registry\033[0m\n'
printf '  %s\n' "──────────────────────────────────────────────────────────────────────"
printf '  %-32s %-10s %-13s %s\n' "ID" "MODE" "STATUS" "TITLE"
printf '  %s\n' "──────────────────────────────────────────────────────────────────────"

if [[ "${SPEC_COUNT}" -eq 0 ]]; then
  printf '\n'
  print_info "No specs yet."
  printf '\n'
  print_info "Create your first spec:"
  print_info "  .sdd/scripts/new-spec.sh nano    my-first-fix"
  print_info "  .sdd/scripts/new-spec.sh feature my-first-feature"
  print_info "  .sdd/scripts/new-spec.sh system  my-first-architecture-change"
  printf '\n'
  exit 0
fi

for row in "${ROWS[@]}"; do
  # Split pipe-delimited row
  IFS='|' read -r spec_id mode status title <<< "${row}"

  # Truncate title if very long (> 35 chars) to keep the table readable
  if [[ "${#title}" -gt 35 ]]; then
    title="${title:0:32}..."
  fi

  # Status column: we print a fixed-width field manually because ANSI escape
  # codes inflate the string length and break printf column alignment.
  # Strategy: print ID and MODE with printf, then print STATUS with colour,
  # then pad manually, then print TITLE.
  printf '  %-32s %-10s ' "${spec_id}" "${mode}"
  colour_status "${status}"
  # Pad STATUS column to 13 chars (status max length is "in-progress" = 11 + 2 spaces)
  status_len="${#status}"
  pad=$(( 13 - status_len ))
  printf '%*s' "${pad}" ""
  printf '%s\n' "${title}"
done

printf '  %s\n' "──────────────────────────────────────────────────────────────────────"
printf '\n'

# Status summary
DRAFT_COUNT=0
IN_PROGRESS_COUNT=0
STABLE_COUNT=0
DEPRECATED_COUNT=0

for row in "${ROWS[@]}"; do
  IFS='|' read -r _id _mode status _title <<< "${row}"
  case "${status}" in
    draft)       DRAFT_COUNT=$(( DRAFT_COUNT + 1 )) ;;
    in-progress) IN_PROGRESS_COUNT=$(( IN_PROGRESS_COUNT + 1 )) ;;
    stable)      STABLE_COUNT=$(( STABLE_COUNT + 1 )) ;;
    deprecated)  DEPRECATED_COUNT=$(( DEPRECATED_COUNT + 1 )) ;;
  esac
done

printf '  %d spec(s): ' "${SPEC_COUNT}"
if [[ "${DRAFT_COUNT}" -gt 0 ]];       then printf '%d draft  '       "${DRAFT_COUNT}"; fi
if [[ "${IN_PROGRESS_COUNT}" -gt 0 ]]; then printf '%d in-progress  ' "${IN_PROGRESS_COUNT}"; fi
if [[ "${STABLE_COUNT}" -gt 0 ]];      then printf '%d stable  '      "${STABLE_COUNT}"; fi
if [[ "${DEPRECATED_COUNT}" -gt 0 ]];  then printf '%d deprecated'    "${DEPRECATED_COUNT}"; fi
printf '\n\n'

print_info "Commands:"
print_info "  new:    .sdd/scripts/new-spec.sh <mode> <id>"
print_info "  verify: .sdd/scripts/verify.sh <id>"
print_info "  update: .sdd/scripts/update-spec.sh <id>"
printf '\n'