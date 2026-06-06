package database

import (
	"server/modules/auth"
	"server/modules/notifications"
	"server/modules/tasks"

	"gorm.io/gorm"
)

func SeedAll(db *gorm.DB) {
	// Seed roles + default admin/user accounts
	if err := auth.SeedUsers(db, 0); err != nil {
		panic(err)
	}

	// Seed demo notifications (per user)
	if err := notifications.SeedNotifications(db, 50); err != nil {
		panic(err)
	}

	// Seed demo tasks (per user)
	if err := tasks.SeedTasks(db, 12); err != nil {
		panic(err)
	}
}
