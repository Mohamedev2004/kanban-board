package logs

import (
	"kanban/shared/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(rg *gin.RouterGroup, mainDB *gorm.DB, h *Handler) {
	logs := rg.Group("/logs")
	logs.Use(middleware.AuthMiddleware(mainDB), middleware.RequireRole("admin"))
	{
		logs.GET("", h.List)
		logs.GET("/chart", h.Chart)
		logs.GET("/export", h.Export)
	}
}
