# n8n Deployment Guide - Production Setup

Complete guide to deploy n8n for production with high availability, security, and monitoring.

---

## 📋 Deployment Options

| Option | Setup Time | Cost | Uptime | Maintenance |
|--------|-----------|------|--------|-------------|
| **n8n Cloud** | 5 min | $$$ | 99.9% | Minimal |
| **Docker (VPS)** | 30 min | $$ | 99% | Medium |
| **Kubernetes** | 1-2 hours | $$ | 99.9% | Medium |
| **Self-Hosted (VM)** | 1 hour | $ | 95% | High |

**Recommendation for Phase 1:** Start with **Docker on VPS** or **n8n Cloud** for simplicity and reliability.

---

## Option 1: n8n Cloud (Easiest)

### Step 1.1 - Create n8n Cloud Account

1. Go to https://n8n.cloud
2. Sign up or log in
3. Create a new instance

### Step 1.2 - Configure Instance

1. **Instance Name:** "Lead Magnet Production"
2. **Plan:** Professional or Team (recommend Professional for Phase 1)
3. **Region:** Select closest to your users
4. Click **Create Instance**

### Step 1.3 - Set Environment Variables

1. Go to Instance Settings
2. Click **Environment Variables**
3. Add all variables from `configs/.env.n8n`:
   ```
   OPENAI_API_KEY=sk-...
   SUPABASE_URL=https://...
   GMAIL_PASSWORD=...
   MAILCHIMP_API_KEY=...
   ```
4. Save and restart instance

### Step 1.4 - Import Workflows

1. Go to **Workflows**
2. Click **Create New**
3. Menu → **Import from file**
4. Upload each workflow JSON file
5. Workflows will automatically use your credentials

### Step 1.5 - Configure Webhooks

1. For each webhook workflow:
   - Get the webhook URL: Copy from workflow settings
   - Update your frontend with the correct URL
   - URL format: `https://your-instance.n8n.cloud/webhook/lead-magnet`

### Step 1.6 - Set Up Monitoring

1. Go to **Admin** → **Monitoring**
2. Enable execution history
3. Set up email notifications for failures
4. Configure alert thresholds

### Cost

- **Professional Plan:** ~$20-30/month
- API calls: Unlimited
- Storage: 100GB
- Support: Email

### Pros

✅ No server management
✅ Automatic backups
✅ Built-in monitoring
✅ High availability (99.9% SLA)
✅ Easy scaling

### Cons

❌ Less control over infrastructure
❌ Limited customization
❌ Ongoing subscription cost

---

## Option 2: Docker on VPS (Recommended for Phase 1)

### Prerequisites

- VPS with Docker installed (DigitalOcean, Linode, AWS EC2, etc.)
- Domain name (recommended)
- SSL certificate (recommended)

### Step 2.1 - Prepare VPS

```bash
# SSH into your server
ssh root@your-server-ip

# Update system
apt-get update && apt-get upgrade -y

# Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create app directory
mkdir -p /opt/n8n
cd /opt/n8n
```

