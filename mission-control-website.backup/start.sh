#!/bin/bash
# Mission Control Dashboard - persistent start script
# Run this to start the server; it auto-restarts on crash

DIR="$(cd "$(dirname "$0")" && pwd)"

while true; do
    echo "[$(date -u)] Starting Mission Control on port 7200..." >> /tmp/mc.log
    cd "$DIR"
    python3 -m http.server 7200 >> /tmp/mc.log 2>&1
    echo "[$(date -u)] Server exited, restarting in 5s..." >> /tmp/mc.log
    sleep 5
done
