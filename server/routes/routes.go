package routes

import (
	"server/config"
	"server/modules/auth"
	"server/modules/logs"
	"server/modules/notifications"
	"server/modules/notifications/delivery"
	"server/shared/database"
	"server/shared/middleware"

	"github.com/ThreeDotsLabs/watermill/message"
	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
	"gorm.io/gorm"
)

func Register(r *gin.Engine, db *gorm.DB, publisher message.Publisher) {

	// ==========================================
	// GLOBAL MIDDLEWARE
	// ==========================================
	r.Use(middleware.CORS(config.Cfg.Server.AllowedOrigins))
	r.Use(middleware.RateLimiterMiddleware(rate.Limit(5), 10, publisher))
	r.Use(middleware.RequestIDMiddleware())
	r.Use(middleware.RequestTimingMiddleware())

	// ==========================================
	// API ROUTES
	// ==========================================
	api := r.Group("/api")
	v1 := api.Group("/v1")

	// Auth (register/login/refresh/logout/me/profile/password/forgot/reset)
	auth.RegisterRoutes(v1, db, publisher)

	// Notifications (HTTP only) — every user sees only their own notifications.
	notifRepo := notifications.NewRepository(db)
	userResolver := auth.NewUserResolver(db)
	dispatchers := []delivery.Dispatcher{
		delivery.NewInAppDispatcher(db),
		delivery.NewEmailDispatcher(),
	}
	notifService := notifications.NewService(notifRepo, userResolver, dispatchers, publisher)
	notifHandler := notifications.NewHandler(notifService)
	notifications.RegisterRoutes(v1, db, notifHandler)

	// Logs (HTTP only) — admin-only system audit trail. Reads from LogsDB,
	// auth is validated against MainDB.
	logRepo := logs.NewRepository(database.LogsDB)
	logService := logs.NewService(logRepo)
	logHandler := logs.NewHandler(logService)
	logs.RegisterRoutes(v1, db, logHandler)
}
