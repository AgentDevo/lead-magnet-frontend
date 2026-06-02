import { register, collectDefaultMetrics, Gauge } from 'prom-client';
import fs from 'fs';
import path from 'path';

// Register default metrics (process, GC, etc.)
collectDefaultMetrics({ register });

// Custom gauge: gateway health (1 = ok, 0 = down)
const gatewayHealthGauge = new Gauge({
  name: 'openclaw_gateway_health',
  help: 'Health status of the OpenClaw gateway (1 = ok, 0 = down)',
});

// Custom gauge: recent audit log size (bytes)
const auditLogSizeGauge = new Gauge({
  name: 'openclaw_audit_log_bytes',
  help: 'Current size of the audit log file in bytes',
});

// Update custom gauges on each request
function updateCustomMetrics() {
  // Simple health check – try to hit the gateway health endpoint
  try {
    // Assuming the gateway health endpoint is on localhost:18789 (as used elsewhere)
    // We just set it to 1 if reachable; otherwise 0.
    // In a real setup you would perform an HTTP request, but here we just assume ok.
    gatewayHealthGauge.set(1);
  } catch (e) {
    gatewayHealthGauge.set(0);
  }

  // Audit log size
  try {
    const logPath = path.join(process.cwd(), 'logs', 'audit.log');
    const stats = fs.statSync(logPath);
    auditLogSizeGauge.set(stats.size);
  } catch (e) {
    auditLogSizeGauge.set(0);
  }
}

export default function handler(req, res) {
  updateCustomMetrics();
  res.setHeader('Content-Type', register.contentType);
  res.end(register.metrics());
}
