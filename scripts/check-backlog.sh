#!/bin/bash
source "$(dirname "$0")/log_tool.sh"
# check-backlog.sh - Check taskboard for backlog items assigned to Devo and auto-work them

TASKS_FILE="$HOME/.openclaw/workspace/tasks.json"
AGENT_ID="1"  # Devo

if [ ! -f "$TASKS_FILE" ]; then
  echo "⚠️ tasks.json not found"
  exit 1
fi

# Find backlog tasks assigned to this agent
BACKLOG_TASKS=$(jq -r ".tasks[] | select(.status == \"Backlog\" and .agent_id == \"$AGENT_ID\") | .id" "$TASKS_FILE")

if [ -z "$BACKLOG_TASKS" ]; then
  echo "✅ No backlog tasks assigned to Devo"
  exit 0
fi

echo "📋 Found backlog task(s) assigned to Devo:"
echo "$BACKLOG_TASKS" | while read TASK_ID; do
  # Get task details
  TASK=$(jq ".tasks[] | select(.id == \"$TASK_ID\")" "$TASKS_FILE")
  TITLE=$(echo "$TASK" | jq -r '.title')
  PRIORITY=$(echo "$TASK" | jq -r '.priority')
  
  echo "  ⏳ Moving to In Progress: [$PRIORITY] $TITLE (ID: $TASK_ID)"
  
  # Update task status to "In Progress"
  jq ".tasks[] |= if .id == \"$TASK_ID\" then .status = \"In Progress\" | .updated_at = \"$(date -u +'%Y-%m-%dT%H:%M:%SZ')\" else . end" "$TASKS_FILE" > "$TASKS_FILE.tmp"
  mv "$TASKS_FILE.tmp" "$TASKS_FILE"
  
  # Log to activity
  TIMESTAMP=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
  echo "    ✓ Status updated at $TIMESTAMP"
done

echo ""
echo "💡 Backlog tasks are now In Progress and awaiting work."
echo "💬 Tip: Use heartbeat to spawn subagents to tackle these tasks."
