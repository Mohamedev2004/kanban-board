package tasks

import (
	"kanban/modules/auth"

	"gorm.io/gorm"
)

// SeedTasks creates `count` demo tasks for every user that currently has none.
// It is idempotent: users who already own tasks are skipped.
func SeedTasks(db *gorm.DB, count int) error {
	var users []auth.User
	if err := db.Select("id").Find(&users).Error; err != nil {
		return err
	}

	if len(users) == 0 {
		return nil
	}

	userIDsNeedingSeed := make([]uint, 0, len(users))
	for _, user := range users {
		var existingForUser int64
		if err := db.Model(&Task{}).
			Where("user_id = ?", user.ID).
			Count(&existingForUser).Error; err != nil {
			return err
		}
		if existingForUser == 0 {
			userIDsNeedingSeed = append(userIDsNeedingSeed, user.ID)
		}
	}

	if len(userIDsNeedingSeed) == 0 {
		return nil
	}

	// Generate `count` tasks per user so every owner gets a full board.
	fakeTasks := make([]Task, 0, len(userIDsNeedingSeed)*count)
	for _, userID := range userIDsNeedingSeed {
		fakeTasks = append(fakeTasks, NewFakeTasks([]uint{userID}, count)...)
	}

	if len(fakeTasks) == 0 {
		return nil
	}

	return db.Create(&fakeTasks).Error
}
