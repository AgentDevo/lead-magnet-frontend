# Audit Trail

The OpenClaw system now records every tool invocation in `logs/audit.log` as JSON lines. Each entry includes:

- `timestamp` – UTC time of the event
- `tool` – name of the script invoked
- `user` – OS user executing the script
- `args` – command‑line arguments
- `event` – `start` for the beginning of execution
- `exit_code` – final exit status (0 = success)
- `error` – optional error message (e.g., permission denied)

The log file is appended atomically by `scripts/log_tool.sh` and can be queried with standard tools (`jq`, `tail`, etc.).