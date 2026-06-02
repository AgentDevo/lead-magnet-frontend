import fs from 'fs';
import { execSync } from 'child_process';

// Simple in‑memory rate limiter (1 request per 5 seconds per IP)
const rateLimitMap = new Map();
function checkRateLimit(ip) {
  const now = Date.now();
  const last = rateLimitMap.get(ip) || 0;
  if (now - last < 5000) return false;
  rateLimitMap.set(ip, now);
  return true;
}

export default function handler(req, res) {
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    res.status(429).json({error: 'Too many requests'});
    return;
  }

  // Basic gateway health placeholder
  const gatewayHealth = { status: 'ok' };

  // Recent audit entry (last line of audit.log)
  let recentAudit = null;
  try {
    const auditData = fs.readFileSync(path.join(process.cwd(), 'logs', 'audit.log'), 'utf8').trim().split('\n');
    if (auditData.length) {
      recentAudit = JSON.parse(auditData[auditData.length - 1]);
    }
  } catch (e) {
    recentAudit = { error: 'Unable to read audit log' };
  }

  // Disk usage (using df -h on the workspace directory)
  let diskUsage = null;
  try {
    const dfOutput = execSync('df -h .', { encoding: 'utf8' });
    const lines = dfOutput.trim().split('\n');
    const headers = lines[0].split(/\s+/);
    const values = lines[1].split(/\s+/);
    diskUsage = {};
    headers.forEach((h, i) => {
      diskUsage[h] = values[i];
    });
  } catch (e) {
    diskUsage = { error: 'Unable to get disk usage' };
  }

  const response = {
    timestamp: new Date().toISOString(),
    gatewayHealth,
    recentAudit,
    diskUsage,
  };

  res.status(200).json(response);
}
