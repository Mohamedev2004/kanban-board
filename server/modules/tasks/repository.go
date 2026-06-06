package tasks

import (
	"context"
	"strings"
	"time"

	"gorm.io/gorm"
)

type Repository interface {
	Create(ctx context.Context, t *Task) error
	FindByID(ctx context.Context, id uint) (*Task, error)
	List(ctx context.Context, params ListParams, scopeUserID *uint) ([]Task, error)
	Count(ctx context.Context, params ListParams, scopeUserID *uint) (int64, error)
	Board(ctx context.Context, scopeUserID *uint) ([]Task, error)
	Update(ctx context.Context, t *Task) error
	UpdateStatus(ctx context.Context, id uint, status string) error
	Delete(ctx context.Context, id uint) error
	MarkOverdue(ctx context.Context) (int64, error)
	OwnersByIDs(ctx context.Context, ids []uint) (map[uint]Owner, error)

	CountByStatus(ctx context.Context, scopeUserID *uint) (map[string]int, error)
	CountByPriority(ctx context.Context, scopeUserID *uint) (map[string]int, error)
	CountByType(ctx context.Context, scopeUserID *uint) (map[string]int, error)
	CountOverdue(ctx context.Context, scopeUserID *uint) (int, error)
	CountDueSoon(ctx context.Context, scopeUserID *uint) (int, error)
	CountTotal(ctx context.Context, scopeUserID *uint) (int, error)
	CreatedSeries(ctx context.Context, scopeUserID *uint, days int) (map[string]int, error)
	ByUser(ctx context.Context) ([]UserStat, error)
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) Create(ctx context.Context, t *Task) error {
	return r.db.WithContext(ctx).Create(t).Error
}

func (r *repository) FindByID(ctx context.Context, id uint) (*Task, error) {
	var t Task
	err := r.db.WithContext(ctx).First(&t, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &t, nil
}

func (r *repository) baseQuery(ctx context.Context, params ListParams, scopeUserID *uint) *gorm.DB {
	q := r.db.WithContext(ctx).Model(&Task{})

	if scopeUserID != nil {
		q = q.Where("user_id = ?", *scopeUserID)
	}
	if params.Status != "" {
		q = q.Where("status = ?", params.Status)
	}
	if params.Priority != "" {
		q = q.Where("priority = ?", params.Priority)
	}
	if params.Type != "" {
		q = q.Where("type = ?", params.Type)
	}
	if params.Query != "" {
		like := "%" + strings.ToLower(params.Query) + "%"
		q = q.Where("LOWER(title) LIKE ?", like)
	}

	return q
}

func (r *repository) List(ctx context.Context, params ListParams, scopeUserID *uint) ([]Task, error) {
	var items []Task
	offset := (params.Page - 1) * params.PerPage

	sortBy := params.SortBy
	if _, ok := AllowedSortBy[sortBy]; !ok {
		sortBy = "created_at"
	}
	sortDir := strings.ToLower(params.SortDir)
	if sortDir != "asc" && sortDir != "desc" {
		sortDir = "desc"
	}

	q := r.baseQuery(ctx, params, scopeUserID).
		Order(sortBy + " " + sortDir).
		Limit(params.PerPage).
		Offset(offset)

	if err := q.Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}

func (r *repository) Count(ctx context.Context, params ListParams, scopeUserID *uint) (int64, error) {
	var total int64
	if err := r.baseQuery(ctx, params, scopeUserID).Count(&total).Error; err != nil {
		return 0, err
	}
	return total, nil
}

func (r *repository) Board(ctx context.Context, scopeUserID *uint) ([]Task, error) {
	var items []Task
	q := r.db.WithContext(ctx).Model(&Task{})
	if scopeUserID != nil {
		q = q.Where("user_id = ?", *scopeUserID)
	}
	if err := q.Order("created_at DESC").Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}

func (r *repository) Update(ctx context.Context, t *Task) error {
	return r.db.WithContext(ctx).
		Model(&Task{}).
		Where("id = ?", t.ID).
		Updates(map[string]any{
			"title":       t.Title,
			"description": t.Description,
			"tags":        t.Tags,
			"status":      t.Status,
			"priority":    t.Priority,
			"type":        t.Type,
			"due_date":    t.DueDate,
		}).Error
}

func (r *repository) UpdateStatus(ctx context.Context, id uint, status string) error {
	return r.db.WithContext(ctx).
		Model(&Task{}).
		Where("id = ?", id).
		Updates(map[string]any{
			"status":     status,
			"updated_at": time.Now(),
		}).Error
}

func (r *repository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).
		Where("id = ?", id).
		Delete(&Task{}).Error
}

// OwnersByIDs resolves a lightweight owner projection for the given user ids,
// keyed by user id. Used to attach task owners in admin views.
func (r *repository) OwnersByIDs(ctx context.Context, ids []uint) (map[uint]Owner, error) {
	out := make(map[uint]Owner)
	if len(ids) == 0 {
		return out, nil
	}
	var owners []Owner
	if err := r.db.WithContext(ctx).
		Table("users").
		Select("id, username, email").
		Where("id IN ?", ids).
		Scan(&owners).Error; err != nil {
		return nil, err
	}
	for _, o := range owners {
		out[o.ID] = o
	}
	return out, nil
}

