# 🐳 Configuration Docker - Kanban Board

Ce document décrit la configuration Docker complète pour le projet Kanban Board avec le développement et la production.

## 📋 Fichiers Docker Créés

### Frontend (React/Vite)
- **`client/Dockerfile`** - Multi-stage build optimisé avec Nginx
- **`client/.dockerignore`** - Exclusions pour le build
- **`client/nginx.conf`** - Configuration Nginx (routage SPA, proxy API, compression Gzip)

### Backend (Go/Gin)
- **`server/Dockerfile`** - Multi-stage build optimisé avec Alpine
- **`server/.dockerignore`** - Exclusions pour le build

### Orchestration
- **`docker-compose.yml`** - Compose file avec tous les services
- **`.env.example`** - Variables d'environnement exemple

## 🏗️ Architecture Docker

```
┌─────────────────────────────────────────┐
│         Docker Network (Bridge)         │
├─────────────────────────────────────────┤
│                                         │
│  ┌────────────────┐  ┌──────────────┐ │
│  │    Frontend    │  │   Backend    │ │
│  │  (Nginx)       │  │  (Go/Gin)    │ │
│  │  Port: 5173    │  │  Port: 8080  │ │
│  └────────────────┘  └──────────────┘ │
│         │                    │         │
│         └────────┬───────────┘         │
│                  │                     │
│         ┌────────▼────────┐            │
│         │   PostgreSQL    │            │
│         │   Port: 5432    │            │
│         │   Volume: DB    │            │
│         └─────────────────┘            │
│                                         │
└─────────────────────────────────────────┘
```

## 🚀 Démarrage Rapide

### 1. Configuration Initial

```bash
# Cloner le .env.example en .env à la racine
cp .env.example .env

# Éditer .env et configurer vos variables
# Important: Changer DB_PASS et JWT_SECRET
nano .env
```

### 2. Lancer l'Application Complète

```bash
# Construire et démarrer tous les services
docker compose up --build

# Ou en arrière-plan
docker compose up --build -d

# Voir les logs
docker compose logs -f

# Voir les logs d'un service spécifique
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### 3. Accéder à l'Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8080
- **PostgreSQL:** localhost:5432

### 4. Arrêter l'Application

```bash
# Arrêter tous les services
docker compose down

# Arrêter et supprimer les volumes (données)
docker compose down -v

# Arrêter et reconstruire
docker compose down && docker compose up --build
```

## 🔧 Commandes Utiles

### Gestion des Services

```bash
# Démarrer un service spécifique
docker compose up backend

# Redémarrer un service
docker compose restart backend

# Rebuidler un service
docker compose build --no-cache backend

# Voir les services en cours d'exécution
docker compose ps
```

### Gestion de la Base de Données

```bash
# Accéder au shell PostgreSQL
docker compose exec postgres psql -U postgres -d kanban_db

# Voir les volumes
docker volume ls

# Inspecter un volume
docker volume inspect kanban_postgres_data

# Nettoyer les données (attention!)
docker compose down -v
```

### Exécuter des Commandes dans les Conteneurs

```bash
# Exécuter une commande dans le backend
docker compose exec backend ./server

# Accéder au shell du backend
docker compose exec backend sh

# Voir les variables d'environnement
docker compose exec backend env

# Générer une graine (seed) dans la base de données
docker compose exec backend ./server seed
```

### Debugging

```bash
# Voir les logs en temps réel
docker compose logs -f

# Voir les logs des 100 dernières lignes
docker compose logs --tail=100

# Inspecter un conteneur
docker inspect kanban_backend

# Voir l'utilisation des ressources
docker stats

# Test de connexion entre services
docker compose exec backend ping postgres
docker compose exec backend curl http://postgres:5432
```

## 📦 Optimisations Appliquées

### Frontend (Nginx + React)

✅ **Multi-stage build**
- Réduit la taille finale de l'image (~50MB au lieu de 500MB+)
- Étape 1: Build avec Node.js
- Étape 2: Runtime léger avec Nginx Alpine

✅ **Nginx Alpine**
- Image de base 9MB seulement
- Inclut gzip compression
- Headers de sécurité (X-Frame-Options, Content-Security-Policy)
- Proxy vers backend (/api/*)
- Routage SPA (try_files)

✅ **Cache des Assets**
- Assets statiques cachés 1 an
- CSS/JS/Images avec versioning automatique

✅ **Compression Gzip**
- JS, CSS, JSON compressés (réduction 60-80%)

### Backend (Go Alpine)

✅ **Multi-stage build**
- Réduit la taille finale de l'image (~25MB au lieu de 1GB+)
- Étape 1: Build avec Go 1.26
- Étape 2: Runtime avec Alpine 3.21

✅ **Alpine Linux**
- Image de base 7MB seulement
- Déploiement plus rapide

✅ **Compilation Optimisée**
- CGO_ENABLED=0 pour portabilité
- -ldflags "-w -s" pour réduire la taille
- Binary statique

✅ **Sécurité**
- Utilisateur non-root (appuser)
- Pas de shell accès direct
- Health checks activés

### PostgreSQL

✅ **Persistance**
- Volume Docker pour les données
- Survive aux redémarrages

✅ **Health Checks**
- Vérifie la disponibilité avant démarrer les autres services
- Retries automatiques

## 🔐 Sécurité

### En Développement

Les paramètres sont optimisés pour le développement :
- `COOKIE_SECURE=false` (pas de HTTPS)
- `CORS_ALLOWED_ORIGINS=http://localhost:5173`
- JWT_SECRET par défaut (À CHANGER!)

