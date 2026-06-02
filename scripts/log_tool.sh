#!/bin/bash
# log_tool.sh - Logs tool invocation and enforces permissions
SCRIPT_NAME=$(basename "$0")
ARGS=("$@")
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
USER_NAME="${USER:-$(whoami)}"
# Resolve paths relative to this script
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
PERM_FILE="$SCRIPT_DIR/../config/permissions.yaml"
LOG_FILE="$SCRIPT_DIR/../logs/audit.log"
# Rotate if larger than 5 MiB
MAX_SIZE=$((5 * 1024 * 1024))
if [ -f "$LOG_FILE" ] && [ $(stat -c%s "$LOG_FILE") -ge $MAX_SIZE ]; then
  mv "$LOG_FILE" "${LOG_FILE}.1"
  : > "$LOG_FILE"
fi
# Function to write a JSON line to the audit log
log_json() {
  echo "$1" >> "$LOG_FILE"
}
# Permission check: extract allowed users for this script from permissions.yaml
# Use awk to find the users list for this script
ALLOWED_USERS=$(awk -v name="$SCRIPT_NAME" '$0==name":" {found=1; next} found && /users:/ {gsub(/[\[\],]/,"",$0); split($0,a,":"); print a[2]; exit}' "$PERM_FILE")
if [[ -z "$ALLOWED_USERS" ]]; then
  # No users defined, deny by default
  ALLOWED_USERS=""
fi
if [[ ! " $ALLOWED_USERS " =~ " $USER_NAME " ]]; then
  ERR_JSON=$(printf '{"timestamp":"%s","tool":"%s","user":"%s","args":"%s","exit_code":1,"error":"Permission denied"}' "$TIMESTAMP" "$SCRIPT_NAME" "$USER_NAME" "${ARGS[*]}")
  log_json "$ERR_JSON"
  echo "Permission denied for $USER_NAME on $SCRIPT_NAME"
  exit 1
fi
# Log start event
START_JSON=$(printf '{"timestamp":"%s","tool":"%s","user":"%s","args":"%s","event":"start"}' "$TIMESTAMP" "$SCRIPT_NAME" "$USER_NAME" "${ARGS[*]}")
log_json "$START_JSON"
# Trap to log completion with exit code
__log_tool_finish() {
  EXIT_CODE=$?
  END_TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  END_JSON=$(printf '{"timestamp":"%s","tool":"%s","user":"%s","args":"%s","exit_code":%d}' "$END_TS" "$SCRIPT_NAME" "$USER_NAME" "${ARGS[*]}" $EXIT_CODE)
  log_json "$END_JSON"
}
trap __log_tool_finish EXIT
# Continue with the rest of the script (source will return here)
