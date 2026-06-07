# 🔧 Docker - Guide de Dépannage

## 🆘 Erreurs Courantes et Solutions

### ❌ "docker: command not found"

**Problème:** Docker n'est pas installé ou n'est pas dans le PATH

**Solutions:**
```bash
# Vérifier l'installation
docker --version

# Si pas installé:
# Télécharger Docker Desktop: https://www.docker.com/products/docker-desktop

# Sur Linux (après installation):
sudo usermod -aG docker $USER
newgrp docker
```

---

### ❌ "Cannot connect to Docker daemon"

**Problème:** Docker Desktop n'est pas en cours d'exécution

**Solutions:**
- **Windows/macOS:** Ouvrir Docker Desktop depuis Applications
- **Linux:** `sudo systemctl start docker`

Vérifier:
```bash
docker ps  # Doit afficher les conteneurs
```

---

### ❌ "Port already in use"

**Problème:** Port 5173, 8080 ou 5432 est déjà utilisé

**Solutions:**

Identifier le processus:
```bash
# macOS/Linux
lsof -i :5173

# Windows (PowerShell)
netstat -ano | findstr :5173
tasklist | findstr <PID>
```

Options:
1. **Arrêter l'application:** 
   ```bash
   docker compose down
   ```

2. **Changer le port dans docker-compose.yml:**
   ```yaml
   ports:
     - "5174:5173"  # Host:Container
   ```

3. **Arrêter le processus (Windows):**
   ```powershell
   taskkill /PID <PID> /F
   ```

---

### ❌ "no such file or directory" (Dockerfile)

**Problème:** Dockerfile introuvable

**Solutions:**
```bash
# Vérifier que vous êtes à la racine du projet
pwd
ls -la client/Dockerfile
ls -la server/Dockerfile

# Vérifier le contexte de build dans docker-compose.yml
# context: ./client
# context: ./server
```

---

### ❌ "permission denied"

**Problème:** Permissions insuffisantes sur les scripts

**Solutions:**
```bash
# Rendre exécutable
chmod +x scripts/docker-start.sh
chmod +x scripts/docker-stop.sh
chmod +x scripts/docker-logs.sh
chmod +x scripts/docker-status.sh

# Ou utiliser bash directement
bash scripts/docker-start.sh
```

---

### ❌ Backend - "cannot connect to postgres"

**Problème:** Backend ne peut pas accéder à PostgreSQL

**Logs:**
```bash
docker compose logs backend | grep -i postgres
docker compose logs postgres
```

**Solutions:**

1. **Vérifier que postgres est prêt:**
   ```bash
   docker compose logs postgres
   # Chercher: "database system is ready to accept connections"
   ```

2. **Tester la connexion:**
   ```bash
   # Depuis le backend
   docker compose exec backend ping postgres
   docker compose exec backend curl http://postgres:5432
   
   # Depuis le backend (avec nc/telnet)
   docker compose exec backend sh
   nc -zv postgres 5432
   ```

3. **Vérifier les variables d'environnement:**
   ```bash
   docker compose exec backend env | grep DB_
   
   # Doit afficher:
   # DB_HOST=postgres
   # DB_PORT=5432
   # DB_NAME=kanban_db
   ```

4. **Logs PostgreSQL:**
   ```bash
   docker compose logs postgres | tail -50
   ```

---

### ❌ Frontend - "Cannot GET /api/*"

**Problème:** Frontend ne peut pas appeler l'API

**Solutions:**

1. **Vérifier que backend répond:**
   ```bash
   curl http://localhost:8080/health
   
   # Ou depuis frontend
   docker compose exec frontend curl http://backend:8080/health
   ```

2. **Vérifier la configuration Nginx:**
   ```bash
   docker compose exec frontend cat /etc/nginx/nginx.conf | grep -A5 "location /api"
   ```

3. **Vérifier les logs frontend:**
   ```bash
   docker compose logs frontend | grep -i error
   ```

