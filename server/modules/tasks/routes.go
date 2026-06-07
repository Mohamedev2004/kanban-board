package tasks

import (
	"kanban/shared/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(rg *gin.RouterGroup, db *gorm.DB, h *Handler) {
	tasks := rg.Group("/tasks")
	tasks.Use(middleware.AuthMiddleware(db))
	{
		tasks.GET("", h.List)
		tasks.GET("/board", h.Board)
		tasks.GET("/stats", h.Stats)
		tasks.POST("", h.Create)
		tasks.GET("/:id", h.Get)
		tasks.PUT("/:id", h.Update)
		tasks.PATCH("/:id/status", h.UpdateStatus)
		tasks.DELETE("/:id", h.Delete)
	}
}
