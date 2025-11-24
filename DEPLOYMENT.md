# 🚀 Brikio - Production Deployment Guide

Complete guide to deploy Brikio to production.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Configuration](#configuration)
3. [Deployment Options](#deployment-options)
4. [Docker Deployment](#docker-deployment)
5. [Cloud Platforms](#cloud-platforms)
6. [Post-Deployment](#post-deployment)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

Before deploying, ensure you have:

- ✅ **Server/VPS** with Docker and Docker Compose installed
- ✅ **Domain name** pointed to your server
- ✅ **SSL Certificate** (Let's Encrypt recommended)
- ✅ **Stripe Account** with API keys
- ✅ **OpenAI API Key** (for AI features)
- ✅ **PostgreSQL** (included in Docker setup)

### Minimum Server Requirements

- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **OS**: Ubuntu 22.04 LTS (recommended)

---

## ⚙️ Configuration

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/brikio.git
cd brikio
```

### 2. Create Production Environment File

```bash
cp .env.production.example .env.production
```

### 3. Edit .env.production

```bash
nano .env.production
```

**Required Variables:**

```env
# Database
DB_PASSWORD=your_strong_password_here

# JWT Secrets (generate with: openssl rand -base64 64)
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_BASIC_PLAN_PRICE_ID=price_...
STRIPE_PREMIUM_PLAN_PRICE_ID=price_...

# Frontend & Backend URLs
FRONTEND_URL=https://brikio.com
VITE_API_URL=https://api.brikio.com/api/v1

# OpenAI
OPENAI_API_KEY=sk-...
```

---

## 🚢 Deployment Options

### Option 1: Docker Deployment (Recommended)

Best for: VPS, dedicated servers, self-hosted

### Option 2: Cloud Platforms

- **Railway** - Easy, auto-deploy from Git
- **Render** - Simple, free tier available
- **DigitalOcean App Platform** - Managed, scalable
- **AWS/GCP/Azure** - Enterprise, full control
- **Vercel (Frontend)** + **Railway (Backend)** - Hybrid approach

---

## 🐳 Docker Deployment

### Quick Deploy

```bash
# Make script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### Manual Docker Deployment

```bash
# 1. Stop existing containers
docker-compose -f docker-compose.prod.yml down

# 2. Build images
docker-compose -f docker-compose.prod.yml build --no-cache

# 3. Start services
docker-compose -f docker-compose.prod.yml up -d

# 4. Check status
docker-compose -f docker-compose.prod.yml ps

# 5. View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Docker Commands Cheat Sheet

```bash
# View all containers
docker ps -a

# View logs for specific service
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend

# Restart a service
docker-compose -f docker-compose.prod.yml restart backend

# Execute command in container
docker exec -it brikio-backend-prod sh

# Check database
docker exec -it brikio-db-prod psql -U brikio_prod_user -d brikio_production
```

---

## ☁️ Cloud Platforms

### Railway Deployment

1. **Create Railway Account**: https://railway.app
2. **Create New Project** from GitHub repo
3. **Add PostgreSQL** service
4. **Set Environment Variables** in Railway dashboard
5. **Deploy!**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

### Render Deployment

1. **Create account**: https://render.com
2. **New Web Service** → Connect GitHub
3. **Configure**:
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm run start:prod`
4. **Add PostgreSQL** database
5. **Set environment variables**
6. Deploy!

### Vercel (Frontend Only)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd frontend
vercel --prod

# Set environment variables in Vercel dashboard
# VITE_API_URL=https://your-backend-url.com/api/v1
```

---

## 🔒 SSL/HTTPS Setup

### Using Nginx + Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (already set up by certbot)
sudo certbot renew --dry-run
```

### Nginx Configuration

Create `/etc/nginx/sites-available/brikio`:

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/brikio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🎯 Post-Deployment

### 1. Verify Services

```bash
# Check backend health
curl https://api.yourdomain.com/api/v1/health

# Check frontend
curl https://yourdomain.com
```

### 2. Test Authentication

1. Go to `https://yourdomain.com/register`
2. Create test account
3. Verify email (if configured)
4. Login successfully

### 3. Configure Stripe Webhooks

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://api.yourdomain.com/api/v1/billing/webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook secret to `.env.production`

### 4. Test Payment Flow

1. Create account
2. Go to Billing
3. Upgrade to Basic plan ($7)
4. Use Stripe test card: `4242 4242 4242 4242`
5. Verify subscription active

---

## 📊 Monitoring & Maintenance

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100 backend
```

### Database Backup

```bash
# Create backup
docker exec brikio-db-prod pg_dump -U brikio_prod_user brikio_production > backup_$(date +%Y%m%d).sql

# Restore backup
docker exec -i brikio-db-prod psql -U brikio_prod_user brikio_production < backup_20240101.sql
```

### Automated Backups (Cron)

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * cd /path/to/brikio && docker exec brikio-db-prod pg_dump -U brikio_prod_user brikio_production > /backups/brikio_$(date +\%Y\%m\%d).sql
```

### Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
./deploy.sh
```

---

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check logs
docker logs brikio-backend-prod

# Common issues:
# - Database connection error → Check DB_HOST, DB_PASSWORD
# - JWT secret missing → Set JWT_SECRET in .env.production
# - Port already in use → Change BACKEND_PORT
```

### Frontend shows API errors

```bash
# Check CORS settings in backend
# Verify FRONTEND_URL in .env.production matches your domain

# Check frontend environment
docker exec brikio-frontend-prod cat /etc/nginx/conf.d/default.conf
```

### Database connection issues

```bash
# Check database is running
docker ps | grep postgres

# Test connection
docker exec brikio-db-prod psql -U brikio_prod_user -d brikio_production -c "SELECT 1;"

# Reset database (⚠️ WARNING: Deletes all data)
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d
```

### Stripe webhooks not working

1. Check webhook URL is accessible: `curl https://api.yourdomain.com/api/v1/billing/webhook`
2. Verify STRIPE_WEBHOOK_SECRET in `.env.production`
3. Check Stripe Dashboard → Webhooks → Recent deliveries
4. View backend logs: `docker logs brikio-backend-prod | grep webhook`

---

## 📞 Support

- **Documentation**: Check README.md and code comments
- **Issues**: Create GitHub issue
- **Email**: support@yourdomain.com

---

## 🎉 Success!

Your Brikio application is now live in production! 🚀

**Next Steps:**
- Set up monitoring (Sentry, Datadog, etc.)
- Configure automated backups
- Set up CI/CD pipeline
- Add custom domain email
- Configure CDN for static assets

Happy building! 🏗️

