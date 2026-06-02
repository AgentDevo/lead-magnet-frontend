#!/bin/bash

# Heartbeat refresh script for Mission Control updates
# Refreshes office animation and token/cost tracking

echo "🎨 Refreshing office animation..."
curl -s -X POST http://localhost:3000/api/refresh-office \
  -H "Content-Type: application/json" \
  -d '{"action":"refresh"}' | jq -r '.message' 2>/dev/null || echo "Office refresh queued"

echo "💰 Refreshing token/cost tracking..."
curl -s -X POST http://localhost:3000/api/refresh-tokens \
  -H "Content-Type: application/json" \
  -d '{"action":"refresh"}' | jq -r '.message' 2>/dev/null || echo "Token refresh queued"

echo "✅ Mission Control updates completed"