### Step 2.2 - Create docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: n8n-db
    environment:
      POSTGRES_USER: n8n
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: n8n
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - n8n-net
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U n8n"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: n8n-redis
    networks:
      - n8n-net
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  n8n:
    image: n8nio/n8n:latest
    container_name: n8n-app
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      # Database
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: postgres
      DB_POSTGRESDB_PORT: 5432
      DB_POSTGRESDB_DATABASE: n8n
      DB_POSTGRESDB_USER: n8n
      DB_POSTGRESDB_PASSWORD: ${DB_PASSWORD}
      DB_POSTGRESDB_SSL: "false"
      
      # n8n Core
      NODE_ENV: production
      N8N_HOST: ${N8N_HOST}
      N8N_PORT: 5678
      N8N_PROTOCOL: ${N8N_PROTOCOL}
      WEBHOOK_URL: ${WEBHOOK_URL}
      
      # Execution
      EXECUTIONS_PROCESS: main
      EXECUTIONS_MODE: queue
      EXECUTIONS_TIMEOUT_HH: 1
      EXECUTIONS_DATA_SAVE_ON_ERROR: all
      EXECUTIONS_DATA_SAVE_ON_SUCCESS: all
      
      # Security
      N8N_SECURE_COOKIE: "true"
      N8N_USER_EMAIL: ${N8N_USER_EMAIL}
      N8N_USER_PASSWORD: ${N8N_USER_PASSWORD}
      ENCRYPTION_KEY: ${ENCRYPTION_KEY}
      
      # Logging
      LOG_LEVEL: info
      
      # Cache
      REDIS_HOST: redis
      REDIS_PORT: 6379
      
      # API
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      SUPABASE_URL: ${SUPABASE_URL}
      SUPABASE_KEY: ${SUPABASE_KEY}
      GMAIL_PASSWORD: ${GMAIL_PASSWORD}
      MAILCHIMP_API_KEY: ${MAILCHIMP_API_KEY}
      CONVERTKIT_API_KEY: ${CONVERTKIT_API_KEY}
      HUBSPOT_API_KEY: ${HUBSPOT_API_KEY}
    
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - n8n-net
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5678/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    container_name: n8n-reverse-proxy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - nginx_data:/var/cache/nginx
    networks:
      - n8n-net
    depends_on:
      - n8n

volumes:
  postgres_data:
    driver: local
  n8n_data:
    driver: local
  nginx_data:
    driver: local

networks:
  n8n-net:
    driver: bridge
```

### Step 2.3 - Create .env File

```bash
# Copy template
cp configs/.env.n8n.template /opt/n8n/.env

# Edit with your values
nano /opt/n8n/.env

# Required values:
DB_PASSWORD=your-secure-db-password
N8N_HOST=your-domain.com
N8N_PROTOCOL=https
WEBHOOK_URL=https://your-domain.com
N8N_USER_EMAIL=admin@your-domain.com
N8N_USER_PASSWORD=your-secure-password
ENCRYPTION_KEY=your-encryption-key-32-chars-minimum

# API Keys
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://...
SUPABASE_KEY=...
GMAIL_PASSWORD=...
MAILCHIMP_API_KEY=...
CONVERTKIT_API_KEY=...
HUBSPOT_API_KEY=...
```

### Step 2.4 - Create nginx.conf

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 100M;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

    upstream n8n {
        server n8n:5678;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        location / {
            proxy_pass http://n8n;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;

            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        location /webhook/ {
            limit_req zone=api_limit burst=20 nodelay;
            proxy_pass http://n8n;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Webhook timeout
            proxy_read_timeout 35s;
        }
    }
}
```

### Step 2.5 - Set Up SSL Certificate

**Option A: Let's Encrypt (Free)**

```bash
# Install Certbot
apt-get install -y certbot python3-certbot-nginx

# Get certificate
certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Copy to ssl directory
mkdir -p /opt/n8n/ssl
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /opt/n8n/ssl/cert.pem
cp /etc/letsencrypt/live/your-domain.com/privkey.pem /opt/n8n/ssl/key.pem

# Set permissions
chmod 644 /opt/n8n/ssl/cert.pem
chmod 644 /opt/n8n/ssl/key.pem

# Auto-renew (add to crontab)
crontab -e
# Add: 0 0 1 * * /usr/bin/certbot renew --quiet
```

**Option B: Self-Signed (Development)**

```bash
mkdir -p /opt/n8n/ssl
openssl req -x509 -newkey rsa:2048 -keyout /opt/n8n/ssl/key.pem -out /opt/n8n/ssl/cert.pem -days 365 -nodes
```

### Step 2.6 - Start n8n

```bash
cd /opt/n8n
docker-compose up -d

# Check logs
docker-compose logs -f n8n

# Verify all services are running
docker-compose ps
```

