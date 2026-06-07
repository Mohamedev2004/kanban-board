# 🐳 Commands Reference - Kanban Board Docker

## 🔗 Quick Copy-Paste Commands

### Initial Setup
```bash
# Copy environment file
cp .env.example .env

# Edit sensitive variables (DB_PASS, JWT_SECRET)
nano .env  # Linux/macOS
```

### Start Application
```bash
# Build and start all services
docker compose up --build

# Start in background
docker compose up --build -d

# Start without rebuild
docker compose up

# Or use scripts
./scripts/docker-start.sh           # Linux/macOS
.\scripts/docker-start.ps1          # Windows PowerShell

# Or use Make
make up
```

### Stop Application
```bash
# Stop services (keep data)
docker compose down

# Stop services (delete all data)
docker compose down -v

# Or use scripts
./scripts/docker-stop.sh            # Linux/macOS
.\scripts/docker-stop.ps1           # Windows PowerShell

# Or use Make
make down
```

### View Logs
```bash
# All logs realtime
docker compose logs -f

# Backend only
docker compose logs -f backend

# Frontend only
docker compose logs -f frontend

# PostgreSQL only
docker compose logs -f postgres

# Last 100 lines
docker compose logs --tail=100

# Or use scripts
./scripts/docker-logs.sh backend    # Linux/macOS
.\scripts/docker-logs.ps1 backend   # Windows PowerShell

# Or use Make
make logs-backend
```

### Check Status
```bash
# Container status
docker compose ps

# Resource usage
docker stats

# Or use scripts
./scripts/docker-status.sh          # Linux/macOS
.\scripts/docker-status.ps1         # Windows PowerShell

# Or use Make
make ps
```

---

## 🗄️ Database Operations

### Connect to PostgreSQL
```bash
# Open PostgreSQL shell
docker compose exec postgres psql -U postgres -d kanban_db

# Or use Make
make shell-db

# Useful PostgreSQL commands (from within psql):
\l                          # List databases
\c kanban_db                # Connect to database
\dt                         # List tables
\d table_name               # Describe table
SELECT * FROM users;        # Query example
\q                          # Quit
```

### PostgreSQL Backup
```bash
# Create backup
docker compose exec postgres pg_dump -U postgres kanban_db > backup.sql

# Restore backup
docker compose exec -T postgres psql -U postgres kanban_db < backup.sql
```

### Database Reset
```bash
# Delete all data and recreate
docker compose down -v
docker compose up --build
```

---

## 🔧 Service Management

### Restart Services
```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart backend
docker compose restart frontend
docker compose restart postgres
```

### Rebuild Images
```bash
# Rebuild all (with cache)
docker compose build

# Rebuild all (without cache)
docker compose build --no-cache

# Rebuild specific service
docker compose build --no-cache backend
docker compose build --no-cache frontend
```

### Shell Access
```bash
# Backend shell
docker compose exec backend sh

# Frontend shell
docker compose exec frontend sh

# Or use Make
make shell-backend
```

---

## 🔍 Troubleshooting

### Check Configuration
```bash
# Validate compose file
docker compose config

# Show environment variables
docker compose exec backend env | grep DB_
```

### Test Connectivity
```bash
# Test backend health
curl http://localhost:8080/health

# Test frontend
curl http://localhost:5173/

# From inside containers
docker compose exec frontend curl http://backend:8080/health
docker compose exec backend ping postgres -c 1
```

### View Resource Usage
```bash
# Real-time stats
docker stats

# Detailed inspection
docker stats --format="table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Disk usage
docker system df
```

### Check Port Usage
```bash
# Linux/macOS
lsof -i :5173
lsof -i :8080
lsof -i :5432

# Windows (PowerShell)
netstat -ano | findstr :5173
netstat -ano | findstr :8080
netstat -ano | findstr :5432

# Find and kill process
taskkill /PID <PID> /F
```

---

## 🧹 Cleanup Commands

### Partial Cleanup
```bash
# Stop containers only
docker compose down

# Remove stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune
```

### Full Cleanup
```bash
# Remove everything (⚠️ Removes all data!)
docker compose down -v

# Clean entire system
docker system prune -a --volumes

# Rebuild from scratch
docker compose build --no-cache
docker compose up
```

---

## 🚀 Make Commands

```bash
# Show all available commands
make help

# Build images
make build

# Start services
make up

# Stop services
make down

# Restart services
make restart

# View logs
make logs
make logs-backend
make logs-frontend
make logs-db

# Check status
make ps

# Connect to database
make shell-db

# Access backend
make shell-backend

# Clean up
make clean
make clean-all

# Rebuild (no cache)
make rebuild
```

---

## 🔐 Security Commands

