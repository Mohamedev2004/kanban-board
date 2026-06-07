-- Migration pour optimiser les requêtes lentes
-- Ajouter ces index à votre migration GORM

-- Index sur due_date pour les requêtes de tâches overdue
CREATE INDEX idx_tasks_due_date_status 
ON tasks(due_date, status) 
WHERE deleted_at IS NULL;

-- Index sur expires_at pour le nettoyage des tokens
CREATE INDEX idx_tokens_expires_at 
ON tokens(expires_at);

-- Index supplémentaire pour les recherches fréquentes
CREATE INDEX idx_tasks_status 
ON tasks(status) 
WHERE deleted_at IS NULL;
