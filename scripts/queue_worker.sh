#!/usr/bin/env bash
# queue_worker.sh – Simple file‑based task queue worker.
# It reads tasks from queue/tasks.json (one JSON object per line),
# executes the command, logs via log_tool.sh, and removes the processed entry.
# Usage: ./queue_worker.sh [--once]
#   --once   Process only the first pending task and exit (useful for cron).

set -euo pipefail

QUEUE_DIR="$(cd "$(dirname "$0")/.." && pwd)/queue"
QUEUE_FILE="$QUEUE_DIR/tasks.json"
LOCK_FILE="$QUEUE_DIR/worker.lock"

# Acquire lock to avoid multiple workers running concurrently.
exec 200>"$LOCK_FILE"
flock -n 200 || { echo "Another worker is running"; exit 1; }

process_one() {
  # Read first line (task) safely.
  if ! read -r line < "$QUEUE_FILE"; then
    echo "Queue empty"
    return 1
  fi
  # Parse JSON fields (timestamp, command) using jq if available, else fallback.
  CMD=$(echo "$line" | jq -r .command 2>/dev/null || echo "$(echo $line | sed -n 's/.*"command":"\([^\"]*\)".*/\1/p')")
  if [[ -z "$CMD" ]]; then
    echo "Malformed task entry: $line" >&2
    # Remove malformed line to avoid infinite loop.
    tail -n +2 "$QUEUE_FILE" > "$QUEUE_FILE.tmp" && mv "$QUEUE_FILE.tmp" "$QUEUE_FILE"
    return 1
  fi
  echo "Executing queued task: $CMD"
  # Log start/completion via log_tool.sh (wrap command).
  source "$(dirname "$0")/log_tool.sh" "$CMD"
  eval "$CMD"
  # Remove the processed line.
  tail -n +2 "$QUEUE_FILE" > "$QUEUE_FILE.tmp" && mv "$QUEUE_FILE.tmp" "$QUEUE_FILE"
}

if [[ "${1-}" == "--once" ]]; then
  process_one || true
  exit 0
fi

# Continuous mode – keep processing until queue empty.
while true; do
  if ! process_one; then
    # No more tasks – exit loop.
    break
  fi
done

echo "Queue worker finished."
