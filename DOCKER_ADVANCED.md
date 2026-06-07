# 🚀 Docker - Configurations Avancées & Production

## 📋 Table des Matières

1. [Configurations Avancées](#configurations-avancées)
2. [Production Ready](#production-ready)
3. [Scaling & Performance](#scaling--performance)
4. [Security Hardening](#security-hardening)
5. [CI/CD Integration](#cicd-integration)
6. [Kubernetes Migration](#kubernetes-migration)

---

## Configurations Avancées

### 1. docker-compose.override.yml (Développement Local)

Créer `docker-compose.override.yml` pour surcharger certains paramètres en dev:

```yaml
# docker-compose.override.yml
# Ce fichier surcharge automatiquement docker-compose.yml en développement
# ⚠️ À AJOUTER À .gitignore

version: '3.9'

services:
  backend:
    # Monter le source code pour hot-reload
    volumes:
      - ./server:/app
    # Logs verbeux en dev
    environment:
      DEBUG_MODE: "true"
      LOG_LEVEL: debug
    # Rebuild image à chaque démarrage
    build:
      context: ./server
      dockerfile: Dockerfile
      cache_from:
        - kanban_backend:latest

  frontend:
    # Démarrer le serveur de développement Vite
    command: npm run dev
    # Monter le source code
    volumes:
      - ./client:/app
      - /app/node_modules
    environment:
      # Port de Vite en dev
      VITE_PORT: 5174

  postgres:
    # Logs PostgreSQL plus verbeux
    environment:
      POSTGRES_INITDB_ARGS: "-c log_statement=all"
    # Port différent si conflit
    ports:
      - "5433:5432"  # Développement sur 5433
```

**Utilisation:**
```bash
# Le fichier override est appliqué automatiquement
docker compose up
```

---

### 2. Compose Multi-Fichiers pour Environnements

**Structure:**
```
docker-compose.yml              # Base (tous les services)
docker-compose.dev.yml          # Développement
docker-compose.prod.yml         # Production
docker-compose.staging.yml      # Staging
```

**Base compose.yml:**
```yaml
version: '3.9'

services:
  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
  postgres:
    image: postgres:16-alpine
```

**Développement (compose.dev.yml):**
```yaml
# À appliquer avec: docker compose -f docker-compose.yml -f docker-compose.dev.yml up
version: '3.9'

services:
  backend:
    environment:
      DEBUG_MODE: "true"
    volumes:
      - ./server:/app
```

**Production (compose.prod.yml):**
```yaml
# À appliquer avec: docker compose -f docker-compose.yml -f docker-compose.prod.yml up
version: '3.9'

services:
  backend:
    environment:
      DEBUG_MODE: "false"
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
  postgres:
    environment:
      POSTGRES_INITDB_ARGS: "-c log_statement=mod"
```

**Utilisation:**
```bash
# Développement
docker compose -f docker-compose.yml -f docker-compose.dev.yml up

# Production
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

---

## Production Ready

### 1. Fichier .env Production

**`.env.production`** (À protéger!)

```env
# 🔒 PRODUCTION - CREDENTIALS SECURISÉS

# Database
DB_USER=kanban_prod
DB_PASS=<VERY_STRONG_PASSWORD_32_CHARS>
DB_HOST=postgres
DB_PORT=5432
DB_NAME=kanban_db_prod

# Server
PORT=8080
ENVIRONMENT=production

# HTTPS & Security
CORS_ALLOWED_ORIGINS=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
COOKIE_SECURE=true
COOKIE_HTTP_ONLY=true
COOKIE_DOMAIN=yourdomain.com
COOKIE_SAMESITE=Strict

# JWT
JWT_SECRET=<VERY_STRONG_SECRET_32_CHARS>
JWT_ACCESS_EXPIRY_MINUTES=15
JWT_REFRESH_EXPIRY_DAYS=7

# Email (SendGrid - Configuré en production)
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=<SENDGRID_API_KEY>
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME=Kanban Board

# Logging
LOG_LEVEL=info
DEBUG_MODE=false

# Rate Limiting
RATE_LIMIT=100
RATE_WINDOW=900
```

---

### 2. docker-compose.production.yml

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    container_name: kanban_postgres_prod
    restart: always
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASS}
      POSTGRES_DB: ${DB_NAME}
      # Sauvegardes automatiques
      POSTGRES_INITDB_ARGS: "-c max_connections=100"
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
      # Backups
      - ./backups:/backups
    networks:
      - kanban_network_prod
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  backend:
    image: kanban_backend:latest
    container_name: kanban_backend_prod
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DB_USER: ${DB_USER}
      DB_PASS: ${DB_PASS}
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: ${DB_NAME}
      ENVIRONMENT: production
      LOG_LEVEL: info
      JWT_SECRET: ${JWT_SECRET}
    networks:
      - kanban_network_prod
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
    logging:
      driver: "json-file"
      options:
        max-size: "50m"
        max-file: "5"

  frontend:
    image: kanban_frontend:latest
    container_name: kanban_frontend_prod
    restart: always
    depends_on:
      - backend
    ports:
      - "80:5173"   # HTTP
      - "443:5173"  # HTTPS (via Traefik/Nginx reverse proxy)
    networks:
      - kanban_network_prod
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5173/"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
    logging:
      driver: "json-file"
      options:
        max-size: "20m"
        max-file: "3"

volumes:
  postgres_prod_data:
    driver: local
    driver_opts:
      type: nfs
      o: addr=<NFS_SERVER>,vers=4,soft,timeo=180,bg,tcp,rw
      device: ":/export/postgres_data"

networks:
  kanban_network_prod:
    driver: bridge
```

---

## Scaling & Performance

### 1. Limites de Ressources

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'           # Maximum 2 CPUs
          memory: 2G          # Maximum 2GB RAM
        reservations:
          cpus: '1'           # Minimum 1 CPU réservée
          memory: 1G          # Minimum 1GB réservée
```

### 2. Replicas (Docker Swarm)

```yaml
version: '3.9'

services:
  backend:
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
        window: 120s
```

### 3. Load Balancing avec Traefik

```yaml
version: '3.9'

services:
  traefik:
    image: traefik:v3.0
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./traefik.yml:/traefik.yml
    networks:
      - kanban_network

  backend:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(`api.yourdomain.com`)"
      - "traefik.http.services.backend.loadbalancer.server.port=8080"
      - "traefik.http.routers.backend.tls=true"

  frontend:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`yourdomain.com`)"
      - "traefik.http.services.frontend.loadbalancer.server.port=5173"
      - "traefik.http.routers.frontend.tls=true"
```

---

## Security Hardening

### 1. Secrets Docker

```bash
# Créer des secrets
echo "my_db_password" | docker secret create db_password -
echo "my_jwt_secret" | docker secret create jwt_secret -

# Utiliser dans compose
version: '3.9'

services:
  backend:
    environment:
      DB_PASS_FILE: /run/secrets/db_password
      JWT_SECRET_FILE: /run/secrets/jwt_secret
    secrets:
      - db_password
      - jwt_secret

secrets:
  db_password:
    external: true
  jwt_secret:
    external: true
```

### 2. Network Security

```yaml
version: '3.9'

networks:
  frontend_net:
    internal: false
  backend_net:
    internal: true

services:
  frontend:
    networks:
      - frontend_net
      - backend_net

  backend:
    networks:
      - backend_net

  postgres:
    networks:
      - backend_net
```

### 3. Image Scanning

```bash
# Scanner les images pour vulnérabilités
docker scan kanban_backend
docker scan kanban_frontend

# Avec trivy
trivy image kanban_backend:latest
trivy image kanban_frontend:latest
```

---

## CI/CD Integration

### 1. GitHub Actions

```yaml
# .github/workflows/docker.yml
name: Docker Build & Push

on:
  push:
    branches: [main, production]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push Backend
        uses: docker/build-push-action@v4
        with:
          context: ./server
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ secrets.DOCKER_USERNAME }}/kanban-backend:latest
          cache-from: type=registry,ref=${{ secrets.DOCKER_USERNAME }}/kanban-backend:buildcache
          cache-to: type=registry,ref=${{ secrets.DOCKER_USERNAME }}/kanban-backend:buildcache,mode=max

      - name: Build and push Frontend
        uses: docker/build-push-action@v4
        with:
          context: ./client
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ secrets.DOCKER_USERNAME }}/kanban-frontend:latest
          cache-from: type=registry,ref=${{ secrets.DOCKER_USERNAME }}/kanban-frontend:buildcache
          cache-to: type=registry,ref=${{ secrets.DOCKER_USERNAME }}/kanban-frontend:buildcache,mode=max
```

### 2. GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - build
  - test
  - deploy

variables:
  DOCKER_DRIVER: overlay2

build_backend:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t kanban-backend:latest ./server
    - docker tag kanban-backend:latest $CI_REGISTRY_IMAGE/backend:latest
    - docker push $CI_REGISTRY_IMAGE/backend:latest

build_frontend:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t kanban-frontend:latest ./client
    - docker tag kanban-frontend:latest $CI_REGISTRY_IMAGE/frontend:latest
    - docker push $CI_REGISTRY_IMAGE/frontend:latest

deploy_prod:
  stage: deploy
  image: alpine:latest
  script:
    - apk add --no-cache openssh-client
    - mkdir -p ~/.ssh
    - echo "$SSH_PRIVATE_KEY" > ~/.ssh/deploy_key
    - chmod 600 ~/.ssh/deploy_key
    - ssh -i ~/.ssh/deploy_key -o StrictHostKeyChecking=no user@prod-server "docker compose pull && docker compose up -d"
  only:
    - main
```

---

## Kubernetes Migration

### 1. Créer des manifests Kubernetes

```yaml
# k8s/deployment-backend.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kanban-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: kanban-backend
  template:
    metadata:
      labels:
        app: kanban-backend
    spec:
      containers:
      - name: backend
        image: yourregistry/kanban-backend:latest
        ports:
        - containerPort: 8080
        env:
        - name: DB_HOST
          value: postgres-service
        - name: DB_USER
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: username
        - name: DB_PASS
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: password
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
```

### 2. Convertir compose en manifests

```bash
# Utiliser kompose
kompose convert -f docker-compose.yml

# Ou manuellement via https://kompose.io/
```

---

## 🚀 Déploiement Production

```bash
# 1. Préparer l'environnement
export ENV=production

# 2. Créer les secrets
cat > .env.production << EOF
DB_PASS=<STRONG_PASSWORD>
JWT_SECRET=<STRONG_SECRET>
MAIL_PASSWORD=<API_KEY>
EOF

# 3. Déployer
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

# 4. Vérifier
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
docker compose logs --tail=50

# 5. Monitorer
docker stats
```

---

## 📊 Monitoring & Observabilité

### 1. Prometheus + Grafana

```yaml
version: '3.9'

services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:latest
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana

  backend:
    # Ajouter les métriques Prometheus
    environment:
      METRICS_ENABLED: "true"
      METRICS_PORT: "9100"
    ports:
      - "9100:9100"
```

### 2. ELK Stack (Logging)

```yaml
version: '3.9'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
    environment:
      - discovery.type=single-node
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  kibana:
    image: docker.elastic.co/kibana/kibana:8.0.0
    ports:
      - "5601:5601"

  logstash:
    image: docker.elastic.co/logstash/logstash:8.0.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
```

---

Besoin d'aide pour déployer en production? Consulter les documentations officielles ou demander dans les forums communautaires! 🚀