4. **Vérifier CORS:**
   ```bash
   # Vérifier les headers
   curl -I http://localhost:8080/api/
   
   # Doit inclure:
   # Access-Control-Allow-Origin: http://localhost:5173
   ```

5. **Test direct:**
   ```bash
   curl -H "Origin: http://localhost:5173" http://localhost:8080/api/
   ```

---

### ❌ ".env file not found"

**Problème:** Fichier .env manquant

**Solutions:**
```bash
# Créer depuis l'exemple
cp .env.example .env

# Éditer les valeurs sensibles
nano .env

# Redémarrer les services
docker compose down
docker compose up --build
```

---

### ❌ "context deadline exceeded"

**Problème:** Service met trop de temps à démarrer

**Solutions:**

1. **Augmenter le timeout (dans docker-compose.yml):**
   ```yaml
   postgres:
     healthcheck:
       timeout: 10s    # Augmenter de 5 à 10
       retries: 10     # Augmenter de 5 à 10
   ```

2. **Vérifier les ressources:**
   ```bash
   docker stats
   ```

3. **Nettoyer et reconstruire:**
   ```bash
   docker compose down -v
   docker compose build --no-cache
   docker compose up
   ```

---

### ❌ "Out of memory" ou "No space left on device"

**Problème:** Espace disque insuffisant

**Solutions:**

1. **Voir l'utilisation:**
   ```bash
   docker system df
   df -h
   ```

2. **Nettoyer:**
   ```bash
   # Images inutilisées
   docker image prune -a

   # Conteneurs arrêtés
   docker container prune

   # Volumes inutilisés
   docker volume prune

   # Tout (⚠️ Attention!)
   docker system prune -a --volumes
   ```

3. **Reconstruire:**
   ```bash
   docker compose build --no-cache
   ```

---

### ❌ "Build failed: npm ERR!"

**Problème:** Erreur lors du build du frontend

**Logs complets:**
```bash
docker compose build frontend 2>&1 | tail -100
```

**Solutions:**

1. **Vérifier package.json:**
   ```bash
   cat client/package.json | grep -A5 '"scripts"'
   ```

2. **Vérifier dépendances:**
   ```bash
   docker compose exec frontend npm list
   ```

3. **Reconstruire avec cache:**
   ```bash
   docker compose build --no-cache frontend
   ```

4. **Vérifier lock file:**
   ```bash
   ls -la client/package-lock.json
   ls -la client/pnpm-lock.yaml
   ```

---

### ❌ "Build failed: go build"

**Problème:** Erreur lors du build du backend

**Logs complets:**
```bash
docker compose build backend 2>&1 | tail -100
```

**Solutions:**

1. **Vérifier go.mod:**
   ```bash
   cat server/go.mod | head -20
   ```

2. **Vérifier les dépendances:**
   ```bash
   docker compose exec backend go mod tidy
   ```

3. **Voir le code source:**
   ```bash
   docker compose exec backend go build -v ./...
   ```

4. **Reconstruire:**
   ```bash
   docker compose build --no-cache backend
   ```

---

### ❌ "Unhealthy" status

**Problème:** Health check échoue

**Vérifier l'état:**
```bash
docker compose ps
# Status: Up, starting, unhealthy, exited
```

**Solutions:**

1. **Voir le problème:**
   ```bash
   docker inspect <container_id> | grep -A10 "Health"
   ```

2. **Vérifier les logs:**
   ```bash
   docker compose logs <service>
   ```

3. **Test manuel:**
   ```bash
   # Backend
   docker compose exec backend curl http://localhost:8080/health
   
   # Frontend
   docker compose exec frontend curl http://localhost:5173
   
   # PostgreSQL
   docker compose exec postgres psql -U postgres -c "SELECT 1"
   ```

---

### ❌ Les changements ne sont pas réfléchis

**Problème:** Code modifié mais pas mis à jour dans le conteneur