### Step 2.7 - Access n8n

1. Navigate to: `https://your-domain.com`
2. Log in with credentials from `.env`
3. Import workflows from `workflows/` folder

---

## Option 3: Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (EKS, GKE, AKS, or self-hosted)
- kubectl installed
- Helm (optional)

### Step 3.1 - Create Namespace

```bash
kubectl create namespace n8n
```

### Step 3.2 - Create Secrets

```bash
kubectl create secret generic n8n-secrets \
  --from-literal=db-password=$DB_PASSWORD \
  --from-literal=encryption-key=$ENCRYPTION_KEY \
  --from-literal=openai-key=$OPENAI_API_KEY \
  --from-literal=gmail-password=$GMAIL_PASSWORD \
  -n n8n
```

### Step 3.3 - Deploy PostgreSQL

```yaml
# postgres-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: n8n
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_USER
          value: n8n
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: n8n-secrets
              key: db-password
        - name: POSTGRES_DB
          value: n8n
        volumeMounts:
        - name: data
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: postgres-pvc
```

### Step 3.4 - Deploy n8n

```yaml
# n8n-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: n8n
  namespace: n8n
spec:
  replicas: 2
  selector:
    matchLabels:
      app: n8n
  template:
    metadata:
      labels:
        app: n8n
    spec:
      containers:
      - name: n8n
        image: n8nio/n8n:latest
        ports:
        - containerPort: 5678
        env:
        - name: DB_TYPE
          value: postgresdb
        - name: DB_POSTGRESDB_HOST
          value: postgres
        - name: DB_POSTGRESDB_USER
          value: n8n
        - name: DB_POSTGRESDB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: n8n-secrets
              key: db-password
        - name: ENCRYPTION_KEY
          valueFrom:
            secretKeyRef:
              name: n8n-secrets
              key: encryption-key
        # ... add other env vars
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /api/v1/health
            port: 5678
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/v1/health
            port: 5678
          initialDelaySeconds: 5
          periodSeconds: 5
```

### Step 3.5 - Create Service & Ingress

```yaml
# service-and-ingress.yaml
apiVersion: v1
kind: Service
metadata:
  name: n8n-service
  namespace: n8n
spec:
  selector:
    app: n8n
  ports:
  - protocol: TCP
    port: 80
    targetPort: 5678
  type: LoadBalancer

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: n8n-ingress
  namespace: n8n
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - your-domain.com
    secretName: n8n-tls
  rules:
  - host: your-domain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: n8n-service
            port:
              number: 80
```

### Step 3.6 - Deploy

```bash
kubectl apply -f postgres-deployment.yaml
kubectl apply -f n8n-deployment.yaml
kubectl apply -f service-and-ingress.yaml

# Check status
kubectl get pods -n n8n
kubectl get svc -n n8n
```

---

## Monitoring & Alerts

### Setup Prometheus

```yaml
# prometheus-config.yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'n8n'
    static_configs:
      - targets: ['localhost:5678']
```

### Setup Grafana Dashboards

1. Add Prometheus data source
2. Import n8n dashboard: https://grafana.com/grafana/dashboards/13951
3. Configure alerts for:
   - High error rate
   - Slow execution time
   - Database connection failures

### Email Alerts

In n8n:
1. Go to **Admin** → **Notifications**
2. Configure email for workflow failures
3. Set alert threshold (e.g., 2 consecutive failures)

---

## Backup & Disaster Recovery

### Automated Backups

```bash
# Backup script (backup.sh)
#!/bin/bash
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Backup PostgreSQL
docker exec n8n-db pg_dump -U n8n n8n > $BACKUP_DIR/n8n_db_$TIMESTAMP.sql

# Backup n8n data
docker exec n8n tar -czf /tmp/n8n_data_$TIMESTAMP.tar.gz /home/node/.n8n
cp /var/lib/docker/volumes/n8n_n8n_data/_data/* $BACKUP_DIR/

# Upload to S3 (optional)
aws s3 sync $BACKUP_DIR s3://my-backups/

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -mtime +30 -delete
```

