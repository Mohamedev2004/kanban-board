package tasks

import (
	"time"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Task struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	UserID      uint           `gorm:"index;not null" json:"user_id"`
	Title       string         `gorm:"not null" json:"title"`
	Description string         `json:"description"`
	Tags        datatypes.JSON `json:"tags"`
	Status      string         `gorm:"index;default:todo" json:"status"`
	Priority    string         `gorm:"index;default:medium" json:"priority"`
	Type        string         `gorm:"index;default:ticket" json:"type"`
	DueDate     *time.Time     `json:"due_date"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`

	// Owner is a lightweight projection of the task's user. It is NOT persisted
	// (gorm:"-") and is populated only for admin responses (list/board/get) so
	// the UI can show who owns each task.
	Owner *Owner `gorm:"-" json:"owner,omitempty"`

	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// Owner is the lightweight user projection attached to tasks in admin views.
type Owner struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
}

// Status values.
const (
	StatusTodo       = "todo"
	StatusInProgress = "in_progress"
	StatusDone       = "done"
	// StatusOverdue is system-managed: it is set by the daily overdue scheduler
	// and can never be assigned manually through the API (the DTOs deliberately
	// exclude it from their oneof tags). It is a valid filter value only.
	StatusOverdue = "overdue"
)

// Priority values.
const (
	PriorityLow    = "low"
	PriorityMedium = "medium"
	PriorityHigh   = "high"
)

// Type values.
const (
	TypeBug    = "bug"
	TypeTicket = "ticket"
	TypeEpic   = "epic"
)

var ValidStatuses = map[string]struct{}{
	StatusTodo:       {},
	StatusInProgress: {},
	StatusDone:       {},
	StatusOverdue:    {},
}

var ValidPriorities = map[string]struct{}{
	PriorityLow:    {},
	PriorityMedium: {},
	PriorityHigh:   {},
}

var ValidTypes = map[string]struct{}{
	TypeBug:    {},
	TypeTicket: {},
	TypeEpic:   {},
}

func IsValidStatus(s string) bool {
	_, ok := ValidStatuses[s]
	return ok
}

func IsValidPriority(p string) bool {
	_, ok := ValidPriorities[p]
	return ok
}

func IsValidType(t string) bool {
	_, ok := ValidTypes[t]
	return ok
}
