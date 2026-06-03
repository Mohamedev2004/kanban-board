package main

import (
	"server/config"
	"server/shared/database"
	"database/sql"
	"fmt"
	"log"

	_ "github.com/jackc/pgx/v5/stdlib"
)

func main() {
	config.Load()

	log.Println("→ Dropping existing databases...")
	dropDatabases()

	log.Println("→ Connecting (databases will be recreated)...")
	database.Connect()

	log.Println("→ Running migrations...")
	database.Migrate()

	log.Println("→ Seeding dev data...")
	database.SeedDev(database.MainDB)
}

func dropDatabases() {
	cfg := config.Cfg.DB
	dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/postgres?sslmode=disable",
		cfg.User, cfg.Pass, cfg.Host, cfg.Port)

	db, err := sql.Open("pgx", dsn)
	if err != nil {
		log.Fatalf("failed to connect to postgres: %v", err)
	}
	defer db.Close()

	for _, name := range []string{cfg.Name, cfg.Name + "_logs"} {
		// Terminate active connections before dropping
		_, _ = db.Exec(fmt.Sprintf(
			`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '%s' AND pid <> pg_backend_pid()`,
			name,
		))
		if _, err := db.Exec("DROP DATABASE IF EXISTS " + name); err != nil {
			log.Fatalf("failed to drop %s: %v", name, err)
		}
		fmt.Printf("  Dropped: %s\n", name)
	}
}