Schedule with cron:
```bash
# Daily backup at 2 AM
0 2 * * * /opt/n8n/backup.sh
```

### Restore from Backup

```bash
# Restore PostgreSQL
docker exec n8n-db psql -U n8n n8n < backup.sql

# Restore n8n data
docker cp n8n_data_backup.tar.gz n8n-app:/tmp/
docker exec n8n tar -xzf /tmp/n8n_data_backup.tar.gz -C /home/node/.n8n
```

---

## Performance Tuning

### Database Optimization

```sql
-- Create indexes
CREATE INDEX idx_executions_workflow_id ON executions(workflow_id);
CREATE INDEX idx_executions_created_at ON executions(created_at DESC);
CREATE INDEX idx_execution_data_workflow_id ON execution_data(workflow_id);

-- Vacuum
VACUUM ANALYZE executions;
VACUUM ANALYZE execution_data;
```

### Application Tuning

```bash
# In .env
# Increase workers
EXECUTIONS_PROCESS=queue
EXECUTIONS_MODE=queue

# Optimize memory
NODE_OPTIONS="--max-old-space-size=2048"

# Redis cache
REDIS_HOST=redis
REDIS_PORT=6379
```

### Load Testing

```bash
# Install Apache Bench
apt-get install apache2-utils

# Load test
ab -n 1000 -c 50 https://your-domain.com/api/v1/health

# Or use wrk
wrk -t4 -c100 -d30s https://your-domain.com/webhook/lead-magnet
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs n8n

# Check database connection
docker-compose exec n8n curl http://postgres:5432

# Verify environment variables
docker-compose config
```

### High Memory Usage

```bash
# Check memory
docker stats n8n

# Reduce execution data retention
# In n8n Admin: Settings → Execution data → Days

# Increase container memory
# In docker-compose.yml, increase mem_limit
```

### Webhook Timeout

```bash
# Increase proxy timeouts in nginx.conf
proxy_read_timeout 60s;
proxy_connect_timeout 60s;

# Reload nginx
docker-compose exec nginx nginx -s reload
```

---

## Security Hardening

✅ **Enable HTTPS** (Let's Encrypt)
✅ **Use strong passwords** (20+ characters)
✅ **Enable 2FA** (if available)
✅ **Rotate encryption keys** (every 90 days)
✅ **Regular backups** (daily)
✅ **Security headers** (HSTS, CSP, X-Frame-Options)
✅ **Rate limiting** (nginx)
✅ **API authentication** (JWT tokens)
✅ **Database backups** (encrypted)
✅ **Log monitoring** (centralized)

---

## Cost Estimation

### Docker on VPS (Monthly)

- VPS (2 CPU, 4GB RAM): $12-20
- Domain: $1-2
- SSL: Free (Let's Encrypt)
- Backups: $1-5
- **Total:** $14-27/month

### Kubernetes (Monthly)

- EKS: ~$73 + node costs
- Managed PostgreSQL: $15-50
- Load Balancer: $20+
- Storage: $5-20
- **Total:** $113-143/month

### n8n Cloud (Monthly)

- Professional Plan: $30-50
- **Total:** $30-50/month

---

## Rollback Plan

If deployment fails:

```bash
# Docker
docker-compose down
docker-compose up -d  # Previous version

# Kubernetes
kubectl rollout undo deployment/n8n -n n8n
kubectl rollout status deployment/n8n -n n8n

# Restore from backup
./restore-backup.sh
```

---

## Next Steps

1. Choose deployment option (Docker recommended for Phase 1)
2. Follow setup steps above
3. Configure monitoring
4. Set up automated backups
5. Test failover procedure
6. Document runbook
7. Train ops team

