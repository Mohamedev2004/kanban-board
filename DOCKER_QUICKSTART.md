# 🚀 Docker - Guide Rapide

## Configuration Initiale (À faire UNE FOIS)

### Windows (PowerShell)
```powershell
# 1. Créer le fichier .env
Copy-Item ".env.example" ".env"
notepad .env

# 2. Modifier les variables sensibles:
# DB_PASS=your_secure_password
# JWT_SECRET=votre_secret_jwt

# 3. Lancer l'application
.\docker-start.ps1
```

### macOS / Linux
```bash
# 1. Créer le fichier .env
cp .env.example .env
nano .env

# 2. Modifier les variables sensibles:
# DB_PASS=your_secure_password
# JWT_SECRET=votre_secret_jwt

# 3. Lancer l'application (Option 1 - script)
chmod +x docker-start.sh
./docker-start.sh

# Lancer l'application (Option 2 - make)
make up

# Lancer l'application (Option 3 - direct)
docker compose up --build
```

---

## Accéder à l'Application

✅ Tout est prêt une fois que vous voyez:
```
✅ Services started!

📍 Access points:
   Frontend:  http://localhost:5173
   Backend:   http://localhost:8080
   Database:  localhost:5432
```

Ouvrez votre navigateur et allez à: **http://localhost:5173**

---

## Commandes Quotidiennes

### Démarrer / Arrêter

```bash
# ✅ Démarrer
docker compose up                    # Mode actif (voir les logs)
docker compose up -d                 # Mode détaché (en arrière-plan)

# 🛑 Arrêter
docker compose down                  # Arrêter (garder les données)
docker compose down -v               # Arrêter et SUPPRIMER les données

# 🔄 Redémarrer
docker compose restart
```

### Voir les Logs

```bash
# 📋 Tous les logs
docker compose logs -f               # Temps réel
docker compose logs --tail=100       # 100 dernières lignes

# 📋 Logs d'un service spécifique
docker compose logs -f backend       # Backend seulement
docker compose logs -f frontend      # Frontend seulement
docker compose logs -f postgres      # PostgreSQL seulement
```

### État des Services

```bash
# 📊 Status
docker compose ps                    # État des conteneurs

# 📈 Ressources
docker stats                         # CPU, Mémoire, etc.

# 🏥 Health check
docker compose exec backend curl http://localhost:8080/health
docker compose exec postgres psql -U postgres -c "SELECT 1"
```

---

## Problèmes Courants

### "Port 5173 already in use"

```bash
# Voir quel processus utilise le port
lsof -i :5173          # macOS/Linux
netstat -ano | findstr :5173  # Windows

# Solution: Arrêter l'app qui l'utilise, ou changer le port
# Dans docker-compose.yml: "5174:5173"
```

### Backend ne se connecte pas à PostgreSQL

```bash
# Vérifier que postgres est prêt
docker compose logs postgres

# Tester la connexion
docker compose exec backend ping postgres
```

### Le frontend ne voit pas l'API

```bash
# Vérifier que le backend répond
curl http://localhost:8080/api/health

# Vérifier la configuration CORS dans .env
echo $CORS_ALLOWED_ORIGINS
```

### Libre de l'espace disque

```bash
# Nettoyer
docker system prune -a --volumes

# Reconstruire
docker compose build --no-cache
```

---

## Accéder à la Base de Données

```bash
# Ouvrir PostgreSQL shell
docker compose exec postgres psql -U postgres -d kanban_db

# Commandes utiles:
\l                # Lister les bases
\dt               # Lister les tables
\d table_name     # Voir structure d'une table
SELECT * FROM users;  # Requête SQL
\q                # Quitter
```

---

## Scripts Disponibles

### Windows (PowerShell)
```powershell
.\docker-start.ps1    # Démarrer
.\docker-stop.ps1     # Arrêter
.\docker-logs.ps1     # Voir logs
.\docker-status.ps1   # État
```

### Linux / macOS
```bash
./docker-start.sh     # Démarrer
./docker-stop.sh      # Arrêter
./docker-logs.sh      # Voir logs
./docker-status.sh    # État
```

### Ou avec Make
```bash
make up               # Démarrer
make down             # Arrêter
make logs             # Voir logs
make ps               # État
make shell-db         # Accéder à PostgreSQL
make shell-backend    # Accéder au backend
```

---

## Variables d'Environnement (dans .env)

| Variable | Exemple | Importance |
|----------|---------|-----------|
| DB_USER | postgres | Utilisateur BD |
| DB_PASS | mysecurepass | ⚠️ Changer! |
| DB_NAME | kanban_db | Base de données |
| JWT_SECRET | abc123... | ⚠️ Changer! |
| CORS_ALLOWED_ORIGINS | http://localhost:5173 | Pour API |
| MAIL_PASSWORD | sendgrid_key | Emails |

**⚠️ Important:** Ne JAMAIS committer `.env` avec les vrais secrets!

---

## Développement Local

### Rechargement du code

```bash
# Le code dans /server est un volume
# Les changements sont visibles en direct

# Forcer un rebuild du backend
docker compose restart backend

# Forcer un rebuild du frontend (nécessite rebuild image)
docker compose build frontend
docker compose up frontend
```

### Exécuter des commandes

```bash
# Dans le backend
docker compose exec backend sh
./server                    # Relancer le serveur
go test ./...              # Lancer les tests

# Dans le frontend
docker compose exec frontend sh
npm run dev                # Démarrer en dev
npm run build              # Build production
```

---

## Avant la Production

1. **Générer des secrets forts:**
   ```bash
   openssl rand -hex 32  # DB_PASS, JWT_SECRET
   ```

2. **Configurer HTTPS:**
   ```bash
   COOKIE_SECURE=true
   CORS_ALLOWED_ORIGINS=https://yourdomain.com
   ```

3. **Ajouter limites de ressources:**
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '1'
         memory: 1G
   ```

4. **Sauvegarder les volumes:**
   ```bash
   docker volume inspect kanban_postgres_data
   ```

---

## Documentation Complète

Pour plus de détails:
- 📘 [DOCKER_README.md](DOCKER_README.md) - Guide complet
- 📙 [DOCKER_SETUP.md](DOCKER_SETUP.md) - Documentation détaillée
- 📕 [docker-compose.yml](docker-compose.yml) - Configuration

---

## ✅ Checklist de Démarrage

- [ ] Docker est installé et en cours d'exécution
- [ ] `.env` est créé à partir de `.env.example`
- [ ] `DB_PASS` et `JWT_SECRET` sont modifiés
- [ ] `docker compose up --build` démarre sans erreur
- [ ] Frontend accessible à http://localhost:5173
- [ ] Backend accessible à http://localhost:8080
- [ ] Vous pouvez vous connecter à PostgreSQL

---

**Vous êtes prêt! 🚀 Accédez à votre application à http://localhost:5173**
