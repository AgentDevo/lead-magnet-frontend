#!/usr/bin/env bash
# queue_enqueue.sh – Append a task to the simple file‑based queue.
# Usage: queue_enqueue.sh "<command>"
# Example: queue_enqueue.sh "bash ~/scripts/lan-scan.sh"

set -euo pipefail

QUEUE_DIR="$(cd "$(dirname "$0")/.." && pwd)/queue"
QUEUE_FILE="$QUEUE_DIR/tasks.json"
mkdir -p "$QUEUE_DIR"

TASK_CMD="$1"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
# Append a JSON object (one per line) – simple append, no race‑condition handling for now.
printf '{"timestamp":"%s","command":"%s"}\n' "$TIMESTAMP" "$TASK_CMD" >> "$QUEUE_FILE"

echo "Task enqueued: $TASK_CMD"
