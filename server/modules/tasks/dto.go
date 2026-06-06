package tasks

import "time"

var AllowedPerPage = map[int]struct{}{
	10: {},
	20: {},
	30: {},
	40: {},
	50: {},
}

// AllowedSortBy whitelists the columns a client may sort by.
var AllowedSortBy = map[string]struct{}{
	"created_at": {},
	"due_date":   {},
	"title":      {},
	"status":     {},
	"priority":   {},
	"type":       {},
	"id":         {},
}

type CreateTaskRequest struct {
	Title       string     `json:"title" binding:"required,min=1,max=200"`
	Description string     `json:"description" binding:"omitempty"`
	Tags        []string   `json:"tags" binding:"omitempty"`
	Status      string     `json:"status" binding:"omitempty,oneof=todo in_progress done"`
	Priority    string     `json:"priority" binding:"omitempty,oneof=low medium high"`
	Type        string     `json:"type" binding:"omitempty,oneof=bug ticket epic"`
	DueDate     *time.Time `json:"due_date" binding:"omitempty"`
}

type UpdateTaskRequest struct {
	Title       string     `json:"title" binding:"required,min=1,max=200"`
	Description string     `json:"description" binding:"omitempty"`
	Tags        []string   `json:"tags" binding:"omitempty"`
	Status      string     `json:"status" binding:"omitempty,oneof=todo in_progress done"`
	Priority    string     `json:"priority" binding:"omitempty,oneof=low medium high"`
	Type        string     `json:"type" binding:"omitempty,oneof=bug ticket epic"`
	DueDate     *time.Time `json:"due_date" binding:"omitempty"`
}

type UpdateStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=todo in_progress done"`
}

type ListParams struct {
	Page     int
	PerPage  int
	Status   string
	Priority string
	Type     string
	Query    string
	SortBy   string
	SortDir  string
}

type PaginationMeta struct {
	Page       int   `json:"page"`
	PerPage    int   `json:"per_page"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
	HasNext    bool  `json:"has_next"`
	HasPrev    bool  `json:"has_prev"`
}

type ListResponse struct {
	Items      []Task         `json:"items"`
	Pagination PaginationMeta `json:"pagination"`
}

type BoardResponse struct {
	Items []Task `json:"items"`
}

type SeriesPoint struct {
	Date  string `json:"date"`
	Count int    `json:"count"`
}

type UserStat struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	Total    int    `json:"total"`
	Done     int    `json:"done"`
	Overdue  int    `json:"overdue"`
}

type StatsResponse struct {
	Total          int            `json:"total"`
	ByStatus       map[string]int `json:"by_status"`   // keys: todo,in_progress,done,overdue
	ByPriority     map[string]int `json:"by_priority"` // low,medium,high
	ByType         map[string]int `json:"by_type"`     // bug,ticket,epic
	Overdue        int            `json:"overdue"`
	DueSoon        int            `json:"due_soon"`          // due within next 7 days, status not done/overdue
	Completed      int            `json:"completed"`         // done count
	CompletionRate float64        `json:"completion_rate"`   // done/total*100, rounded 1 dp, 0 if total==0
	CreatedSeries  []SeriesPoint  `json:"created_series"`    // last 30 calendar days, one point per day incl. zero days, oldest first, date "YYYY-MM-DD"
	ByUser         []UserStat     `json:"by_user,omitempty"` // ADMIN ONLY; omitted for regular users
}
