#!/usr/bin/env bash
# run_parallel.sh – Execute a list of commands in parallel with a max concurrency limit.
# Usage: ./run_parallel.sh <max_concurrency> "cmd1" "cmd2" ...
# Example: ./run_parallel.sh 4 "bash lan-scan.sh" "bash check-backlog.sh"

set -euo pipefail

MAX_CONCURRENCY=$1
shift

if [[ -z "$MAX_CONCURRENCY" || "$MAX_CONCURRENCY" -le 0 ]]; then
  echo "Invalid concurrency limit: $MAX_CONCURRENCY" >&2
  exit 1
fi

# Function to run a single command and log its start/completion via log_tool.sh
run_cmd() {
  local cmd="$1"
  # Source the logging helper so that the command is wrapped automatically.
  # The helper logs start and exit status.
  source "$(dirname "$0")/log_tool.sh" "$cmd"
  # Execute the actual command.
  eval "$cmd"
}

# Export function for subshells
export -f run_cmd

# Use a simple job control loop
for cmd in "$@"; do
  # Wait if we reached max concurrency
  while [[ $(jobs -r | wc -l) -ge $MAX_CONCURRENCY ]]; do
    sleep 0.2
  done
  # Run in background
  bash -c "run_cmd \"$cmd\"" &
done

# Wait for all background jobs to finish
wait

echo "All parallel jobs completed."
