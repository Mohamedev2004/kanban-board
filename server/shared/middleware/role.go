package middleware

import (
	"net/http"

	"server/shared/utils"

	"github.com/gin-gonic/gin"
)

// RequireRole allows only specific roles to access a route
// Usage: RequireRole("admin") or RequireRole("admin", "user")
func RequireRole(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		rolesVal, exists := c.Get("roles")
		if !exists {
			utils.ErrorResponse(c, http.StatusUnauthorized, "unauthorized")
			c.Abort()
			return
		}

		userRoles, ok := rolesVal.([]string)
		if !ok {
			utils.ErrorResponse(c, http.StatusUnauthorized, "unauthorized")
			c.Abort()
			return
		}

		allowedSet := make(map[string]struct{}, len(allowedRoles))
		for _, r := range allowedRoles {
			allowedSet[r] = struct{}{}
		}

		for _, r := range userRoles {
			if _, ok := allowedSet[r]; ok {
				c.Next()
				return
			}
		}

		utils.ErrorResponse(c, http.StatusForbidden, "you don't have permission to access this resource")
		c.Abort()
	}
}
