# 🐳 Docker Configuration - Kanban Board

## ✅ Fichiers Créés

### 📁 Frontend (React/Vite/Nginx)
- **`client/Dockerfile`** - Multi-stage build optimisé (Node → Nginx Alpine)
- **`client/.dockerignore`** - Exclusions du contexte de build
- **`client/nginx.conf`** - Configuration Nginx (SPA, proxy API, compression)

### 📁 Backend (Go/Gin)
- **`server/Dockerfile`** - Multi-stage build optimisé (Go → Alpine)
- **`server/.dockerignore`** - Exclusions du contexte de build

### 📁 Orchestration
- **`docker-compose.yml`** - Configuration complète des 3 services
- **`.env.example`** - Variables d'environnement exemple
- **`DOCKER_SETUP.md`** - Documentation détaillée

### 📁 Scripts de Gestion
**Windows (PowerShell):**
- `docker-start.ps1` - Démarrer l'application
- `docker-stop.ps1` - Arrêter l'application
- `docker-logs.ps1` - Voir les logs
- `docker-status.ps1` - État des services

**Linux/macOS (Bash):**
- `docker-start.sh` - Démarrer l'application
- `docker-stop.sh` - Arrêter l'application
- `docker-logs.sh` - Voir les logs
- `docker-status.sh` - État des services

---

## 🚀 Démarrage Rapide

### Étape 1 : Configuration Initiale
```bash
# Créer le fichier .env
cp .env.example .env

# Éditer les variables sensibles (DB_PASS, JWT_SECRET, etc.)
# Sur Windows:
notepad .env
# Sur macOS/Linux:
nano .env
```

### Étape 2 : Lancer l'Application

**Sur Windows (PowerShell):**
```powershell
# Exécuter le script de démarrage
.\docker-start.ps1
```

**Sur macOS/Linux:**
```bash
# Rendre le script exécutable
chmod +x docker-start.sh

# Exécuter le script
./docker-start.sh
```

**Ou commande directe:**
```bash
docker compose up --build
```

### Étape 3 : Accéder à l'Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8080
- **PostgreSQL:** localhost:5432

---

## 🎯 Architecture Docker

```
┌─────────────────────────────────────────┐
│       Docker Network: kanban_network    │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────┐  ┌────────────┐  │
│  │  FRONTEND        │  │  BACKEND   │  │
│  │  Nginx Alpine    │  │  Go Alpine │  │
│  │  Port: 5173      │  │  Port: 8080   │
│  │  Gzip, SPA       │  │  Health ✅    │
│  └──────────────────┘  └────────────┘  │
│         │                    │         │
│         └────────┬───────────┘         │
│                  │                     │
│         ┌────────▼─────────┐           │
│         │   PostgreSQL     │           │
│         │   Alpine:16      │           │
│         │   Port: 5432     │           │
│         │   Volume: Data   │           │
│         │   Health ✅      │           │
│         └──────────────────┘           │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📊 Optimisations Appliquées

| Aspect | Frontend | Backend |
|--------|----------|---------|
| **Image Base** | Node 22 → Nginx Alpine | Go 1.26 → Alpine 3.21 |
| **Taille Finale** | ~50MB | ~25MB |
| **Build** | Multi-stage ✅ | Multi-stage ✅ |
| **Compression** | Gzip ✅ | - |
| **Cache** | NPM ci ✅ | Go mod ✅ |
| **User** | nginx | appuser |
| **Health Check** | curl ✅ | curl ✅ |

---

## 🛠️ Commandes Essentielles

### Démarrage/Arrêt

```bash
# Démarrer
docker compose up --build

# Démarrer en arrière-plan
docker compose up --build -d

# Arrêter
docker compose down

# Arrêter et supprimer les données
docker compose down -v
```

### Logs

```bash
# Tous les logs en temps réel
docker compose logs -f

# Logs du backend
docker compose logs -f backend

# Logs du frontend
docker compose logs -f frontend

# Logs PostgreSQL
docker compose logs -f postgres

# Dernières 100 lignes
docker compose logs --tail=100
```

### Services

```bash
# État des services
docker compose ps

# Redémarrer un service
docker compose restart backend

# Reconstruire un service
docker compose build --no-cache backend

# Accéder au shell
docker compose exec backend sh
docker compose exec postgres sh
```

### Base de Données

```bash
# Accéder à PostgreSQL
docker compose exec postgres psql -U postgres -d kanban_db

# Lister les bases de données
\l

# Se connecter à la base
\c kanban_db

# Voir les tables
\dt

