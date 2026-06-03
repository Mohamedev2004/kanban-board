package main

import (
	"server/config"
	"server/shared/database"
)

func main() {
	config.Load()
	database.Connect()
	database.Migrate()
	database.SeedAll(database.MainDB)
}
