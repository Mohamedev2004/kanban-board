package main

import (
	"kanban/config"
	"kanban/shared/database"
)

func main() {
	config.Load()
	database.Connect()
	database.Migrate()
	database.SeedAll(database.MainDB)
}
