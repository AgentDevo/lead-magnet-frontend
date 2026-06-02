# BOOT.md - OpenClaw Startup Instructions

Enable hooks.internal.enabled

# Start Mission Control static server (port 7200)
exec: bash -c "cd ~/.openclaw/workspace/mission-control-website && nohup python3 -m http.server 7200 &>/tmp/mc.log & disown"

# Start Mission Control Next.js app (port 3000)
exec: bash -c "cd ~/.openclaw/workspace/mission-control && nohup npm run dev -- -p 3000 -H 0.0.0.0 &>/tmp/mc-next.log & disown"