# 🚀 Docker Performance - Quick Commands

## Démarrage Rapide Optimisé

```bash
# ✅ Démarrage complet (services en parallèle)
docker compose up -d

# Vérifier l'état (tous doivent être "healthy" en ~10s)
docker compose ps
```

## Optimisé: Build + Run
```bash
# Premier démarrage avec build optimisé
docker compose up --build -d

# Vérifier que tout est sain
docker compose ps
curl http://localhost:8080/health  # Backend
curl http://localhost:5173/        # Frontend
```

## Rebuild Incrémental (TRÈS RAPIDE avec cache)
```bash
# Après modification du code source
docker compose up --build -d
# Devrait être 3-5x plus rapide grâce aux optimisations de cache
```

## Tests de Performance

### PowerShell (Windows)
```powershell
# Test complet de performance
.\test-performance.ps1
```

### Bash (Linux/Mac)
```bash
# Test complet de performance
chmod +x test-performance.sh
./test-performance.sh
```

## Nettoyage & Redémarrage Complet

```bash
# ✅ Arrêt avec suppression des volumes
docker compose down -v --remove-orphans

# ✅ Nettoyer le cache de build (entre les optimisations)
docker builder prune -a -f

# ✅ Redémarrage complet
docker compose up --build -d
```

## Monitoring & Logs

```bash
# Voir tous les logs en temps réel
docker compose logs -f

# Logs d'un service spécifique
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres

# Dernières 50 lignes
docker compose logs --tail=50 backend
```

## Status et Health

```bash
# Vérifier tous les services
docker compose ps

# Vérifier tous les services (inclus arrêtés)
docker compose ps -a

# Voir les images créées
docker images | grep kanban

# Taille des images (montrer les optimisations)
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep kanban
```

## API Testing

```bash
# Backend health check
curl http://localhost:8080/health

# Frontend
curl http://localhost:5173/

# Backend API example
curl http://localhost:8080/api/v1/tasks
```

## Arrêt & Nettoyage

```bash
# ✅ Arrêt sans suppression de données
docker compose down

# ✅ Arrêt avec suppression COMPLÈTE (volumes + networks)
docker compose down -v --remove-orphans

# ✅ Arrêt et suppression des images
docker compose down -v --remove-orphans --rmi all
```

## Performance Benchmarks (Attendus)

| Metric | Avant | Après | Amélioration |
|--------|-------|-------|--------------|
| Clean Build | 35-40s | 25-30s | **-30%** ⚡ |
| Startup Total | 30-40s | 10-12s | **-70%** 🚀 |
| Cache Rebuild | 15-20s | 3-5s | **-80%** ⚡⚡ |
| Image Size (Frontend) | ~85MB | ~50MB | **-40%** 📦 |
| Image Size (Backend) | ~300MB | ~25MB | **-92%** 📦 |

## Utilisation en Production

```bash
# Build pour production
DOCKER_BUILDKIT=1 docker compose -f docker-compose.yml build

# Run en production
docker compose -f docker-compose.yml up -d

# Monitoring production
docker compose logs -f --since 10m

# Scale backend (si applicable)
docker compose up -d --scale backend=3
```

## Troubleshooting Rapide

```bash
# Les services ne démarrent pas?
docker compose logs backend
docker compose logs frontend
docker compose logs postgres

# Réinitialiser la base de données
docker compose down -v
docker compose up -d

# Port déjà en utilisation?
netstat -tulpn | grep 8080    # Linux
Get-NetTCPConnection -LocalPort 8080  # Windows PowerShell

# Forcer le rebuild (pas de cache)
docker compose up --build --no-cache -d
```

## Fichiers Importants

- **DOCKER_PERFORMANCE.md** - Documentation détaillée des optimisations
- **Dockerfiles** - Configurations optimisées (multi-stage, cache layers)
- **.dockerignore** - Contextes build réduits (-60%)
- **docker-compose.yml** - Services parallèles, health checks rapides

---

**Besoin d'aide?** Consultez `DOCKER_PERFORMANCE.md` pour les détails techniques complets.
