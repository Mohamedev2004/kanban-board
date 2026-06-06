package tasks

import (
	"net/http"
	"strconv"
	"strings"

	"server/modules/auth"
	"server/shared/utils"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

// actorContext extracts the authenticated user id and whether they are an admin
// from the gin context populated by AuthMiddleware.
func actorContext(c *gin.Context) (uint, bool) {
	userID := c.MustGet("userID").(uint)

	isAdmin := false
	if rolesVal, ok := c.Get("roles"); ok {
		if roles, ok := rolesVal.([]string); ok {
			for _, r := range roles {
				if r == auth.RoleAdmin {
					isAdmin = true
					break
				}
			}
		}
	}

	return userID, isAdmin
}

func parseIDParam(c *gin.Context) (uint, bool) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponseWithCode(c, http.StatusBadRequest, "invalid_task_id", "Please provide a valid task id.")
		return 0, false
	}
	return uint(id), true
}

// GET /tasks
func (h *Handler) List(c *gin.Context) {
	actorID, isAdmin := actorContext(c)

	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		utils.ValidationErrorResponse(c, http.StatusBadRequest, "validation_failed", "Please provide a valid page number.", map[string]string{"page": "validation.invalid"})
		return
	}

	perPage, err := strconv.Atoi(c.DefaultQuery("per_page", "10"))
	if err != nil {
		utils.ValidationErrorResponse(c, http.StatusBadRequest, "validation_failed", "Please provide a valid page size.", map[string]string{"per_page": "validation.invalid"})
		return
	}
	if _, ok := AllowedPerPage[perPage]; !ok {
		utils.ValidationErrorResponse(c, http.StatusBadRequest, "validation_failed", "Please provide a valid page size.", map[string]string{"per_page": "validation.invalid"})
		return
	}

	status := strings.TrimSpace(c.Query("status"))
	if status != "" && !IsValidStatus(status) {
		utils.ValidationErrorResponse(c, http.StatusBadRequest, "validation_failed", "Please provide a valid status filter.", map[string]string{"status": "validation.invalid"})
		return
	}

	priority := strings.TrimSpace(c.Query("priority"))
	if priority != "" && !IsValidPriority(priority) {
		utils.ValidationErrorResponse(c, http.StatusBadRequest, "validation_failed", "Please provide a valid priority filter.", map[string]string{"priority": "validation.invalid"})
		return
	}

	typ := strings.TrimSpace(c.Query("type"))
	if typ != "" && !IsValidType(typ) {
		utils.ValidationErrorResponse(c, http.StatusBadRequest, "validation_failed", "Please provide a valid type filter.", map[string]string{"type": "validation.invalid"})
		return
	}

	sortBy := strings.TrimSpace(c.DefaultQuery("sort_by", "created_at"))
	if _, ok := AllowedSortBy[sortBy]; !ok {
		utils.ValidationErrorResponse(c, http.StatusBadRequest, "validation_failed", "Please provide a valid sort field.", map[string]string{"sort_by": "validation.invalid"})
		return
	}

	sortDir := strings.ToLower(strings.TrimSpace(c.DefaultQuery("sort_dir", "desc")))
	if sortDir != "asc" && sortDir != "desc" {
		utils.ValidationErrorResponse(c, http.StatusBadRequest, "validation_failed", "Please provide a valid sort direction.", map[string]string{"sort_dir": "validation.invalid"})
		return
	}

	results, err := h.service.List(c.Request.Context(), actorID, isAdmin, ListParams{
		Page:     page,
		PerPage:  perPage,
		Status:   status,
		Priority: priority,
		Type:     typ,
		Query:    strings.TrimSpace(c.Query("q")),
		SortBy:   sortBy,
		SortDir:  sortDir,
	})
	if err != nil {
		utils.ErrorResponseWithCode(c, http.StatusInternalServerError, "tasks_list_failed", "Failed to load tasks. Please try again.")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "tasks retrieved", results)
}

// GET /tasks/board
func (h *Handler) Board(c *gin.Context) {
	actorID, isAdmin := actorContext(c)

	results, err := h.service.Board(c.Request.Context(), actorID, isAdmin)
	if err != nil {
		utils.ErrorResponseWithCode(c, http.StatusInternalServerError, "tasks_list_failed", "Failed to load tasks. Please try again.")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "tasks retrieved", results)
}

