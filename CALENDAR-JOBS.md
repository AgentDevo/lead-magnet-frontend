# OpenClaw Calendar & Scheduled Tasks

The Calendar view in Mission Control displays all cron jobs and scheduled tasks configured in your OpenClaw gateway.

## Creating Scheduled Tasks

Use the `cron` tool to add new scheduled tasks. Here are examples:

### 1. **Recurring Cron Job** (Daily at 9 AM)

```bash
cron action=add job='{
  "name": "Daily Report",
  "schedule": {
    "kind": "cron",
    "expr": "0 9 * * *",
    "tz": "UTC"
  },
  "payload": {
    "kind": "agentTurn",
    "message": "Generate daily summary report",
    "model": "haiku"
  },
  "sessionTarget": "isolated",
  "enabled": true
}'
```

### 2. **Interval Job** (Every 30 minutes)

```bash
cron action=add job='{
  "name": "Health Check",
  "schedule": {
    "kind": "every",
    "everyMs": 1800000
  },
  "payload": {
    "kind": "systemEvent",
    "text": "heartbeat"
  },
  "sessionTarget": "main",
  "enabled": true
}'
```

### 3. **One-Time Job** (Tomorrow at 6 PM)

```bash
cron action=add job='{
  "name": "Backup Database",
  "schedule": {
    "kind": "at",
    "at": "2026-03-10T18:00:00Z"
  },
  "payload": {
    "kind": "agentTurn",
    "message": "Backup critical data",
    "timeoutSeconds": 600
  },
  "sessionTarget": "isolated",
  "enabled": true
}'
```

## Cron Expression Format

Standard cron format (5 fields):

```
┌─── minute (0-59)
│ ┌─── hour (0-23)
│ │ ┌─── day of month (1-31)
│ │ │ ┌─── month (1-12)
│ │ │ │ ┌─── day of week (0-6, Sunday=0)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

### Common Examples

| Expression | Meaning |
|-----------|---------|
| `0 9 * * *` | Every day at 9:00 AM |
| `0 */4 * * *` | Every 4 hours |
| `30 2 * * 0` | Every Sunday at 2:30 AM |
| `0 0 1 * *` | First day of every month at midnight |
| `*/5 * * * *` | Every 5 minutes |

## Managing Jobs

### List all jobs

```bash
cron action=list
```

### Update a job

```bash
cron action=update jobId=abc123 patch='{
  "enabled": false
}'
```

### Delete a job

```bash
cron action=remove jobId=abc123
```

### Run a job immediately

```bash
cron action=run jobId=abc123
```

### Check job run history

```bash
cron action=runs jobId=abc123
```

## Payload Types

### **agentTurn** (Isolated sessions only)

Runs an agent with a prompt:

```json
{
  "kind": "agentTurn",
  "message": "Your task description",
  "model": "haiku|sonnet|opus",
  "thinking": "enabled|disabled",
  "timeoutSeconds": 300
}
```

### **systemEvent** (Main session only)

Injects a text message into the main session:

```json
{
  "kind": "systemEvent",
  "text": "Your message or command"
}
```

## Delivery & Notifications

Optionally add delivery configuration to announce results:

```json
{
  "delivery": {
    "mode": "announce|webhook",
    "channel": "optional-channel-id",
    "to": "optional-recipient",
    "bestEffort": true
  }
}
```

## Viewing Results

- **Calendar view:** Shows upcoming scheduled tasks
- **Activity feed:** Logs when jobs run
- **Job history:** Use `cron action=runs` to see past executions

## Examples in Your Workspace

Currently scheduled:
- *(None)* — Create your first job above!

### Suggested Jobs to Add

1. **Heartbeat Checker**
   ```
   Every 30 min: Check backlog tasks + server health
   ```

2. **Daily Memory Sync**
   ```
   Every day at midnight: Sync MEMORY.md and daily logs
   ```

3. **Weekly Report**
   ```
   Every Friday at 5 PM: Generate weekly summary
   ```

4. **LAN Scan**
   ```
   Every 6 hours: Scan for new/missing devices
   ```

---

Use the Calendar view to monitor all scheduled tasks at a glance! 📅
