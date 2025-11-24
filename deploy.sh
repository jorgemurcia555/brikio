#!/bin/bash

# ===========================================
# BRIKIO - PRODUCTION DEPLOYMENT SCRIPT
# ===========================================

set -e  # Exit on any error

echo "🚀 Starting Brikio deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ Error: .env.production file not found!${NC}"
    echo -e "${YELLOW}📝 Please create .env.production from .env.production.example${NC}"
    exit 1
fi

# Load environment variables
export $(cat .env.production | grep -v '^#' | xargs)

echo -e "${GREEN}✅ Environment variables loaded${NC}"

# Step 1: Stop existing containers
echo -e "${YELLOW}⏸️  Stopping existing containers...${NC}"
docker-compose -f docker-compose.prod.yml down

# Step 2: Pull latest changes (if using git)
if [ -d .git ]; then
    echo -e "${YELLOW}📥 Pulling latest changes...${NC}"
    git pull origin main
fi

# Step 3: Build images
echo -e "${YELLOW}🔨 Building Docker images...${NC}"
docker-compose -f docker-compose.prod.yml build --no-cache

# Step 4: Start containers
echo -e "${YELLOW}🐳 Starting containers...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# Step 5: Wait for database to be ready
echo -e "${YELLOW}⏳ Waiting for database...${NC}"
sleep 10

# Step 6: Run database migrations/seeds
echo -e "${YELLOW}📊 Running database setup...${NC}"
docker exec brikio-backend-prod npm run seed || echo -e "${YELLOW}⚠️  Seed already run or failed (this is ok if DB already has data)${NC}"

# Step 7: Check container status
echo -e "${YELLOW}🔍 Checking container health...${NC}"
docker-compose -f docker-compose.prod.yml ps

# Step 8: Show logs
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo -e "${GREEN}📝 Container status:${NC}"
docker ps --filter "name=brikio"

echo ""
echo -e "${GREEN}🌐 Your application should be available at:${NC}"
echo -e "   Frontend: ${FRONTEND_URL}"
echo -e "   Backend:  ${VITE_API_URL}"
echo ""
echo -e "${YELLOW}📋 To view logs:${NC}"
echo -e "   docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo -e "${YELLOW}🛑 To stop:${NC}"
echo -e "   docker-compose -f docker-compose.prod.yml down"
echo ""
echo -e "${GREEN}🎉 Happy building with Brikio!${NC}"

