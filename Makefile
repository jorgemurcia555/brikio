.PHONY: help install dev build start stop restart logs clean seed

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "${BLUE}BudgetApp - Available Commands${NC}"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  ${GREEN}%-15s${NC} %s\n", $$1, $$2}'

install: ## Install dependencies for both backend and frontend
	@echo "${BLUE}Installing backend dependencies...${NC}"
	cd backend && npm install
	@echo "${BLUE}Installing frontend dependencies...${NC}"
	cd frontend && npm install
	@echo "${GREEN}✓ Dependencies installed${NC}"

dev: ## Start development environment (backend + frontend + database)
	@echo "${BLUE}Starting development environment...${NC}"
	docker-compose up postgres -d
	@echo "${YELLOW}Waiting for database to be ready...${NC}"
	@sleep 3
	cd backend && npm run start:dev &
	cd frontend && npm run dev

build: ## Build Docker images
	@echo "${BLUE}Building Docker images...${NC}"
	docker-compose build
	@echo "${GREEN}✓ Images built${NC}"

start: ## Start all services with Docker Compose
	@echo "${BLUE}Starting all services...${NC}"
	docker-compose up -d
	@echo "${GREEN}✓ Services started${NC}"
	@echo "${YELLOW}Backend: http://localhost:3000${NC}"
	@echo "${YELLOW}Frontend: http://localhost:5173${NC}"

stop: ## Stop all services
	@echo "${BLUE}Stopping all services...${NC}"
	docker-compose down
	@echo "${GREEN}✓ Services stopped${NC}"

restart: stop start ## Restart all services

logs: ## View logs from all services
	docker-compose logs -f

logs-backend: ## View backend logs
	docker-compose logs -f backend

logs-frontend: ## View frontend logs
	docker-compose logs -f frontend

logs-db: ## View database logs
	docker-compose logs -f postgres

clean: ## Clean up containers, volumes, and node_modules
	@echo "${BLUE}Cleaning up...${NC}"
	docker-compose down -v
	cd backend && rm -rf node_modules dist
	cd frontend && rm -rf node_modules dist
	@echo "${GREEN}✓ Cleanup complete${NC}"

seed: ## Run database seeds
	@echo "${BLUE}Seeding database...${NC}"
	cd backend && npm run seed
	@echo "${GREEN}✓ Database seeded${NC}"

migrate: ## Run database migrations
	@echo "${BLUE}Running migrations...${NC}"
	cd backend && npm run migration:run
	@echo "${GREEN}✓ Migrations complete${NC}"

test-backend: ## Run backend tests
	@echo "${BLUE}Running backend tests...${NC}"
	cd backend && npm test

test-frontend: ## Run frontend tests
	@echo "${BLUE}Running frontend tests...${NC}"
	cd frontend && npm test

lint: ## Run linters
	@echo "${BLUE}Linting backend...${NC}"
	cd backend && npm run lint
	@echo "${BLUE}Linting frontend...${NC}"
	cd frontend && npm run lint

