# ⚡ Quick Deployment Guide

Get Brikio live in 15 minutes!

## 🚀 3-Step Deployment

### Step 1: Configure Environment (5 min)

```bash
# Create production environment file
cp env.production.example .env.production

# Edit with your values
nano .env.production
```

**Minimum Required:**
- `DB_PASSWORD` - Strong database password
- `JWT_SECRET` - Generate with: `openssl rand -base64 64`
- `JWT_REFRESH_SECRET` - Generate with: `openssl rand -base64 64`
- `FRONTEND_URL` - Your domain (e.g., https://brikio.com)
- `VITE_API_URL` - Your API URL (e.g., https://api.brikio.com/api/v1)

**Optional but Recommended:**
- `STRIPE_SECRET_KEY` - For payments
- `STRIPE_WEBHOOK_SECRET` - For payment webhooks
- `OPENAI_API_KEY` - For AI features

### Step 2: Pre-Deployment Check (2 min)

```bash
# Run checks
./pre-deploy-check.sh
```

Fix any errors before proceeding.

### Step 3: Deploy! (8 min)

```bash
# Deploy to production
./deploy.sh
```

That's it! 🎉

---

## 📍 What Happens During Deployment

1. ✅ Loads environment variables
2. ✅ Stops existing containers
3. ✅ Builds optimized Docker images
4. ✅ Starts PostgreSQL database
5. ✅ Starts NestJS backend
6. ✅ Starts React frontend with Nginx
7. ✅ Runs database migrations
8. ✅ Seeds initial data

---

## 🌐 Access Your Application

**Frontend:** http://localhost:80 (or your configured domain)  
**Backend API:** http://localhost:3000/api/v1 (or your configured domain)

---

## 🔧 Common Tasks

### View Logs
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### Restart Services
```bash
docker-compose -f docker-compose.prod.yml restart
```

### Stop All
```bash
docker-compose -f docker-compose.prod.yml down
```

### Update Application
```bash
git pull origin main
./deploy.sh
```

### Backup Database
```bash
docker exec brikio-db-prod pg_dump -U $(grep DB_USERNAME .env.production | cut -d '=' -f2) $(grep DB_DATABASE .env.production | cut -d '=' -f2) > backup_$(date +%Y%m%d).sql
```

---

## 🚨 Troubleshooting

### "Port already in use"
```bash
# Check what's using the port
lsof -i :3000
lsof -i :80

# Kill the process or change port in .env.production
```

### "Database connection error"
```bash
# Check database container
docker ps | grep postgres

# View database logs
docker logs brikio-db-prod
```

### "Frontend shows API errors"
```bash
# Verify CORS settings
# Make sure FRONTEND_URL in .env.production matches your domain
# Make sure VITE_API_URL is correct in frontend
```

---

## 📊 Post-Deployment Checklist

- [ ] Test registration: https://yourdomain.com/register
- [ ] Test login: https://yourdomain.com/login
- [ ] Create test project
- [ ] Test estimate creation
- [ ] Configure Stripe webhooks (if using Stripe)
- [ ] Set up SSL certificate
- [ ] Configure backups
- [ ] Set up monitoring

---

## 🔒 Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall
- [ ] Set up fail2ban
- [ ] Regular backups enabled
- [ ] Update Docker images regularly

---

## 📚 Full Documentation

For detailed deployment options, cloud platforms, and advanced configuration:

👉 **See [DEPLOYMENT.md](./DEPLOYMENT.md)**

---

## 💡 Need Help?

- 📖 Documentation: README.md
- 🐛 Issues: GitHub Issues
- 💬 Community: Discord/Slack

---

**Happy Building! 🏗️**

