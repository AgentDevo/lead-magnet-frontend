#!/usr/bin/env bash
# web_fetch_cached.sh – Wrapper around the OpenClaw web_fetch tool with a simple file‑system cache.
# Usage: web_fetch_cached.sh <url>
# Returns the cached markdown/text if present and fresh (TTL 1h), otherwise calls the built‑in web_fetch tool.

set -euo pipefail

URL="$1"
CACHE_DIR="$(dirname "$0")/../cache/web_fetch"
mkdir -p "$CACHE_DIR"
# Use a safe filename based on URL hash
HASH=$(echo -n "$URL" | sha256sum | cut -d' ' -f1)
CACHE_FILE="$CACHE_DIR/${HASH}.cache"
TTL=$((60 * 60)) # 1 hour in seconds

# If cache exists and is fresh, output it
if [ -f "$CACHE_FILE" ]; then
  MOD_TIME=$(stat -c %Y "$CACHE_FILE")
  NOW=$(date +%s)
  AGE=$((NOW - MOD_TIME))
  if [ $AGE -lt $TTL ]; then
    cat "$CACHE_FILE"
    exit 0
  fi
fi

# No fresh cache – invoke the OpenClaw web_fetch tool via the internal API.
# We use the OpenClaw tool directly via exec (the tool name is "web_fetch").
# The tool prints the extracted markdown to stdout.
web_fetch_output=$(web_fetch url="$URL" extractMode=markdown maxChars=200000)
# Save to cache
printf "%s" "$web_fetch_output" > "$CACHE_FILE"
# Return the result
printf "%s" "$web_fetch_output"