**Solutions:**

1. **Frontend:** (image reconstruite à chaque démarrage)
   ```bash
   docker compose down
   docker compose up --build
   ```

2. **Backend:** (volume monté)
   ```bash
   # Les changements sont visibles directement
   docker compose restart backend
   
   # Ou reconstruire
   docker compose build --no-cache backend
   docker compose up backend
   ```

---

## 🔍 Outils de Diagnostic

### Vérification Complète

```bash
#!/bin/bash
echo "🔍 Docker Diagnostic"
echo "==================="
echo ""
echo "1. Docker Status:"
docker --version
docker compose --version
echo ""

echo "2. Containers:"
docker compose ps
echo ""

echo "3. Network:"
docker network ls
docker network inspect kanban_network
echo ""

echo "4. Volumes:"
docker volume ls
docker volume inspect kanban_postgres_data
echo ""

echo "5. Resources:"
docker stats --no-stream
echo ""

echo "6. Health:"
docker compose exec backend curl -s http://localhost:8080/health
docker compose exec postgres psql -U postgres -c "SELECT 1" 2>/dev/null
echo ""
```

### Vérifier la Connectivité

```bash
# Test de communication entre services
docker compose exec frontend curl http://backend:8080
docker compose exec backend curl http://postgres:5432
docker compose exec backend ping postgres -c 1
```

### Afficher les Variables d'Environnement

```bash
docker compose exec backend env | sort
docker compose exec frontend env | sort
docker compose exec postgres env | sort
```

---

## 📊 Monitoring en Temps Réel

```bash
# Tous les logs en direct
docker compose logs -f

# Ressources CPU/Mémoire
docker stats

# Réseau
docker network inspect kanban_network

# Événements
docker events

# Top des processus
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

---

## 🧹 Nettoyage Progressif

```bash
# 1. Arrêter sans supprimer (recommandé)
docker compose down

# 2. Supprimer les conteneurs
docker compose rm -f

# 3. Supprimer les images
docker image rm kanban_frontend kanban_backend

# 4. Supprimer les volumes (données!)
docker volume rm kanban_postgres_data

# 5. Tout nettoyer
docker system prune -a --volumes
```

---

## 📝 Logs Détaillés

```bash
# Logs complets avec timestamps
docker compose logs --timestamps

# Logs d'une période (dernière heure)
docker compose logs --since 1h

# Logs avec grep
docker compose logs | grep -i error
docker compose logs backend | grep -i "connection\|error\|warning"

# Export logs
docker compose logs > logs.txt
docker compose logs backend > backend.txt
```

---

## 🆘 Quand tout échoue

```bash
# Reconstruction complète
docker compose down -v
docker system prune -a --volumes
docker compose build --no-cache
docker compose up

# Ou plus agressif:
docker ps -a -q | xargs docker rm -f
docker images -q | xargs docker rmi -f
docker volume prune -f
docker compose up --build
```

---

## 📞 Demander de l'Aide

Inclure dans votre rapport:

```bash
# Générer un rapport de diagnostic
cat > diagnostic.txt << EOF
--- VERSIONS ---
$(docker --version)
$(docker compose --version)

--- STATUS ---
$(docker compose ps)

--- LOGS (dernières 50 lignes) ---
$(docker compose logs --tail=50)

--- ERROR LOGS ---
$(docker compose logs | grep -i error)

--- ENVIRONMENT ---
$(docker compose exec backend env | grep -i db_)

--- RESOURCES ---
$(docker stats --no-stream)
EOF

cat diagnostic.txt
```

---

## 🔗 Ressources Utiles

- [Docker Docs](https://docs.docker.com/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [PostgreSQL Docker](https://hub.docker.com/_/postgres)
- [Nginx Docker](https://hub.docker.com/_/nginx)
- [Go Docker](https://hub.docker.com/_/golang)

**Bon courage! 💪**