// POST /tasks
func (h *Handler) Create(c *gin.Context) {
	actorID, _ := actorContext(c)

	var req CreateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorResponse(c, http.StatusBadRequest, "validation_failed", "Please correct the highlighted fields.", utils.FormatValidationErrors(err))
		return
	}

	task, err := h.service.Create(c.Request.Context(), actorID, &req)
	if err != nil {
		utils.ErrorResponseWithCode(c, http.StatusInternalServerError, "task_create_failed", "Failed to create the task. Please try again.")
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "task created", task)
}

// GET /tasks/:id
func (h *Handler) Get(c *gin.Context) {
	actorID, isAdmin := actorContext(c)

	id, ok := parseIDParam(c)
	if !ok {
		return
	}

	task, err := h.service.Get(c.Request.Context(), actorID, isAdmin, id)
	if err != nil {
		if err == ErrTaskNotFound {
			utils.ErrorResponseWithCode(c, http.StatusNotFound, "task_not_found", "Task not found.")
			return
		}
		utils.ErrorResponseWithCode(c, http.StatusInternalServerError, "tasks_list_failed", "Failed to load the task. Please try again.")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "task retrieved", task)
}

// PUT /tasks/:id
func (h *Handler) Update(c *gin.Context) {
	actorID, isAdmin := actorContext(c)

	id, ok := parseIDParam(c)
	if !ok {
		return
	}

	var req UpdateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorResponse(c, http.StatusBadRequest, "validation_failed", "Please correct the highlighted fields.", utils.FormatValidationErrors(err))
		return
	}

	task, err := h.service.Update(c.Request.Context(), actorID, isAdmin, id, &req)
	if err != nil {
		if err == ErrTaskNotFound {
			utils.ErrorResponseWithCode(c, http.StatusNotFound, "task_not_found", "Task not found.")
			return
		}
		if err == ErrTaskLocked {
			utils.ErrorResponseWithCode(c, http.StatusConflict, "task_overdue_locked", "Overdue tasks are locked and cannot be modified.")
			return
		}
		utils.ErrorResponseWithCode(c, http.StatusInternalServerError, "task_update_failed", "Failed to update the task. Please try again.")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "task updated", task)
}

// PATCH /tasks/:id/status
func (h *Handler) UpdateStatus(c *gin.Context) {
	actorID, isAdmin := actorContext(c)

	id, ok := parseIDParam(c)
	if !ok {
		return
	}

	var req UpdateStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorResponse(c, http.StatusBadRequest, "validation_failed", "Please provide a valid status.", utils.FormatValidationErrors(err))
		return
	}

	if !IsValidStatus(req.Status) {
		utils.ValidationErrorResponse(c, http.StatusBadRequest, "invalid_task_status", "Please provide a valid status.", map[string]string{"status": "validation.invalid"})
		return
	}

	task, err := h.service.UpdateStatus(c.Request.Context(), actorID, isAdmin, id, req.Status)
	if err != nil {
		if err == ErrTaskNotFound {
			utils.ErrorResponseWithCode(c, http.StatusNotFound, "task_not_found", "Task not found.")
			return
		}
		if err == ErrTaskLocked {
			utils.ErrorResponseWithCode(c, http.StatusConflict, "task_overdue_locked", "Overdue tasks are locked and cannot be modified.")
			return
		}
		utils.ErrorResponseWithCode(c, http.StatusInternalServerError, "task_update_failed", "Failed to update the task status. Please try again.")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "task status updated", task)
}

// DELETE /tasks/:id
func (h *Handler) Delete(c *gin.Context) {
	actorID, isAdmin := actorContext(c)

	id, ok := parseIDParam(c)
	if !ok {
		return
	}

	if err := h.service.Delete(c.Request.Context(), actorID, isAdmin, id); err != nil {
		if err == ErrTaskNotFound {
			utils.ErrorResponseWithCode(c, http.StatusNotFound, "task_not_found", "Task not found.")
			return
		}
		if err == ErrTaskLocked {
			utils.ErrorResponseWithCode(c, http.StatusConflict, "task_overdue_locked", "Overdue tasks are locked and cannot be modified.")
			return
		}
		utils.ErrorResponseWithCode(c, http.StatusInternalServerError, "task_delete_failed", "Failed to delete the task. Please try again.")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "task deleted", nil)
}

// GET /tasks/stats
func (h *Handler) Stats(c *gin.Context) {
	actorID, isAdmin := actorContext(c)

	stats, err := h.service.Stats(c.Request.Context(), actorID, isAdmin)
	if err != nil {
		utils.ErrorResponseWithCode(c, http.StatusInternalServerError, "tasks_stats_failed", "Failed to load task stats. Please try again.")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "task stats", stats)
}
