#!/bin/bash

# ===========================================
# BRIKIO - PRE-DEPLOYMENT CHECKLIST
# ===========================================

echo "🔍 Running pre-deployment checks..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0

# Check 1: .env.production exists
if [ -f .env.production ]; then
    echo -e "${GREEN}✅ .env.production file exists${NC}"
else
    echo -e "${RED}❌ .env.production file missing${NC}"
    echo -e "${YELLOW}   Run: cp env.production.example .env.production${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check 2: Docker is installed
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅ Docker is installed${NC}"
else
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo -e "${YELLOW}   Visit: https://docs.docker.com/get-docker/${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check 3: Docker Compose is installed
if command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✅ Docker Compose is installed${NC}"
else
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    echo -e "${YELLOW}   Visit: https://docs.docker.com/compose/install/${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check 4: Critical environment variables
if [ -f .env.production ]; then
    source .env.production 2>/dev/null || true
    
    # Database password
    if [ -z "$DB_PASSWORD" ] || [ "$DB_PASSWORD" == "CHANGE_THIS_STRONG_PASSWORD_123!" ]; then
        echo -e "${RED}❌ DB_PASSWORD not set or using default${NC}"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✅ DB_PASSWORD is set${NC}"
    fi
    
    # JWT Secret
    if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" == "CHANGE_THIS_TO_RANDOM_STRING_MIN_32_CHARS" ]; then
        echo -e "${RED}❌ JWT_SECRET not set or using default${NC}"
        echo -e "${YELLOW}   Generate with: openssl rand -base64 64${NC}"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✅ JWT_SECRET is set${NC}"
    fi
    
    # JWT Refresh Secret
    if [ -z "$JWT_REFRESH_SECRET" ] || [ "$JWT_REFRESH_SECRET" == "CHANGE_THIS_TO_ANOTHER_RANDOM_STRING_MIN_32_CHARS" ]; then
        echo -e "${RED}❌ JWT_REFRESH_SECRET not set or using default${NC}"
        echo -e "${YELLOW}   Generate with: openssl rand -base64 64${NC}"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✅ JWT_REFRESH_SECRET is set${NC}"
    fi
    
    # Stripe keys
    if [ -z "$STRIPE_SECRET_KEY" ] || [[ "$STRIPE_SECRET_KEY" == *"YOUR_STRIPE"* ]]; then
        echo -e "${YELLOW}⚠️  STRIPE_SECRET_KEY not set (payments will not work)${NC}"
    else
        echo -e "${GREEN}✅ STRIPE_SECRET_KEY is set${NC}"
    fi
    
    # OpenAI key
    if [ -z "$OPENAI_API_KEY" ] || [[ "$OPENAI_API_KEY" == *"YOUR_OPENAI"* ]]; then
        echo -e "${YELLOW}⚠️  OPENAI_API_KEY not set (AI features will not work)${NC}"
    else
        echo -e "${GREEN}✅ OPENAI_API_KEY is set${NC}"
    fi
    
    # Frontend URL
    if [ -z "$FRONTEND_URL" ] || [ "$FRONTEND_URL" == "https://yourdomain.com" ]; then
        echo -e "${RED}❌ FRONTEND_URL not configured${NC}"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✅ FRONTEND_URL is set: $FRONTEND_URL${NC}"
    fi
    
    # API URL
    if [ -z "$VITE_API_URL" ] || [[ "$VITE_API_URL" == *"yourdomain"* ]]; then
        echo -e "${RED}❌ VITE_API_URL not configured${NC}"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✅ VITE_API_URL is set: $VITE_API_URL${NC}"
    fi
fi

# Check 5: Port availability
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 3000 is already in use${NC}"
else
    echo -e "${GREEN}✅ Port 3000 is available${NC}"
fi

if lsof -Pi :80 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 80 is already in use${NC}"
else
    echo -e "${GREEN}✅ Port 80 is available${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Ready to deploy.${NC}"
    echo ""
    echo -e "${GREEN}🚀 To deploy, run:${NC}"
    echo -e "   ${YELLOW}./deploy.sh${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Found $ERRORS error(s). Please fix them before deploying.${NC}"
    echo ""
    exit 1
fi