# Quitter
\q
```

---

## 🔐 Variables d'Environnement

Les variables sont gérées dans le fichier `.env` à la racine du projet.

### Variables Critiques à Modifier

```env
# ❌ À CHANGER
DB_PASS=your_secure_password_here_change_me
JWT_SECRET=8f4d9c2e7b1a5f6d3c8e9f0a2b4c6d8e1f3a5b7c9d2e4f6

# ❌ À CONFIGURER EN PRODUCTION
MAIL_PASSWORD=your_sendgrid_api_key_here
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Générer des Secrets Sécurisés

```bash
# Linux/macOS
openssl rand -hex 32  # Pour JWT_SECRET
openssl rand -hex 16  # Pour DB_PASS

# PowerShell
[System.Convert]::ToHexString((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## 🐛 Troubleshooting

### Port déjà utilisé

```bash
# Voir quel processus utilise le port
# Windows:
netstat -ano | findstr :5173

# macOS/Linux:
lsof -i :5173
```

**Solution:** Changer le port dans `docker-compose.yml` ou arrêter l'application qui utilise le port.

### Le backend ne se connecte pas à PostgreSQL

```bash
# Vérifier que postgres est prêt
docker compose logs postgres

# Test de connexion
docker compose exec backend ping postgres
docker compose exec backend curl http://postgres:5432
```

### Le frontend ne peut pas appeler l'API

```bash
# Vérifier que backend répond
curl http://localhost:8080/api/health

# Vérifier les logs nginx
docker compose logs frontend
```

### Espace disque insuffisant

```bash
# Nettoyer les images/volumes inutilisés
docker system prune -a --volumes

# Reconstruire
docker compose build --no-cache
```

---

## 📋 Fichiers de Configuration

### `.env` (À créer à partir de `.env.example`)

Ce fichier contient **tous les secrets et configurations**. Ne pas le committer dans Git !

```bash
.env           # ← À ajouter à .gitignore
.env.example   # ← À versionner (sans secrets)
.env.local     # ← Pour overrides locaux
```

### `docker-compose.yml`

Configuration Docker :
- 3 services : frontend, backend, postgres
- Network commun : `kanban_network`
- Volume pour persistance BD : `postgres_data`
- Health checks sur chaque service
- Dépendances entre services

### `Dockerfile` Frontend

1. **Stage Build:** Node 22 Alpine
   - Installe dépendances npm
   - Build React/Vite avec TypeScript
   
2. **Stage Runtime:** Nginx Alpine
   - Serveur Nginx ultra-léger
   - Gzip compression
   - Proxy API vers backend
   - Routage SPA (try_files)

### `Dockerfile` Backend

1. **Stage Build:** Go 1.26 Alpine
   - Télécharge dépendances Go
   - Compile le binaire (static, optimisé)
   
2. **Stage Runtime:** Alpine 3.21
   - Binaire Go seulement
   - User non-root
   - Health check

---

## 🌐 Environnements

### Développement (actuellement configuré)
- CORS: `localhost:5173`
- Cookies: `SECURE=false` (pas de HTTPS)
- JWT secret par défaut (À changer!)
- Logs verbeux

### Production (à adapter)

Modifier `.env` :
```env
COOKIE_SECURE=true
CORS_ALLOWED_ORIGINS=https://yourdomain.com
JWT_SECRET=<strong-random-secret>
DB_PASS=<strong-random-password>
MAIL_PASSWORD=<sendgrid-api-key>
```

Ajouter à `docker-compose.yml` pour les limites de ressources :
```yaml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 1G
```

---

## 📚 Documentation Complète

Pour la documentation détaillée, consulter : [DOCKER_SETUP.md](DOCKER_SETUP.md)

Sujets couverts:
- Architecture complète
- Optimisations appliquées
- Commandes avancées
- Gestion des ressources
- CI/CD integration
- Problèmes courants

---

## 💡 Bonnes Pratiques

✅ **À Faire:**
- Copier `.env.example` en `.env` avant le premier démarrage
- Modifier les secrets avant la production
- Versionner `docker-compose.yml` et `Dockerfile`
- Utiliser les scripts fournis pour démarrage/arrêt
- Consulter les logs en cas de problème

❌ **À Éviter:**
- Committer `.env` (contient les secrets)
- Modifier les ports sans raison
- Utiliser l'utilisateur root dans les conteneurs
- Construire sans cache pendant le développement
- Supprimer les volumes manuellement

---

## 📞 Support

Pour plus d'informations :
1. Consulter [DOCKER_SETUP.md](DOCKER_SETUP.md)
2. Lancer `docker compose logs` pour voir les erreurs
3. Tester la connexion entre services
4. Vérifier les variables d'environnement

**Bonne chance avec votre Kanban Board ! 🚀**