// MarkOverdue bulk-flips every past-due task that is not already done or overdue
// into the overdue status. It returns the number of rows affected.
func (r *repository) MarkOverdue(ctx context.Context) (int64, error) {
	res := r.db.WithContext(ctx).
		Model(&Task{}).
		Where("due_date IS NOT NULL AND due_date < NOW() AND status NOT IN (?)", []string{StatusDone, StatusOverdue}).
		Updates(map[string]any{
			"status":     StatusOverdue,
			"updated_at": time.Now(),
		})
	return res.RowsAffected, res.Error
}

// statsScope returns a Task-scoped query, optionally restricted to one owner.
func (r *repository) statsScope(ctx context.Context, scopeUserID *uint) *gorm.DB {
	q := r.db.WithContext(ctx).Model(&Task{})
	if scopeUserID != nil {
		q = q.Where("user_id = ?", *scopeUserID)
	}
	return q
}

// groupCount runs a `SELECT <column>, COUNT(*) ... GROUP BY <column>` and
// returns the result keyed by the column value.
func (r *repository) groupCount(ctx context.Context, scopeUserID *uint, column string) (map[string]int, error) {
	type row struct {
		Key   string
		Count int
	}
	var rows []row
	if err := r.statsScope(ctx, scopeUserID).
		Select(column + " AS key, COUNT(*) AS count").
		Group(column).
		Scan(&rows).Error; err != nil {
		return nil, err
	}
	out := make(map[string]int, len(rows))
	for _, row := range rows {
		out[row.Key] = row.Count
	}
	return out, nil
}

func (r *repository) CountByStatus(ctx context.Context, scopeUserID *uint) (map[string]int, error) {
	return r.groupCount(ctx, scopeUserID, "status")
}

func (r *repository) CountByPriority(ctx context.Context, scopeUserID *uint) (map[string]int, error) {
	return r.groupCount(ctx, scopeUserID, "priority")
}

func (r *repository) CountByType(ctx context.Context, scopeUserID *uint) (map[string]int, error) {
	return r.groupCount(ctx, scopeUserID, "type")
}

func (r *repository) CountOverdue(ctx context.Context, scopeUserID *uint) (int, error) {
	var total int64
	if err := r.statsScope(ctx, scopeUserID).
		Where("status = ?", StatusOverdue).
		Count(&total).Error; err != nil {
		return 0, err
	}
	return int(total), nil
}

func (r *repository) CountDueSoon(ctx context.Context, scopeUserID *uint) (int, error) {
	var total int64
	if err := r.statsScope(ctx, scopeUserID).
		Where("due_date IS NOT NULL AND due_date >= NOW() AND due_date <= NOW() + INTERVAL '7 days' AND status NOT IN (?)", []string{StatusDone, StatusOverdue}).
		Count(&total).Error; err != nil {
		return 0, err
	}
	return int(total), nil
}

func (r *repository) CountTotal(ctx context.Context, scopeUserID *uint) (int, error) {
	var total int64
	if err := r.statsScope(ctx, scopeUserID).Count(&total).Error; err != nil {
		return 0, err
	}
	return int(total), nil
}

// CreatedSeries returns per-day creation counts for the last `days` days, keyed
// by "YYYY-MM-DD". Days with no tasks are absent (the service fills them with 0).
func (r *repository) CreatedSeries(ctx context.Context, scopeUserID *uint, days int) (map[string]int, error) {
	type row struct {
		D     string
		Count int
	}
	var rows []row
	if err := r.statsScope(ctx, scopeUserID).
		Select("TO_CHAR(created_at, 'YYYY-MM-DD') AS d, COUNT(*) AS count").
		Where("created_at >= NOW() - (? * INTERVAL '1 day')", days).
		Group("d").
		Scan(&rows).Error; err != nil {
		return nil, err
	}
	out := make(map[string]int, len(rows))
	for _, row := range rows {
		out[row.D] = row.Count
	}
	return out, nil
}

// ByUser aggregates task totals per owner across ALL users (admin-only) and
// joins the users table for the username. Ordered by total desc, top 10.
func (r *repository) ByUser(ctx context.Context) ([]UserStat, error) {
	var stats []UserStat
	if err := r.db.WithContext(ctx).
		Model(&Task{}).
		Select("tasks.user_id AS user_id, u.username AS username, "+
			"COUNT(*) AS total, "+
			"COUNT(*) FILTER (WHERE tasks.status = ?) AS done, "+
			"COUNT(*) FILTER (WHERE tasks.status = ?) AS overdue", StatusDone, StatusOverdue).
		Joins("JOIN users u ON u.id = tasks.user_id").
		Group("tasks.user_id, u.username").
		Order("total DESC").
		Limit(10).
		Scan(&stats).Error; err != nil {
		return nil, err
	}
	return stats, nil
}