### Generate Strong Secrets
```bash
# Linux/macOS
openssl rand -hex 32      # JWT_SECRET
openssl rand -hex 16      # DB_PASS

# PowerShell
[System.Convert]::ToHexString((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### Scan Images
```bash
# With docker scan
docker scan kanban_backend
docker scan kanban_frontend

# With trivy (if installed)
trivy image kanban_backend:latest
trivy image kanban_frontend:latest
```

---

## 📊 Monitoring Commands

```bash
# Watch logs in real-time
watch -n 1 'docker compose logs --tail=20'

# Watch resource usage
watch docker stats

# View events
docker events

# Inspect container
docker inspect kanban_backend
docker inspect kanban_frontend
docker inspect kanban_postgres
```

---

## 🔄 CI/CD Commands

```bash
# Build for production
docker compose build --no-cache

# Tag images
docker tag kanban_backend:latest myregistry/kanban-backend:latest
docker tag kanban_frontend:latest myregistry/kanban-frontend:latest

# Push to registry
docker push myregistry/kanban-backend:latest
docker push myregistry/kanban-frontend:latest

# Pull images
docker pull myregistry/kanban-backend:latest
docker pull myregistry/kanban-frontend:latest
```

---

## 📝 Useful Scripts

### Create Script: Health Check
```bash
#!/bin/bash
echo "🔍 Health Check"
echo "==============="

echo "Backend:" 
docker compose exec backend curl -s http://localhost:8080/health || echo "❌ Not responding"

echo "Frontend:"
docker compose exec frontend curl -s http://localhost:5173/ | head -c 100

echo "Database:"
docker compose exec postgres psql -U postgres -c "SELECT 1" 2>/dev/null && echo "✅ OK" || echo "❌ Failed"
```

### Create Script: Backup
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${DATE}.sql"

echo "💾 Creating backup: $BACKUP_FILE"
docker compose exec -T postgres pg_dump -U postgres kanban_db > $BACKUP_FILE
echo "✅ Backup created"
```

### Create Script: Restore
```bash
#!/bin/bash
if [ $# -ne 1 ]; then
    echo "Usage: $0 <backup_file.sql>"
    exit 1
fi

echo "📥 Restoring from $1"
docker compose exec -T postgres psql -U postgres kanban_db < $1
echo "✅ Restore completed"
```

---

## 🎯 Common Workflows

### Development Workflow
```bash
# 1. Start
docker compose up --build

# 2. View logs while working
docker compose logs -f

# 3. Make code changes (auto-reloaded in frontend)

# 4. Access database if needed
docker compose exec postgres psql -U postgres -d kanban_db

# 5. Check health
curl http://localhost:8080/health

# 6. Stop when done
docker compose down
```

### Testing Workflow
```bash
# 1. Clean environment
docker compose down -v

# 2. Start with fresh data
docker compose up --build

# 3. Run tests
docker compose exec backend go test ./...

# 4. View results
docker compose logs backend
```

### Production Deployment
```bash
# 1. Update .env for production
nano .env

# 2. Build images
docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache

# 3. Start in background
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 4. Verify
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps

# 5. Monitor
docker stats
docker compose logs -f
```

---

## 🆘 Emergency Commands

```bash
# If everything is broken
docker compose down -v
docker system prune -a --volumes
docker compose build --no-cache
docker compose up

# Kill hanging processes
docker kill $(docker ps -q)
docker container prune -f

# Free up space
docker system prune -a --volumes
docker image prune -a -f

# Reset everything
docker compose down -v
docker system prune -a --volumes
rm -rf node_modules .next dist build
docker compose up --build
```

---

## 📞 Getting Help

### Before asking for help, run:
```bash
# Generate diagnostic info
docker compose ps
docker compose logs --tail=50
docker system df
docker stats --no-stream

# Test connectivity
curl http://localhost:8080/health
curl http://localhost:5173/
```

### Check documentation:
- [DOCKER_README.md](DOCKER_README.md) - Overview
- [DOCKER_QUICKSTART.md](DOCKER_QUICKSTART.md) - Quick start
- [DOCKER_TROUBLESHOOTING.md](DOCKER_TROUBLESHOOTING.md) - Issues & solutions
- [DOCKER_SETUP.md](DOCKER_SETUP.md) - Detailed docs
- [DOCKER_ADVANCED.md](DOCKER_ADVANCED.md) - Production configs

---

## ⚡ Quick Reference Card

| Action | Command |
|--------|---------|
| Start | `docker compose up --build` |
| Stop | `docker compose down` |
| Logs | `docker compose logs -f` |
| Status | `docker compose ps` |
| Shell | `docker compose exec <service> sh` |
| Database | `docker compose exec postgres psql -U postgres -d kanban_db` |
| Reset | `docker compose down -v && docker compose up --build` |
| Clean | `docker system prune -a --volumes` |

---

**Happy Dockering! 🐳**
