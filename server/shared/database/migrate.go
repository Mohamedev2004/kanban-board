package database

import (
	"log"

	"server/modules/auth"
	"server/modules/logs"
	"server/modules/notifications"
	"server/modules/tasks"
)

func Migrate() {
	// 1. Core tables → Main Database
	if err := MainDB.AutoMigrate(
		&auth.User{},
		&auth.Token{},
		&auth.Role{},
		&auth.UserRole{},
		&notifications.Notification{},
		&tasks.Task{},
	); err != nil {
		log.Fatal("Main DB Migration failed:", err)
	}

	// 2. Audit log table → separate Logs Database
	if err := LogsDB.AutoMigrate(
		&logs.AuditLog{},
	); err != nil {
		log.Fatal("Logs DB Migration failed:", err)
	}
}
