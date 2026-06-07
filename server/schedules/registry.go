package schedules

import (
	"context"
	"time"

	"kanban/modules/auth"
	"kanban/modules/notifications"
	"kanban/modules/tasks"

	"github.com/ThreeDotsLabs/watermill/message"
	"gorm.io/gorm"
)

// StartAll initializes all background tasks for the application
func StartAll(db *gorm.DB, publisher message.Publisher) {
	authRepo := auth.NewRepository(db)
	notifRepo := notifications.NewRepository(db)

	taskRepo := tasks.NewRepository(db)
	taskService := tasks.NewService(taskRepo, publisher)

	// Register your individual tasks here
	Run("Auth Token Cleanup", 12*time.Hour, authRepo.DeleteExpiredTokens)
	Run("Notification Cleanup", 24*time.Hour, notifRepo.DeleteOldReadNotifications)
	Run("Task Overdue Check", 24*time.Hour, func() error {
		_, err := taskService.MarkOverdue(context.Background())
		return err
	})

	// Future tasks:
	// Run("Daily Analytics", 12*time.Hour, analytics.GenerateReport)
}