### En Production

Pour la production, modifiez `.env` :

```bash
# Générer des secrets sécurisés
openssl rand -hex 32  # JWT_SECRET
openssl rand -hex 16  # DB_PASS

# Configuration HTTPS
COOKIE_SECURE=true
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# Mail réel
MAIL_PASSWORD=your_sendgrid_key

# Variables d'environnement de production
# À implémenter via docker secrets ou variables d'environnement
```

### Fichiers à Protéger

- `.env` - NE PAS committer (contient les secrets)
- `docker-compose.yml` - Peut être versionné
- `.dockerignore` - À versionner

## 📊 Gestion des Ressources

### Limites Recommandées

Ajouter aux services dans `docker-compose.yml` si nécessaire :

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## 🔄 CI/CD Integration

Pour GitHub Actions, GitLab CI, etc. :

```bash
# Build les images sans lancer
docker compose build

# Push vers registry (Docker Hub, etc.)
docker tag kanban_frontend:latest myregistry/kanban:latest
docker push myregistry/kanban:latest
```

## 🐛 Troubleshooting

### Le backend ne peut pas se connecter à PostgreSQL

```bash
# Vérifier que postgres est en bonne santé
docker compose ps postgres

# Vérifier les logs
docker compose logs postgres

# Tester la connexion
docker compose exec backend psql -h postgres -U postgres -d kanban_db
```

### Le frontend ne peut pas appeler l'API

```bash
# Vérifier que backend est accessible
docker compose exec frontend curl http://backend:8080/api/health

# Vérifier les logs nginx
docker compose logs frontend
```

### Port déjà utilisé

```bash
# Identifier le processus utilisant le port
lsof -i :5173
lsof -i :8080
lsof -i :5432

# Libérer le port ou changer dans docker-compose.yml
# Exemple: "5174:5173" pour frontend sur port 5174
```

### Espace disque insuffisant

```bash
# Voir l'utilisation des images/volumes
docker system df

# Nettoyer les données inutilisées
docker system prune -a --volumes

# Reconstruire les images
docker compose build --no-cache
```

## 📝 Notes Importantes

1. **Variables d'Environnement**
   - Toutes les configurations se font via `.env`
   - Copier d'abord `.env.example` en `.env`
   - Le container frontend ne lit pas `.env` (compilé à la build)

2. **Volumes**
   - `postgres_data` persiste les données PostgreSQL
   - Survit aux redémarrages
   - Supprimer avec `docker compose down -v`

3. **Network**
   - `kanban_network` connecte tous les services
   - Les services communiquent par nom (postgres, backend)
   - DNS résolu automatiquement

4. **Health Checks**
   - Backend et PostgreSQL ont des health checks
   - Le frontend démarre après le backend (dépendance)
   - Les services redémarrent automatiquement en cas de problème

5. **Logs**
   - Voir avec `docker compose logs -f`
   - Les logs disparaissent quand le conteneur est supprimé
   - Utiliser des volumes pour persister les logs en production

## 🎯 Prochaines Étapes

1. **Environnement Production**
   - Ajouter Traefik ou Nginx reverse proxy
   - Configurer Let's Encrypt pour HTTPS
   - Utiliser secrets Docker pour les données sensibles

2. **CI/CD**
   - GitHub Actions pour build/test automatique
   - Push vers Docker Hub/Container Registry
   - Déployer automatiquement

3. **Monitoring**
   - Ajouter Prometheus pour les métriques
   - Grafana pour visualisation
   - ELK Stack pour logs centralisés

4. **Kubernetes**
   - Convertir en manifests Kubernetes
   - Déployer sur EKS, GKE, ou AKS
   - Scaler horizontalement

---

**Besoin d'aide ?** Consulter la documentation :
- Docker: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- Nginx: https://nginx.org/en/docs/
- Go: https://golang.org/doc/
