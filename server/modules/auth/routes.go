package auth

import (
	"server/shared/middleware"

	"github.com/ThreeDotsLabs/watermill/message"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(router *gin.RouterGroup, db *gorm.DB, publisher message.Publisher) {
	handler := NewHandler(db, publisher)

	auth := router.Group("/auth")
	{
		// Public
		auth.POST("/register", handler.Register)
		auth.POST("/login", handler.Login)
		auth.POST("/refresh", handler.Refresh)
		auth.POST("/forgot-password", handler.ForgotPassword)
		auth.POST("/reset-password", handler.ResetPassword)

		// Authenticated (any role)
		auth.POST("/logout", middleware.AuthMiddleware(db), handler.Logout)
		auth.GET("/me", middleware.AuthMiddleware(db), handler.Me)
		auth.PUT("/profile", middleware.AuthMiddleware(db), handler.UpdateProfile)
		auth.PUT("/password", middleware.AuthMiddleware(db), handler.UpdatePassword)
	}
}
