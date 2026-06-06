package tasks

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math"
	"net/http"
	"time"

	"server/shared/types"

	"github.com/ThreeDotsLabs/watermill"
	"github.com/ThreeDotsLabs/watermill/message"
	"gorm.io/datatypes"
)

// ErrTaskNotFound is returned when a task does not exist or the actor is not
// allowed to see it (the two cases are deliberately indistinguishable to avoid
// leaking the existence of other users' tasks).
var ErrTaskNotFound = errors.New("task not found")

// ErrTaskLocked is returned when an actor (including admins) tries to modify or
// delete a task that has been flagged overdue by the system. Overdue tasks are
// immutable until the system reverts them.
var ErrTaskLocked = errors.New("task is locked")

type Service interface {
	List(ctx context.Context, actorID uint, isAdmin bool, params ListParams) (*ListResponse, error)
	Board(ctx context.Context, actorID uint, isAdmin bool) (*BoardResponse, error)
	Create(ctx context.Context, actorID uint, req *CreateTaskRequest) (*Task, error)
	Get(ctx context.Context, actorID uint, isAdmin bool, id uint) (*Task, error)
	Update(ctx context.Context, actorID uint, isAdmin bool, id uint, req *UpdateTaskRequest) (*Task, error)
	UpdateStatus(ctx context.Context, actorID uint, isAdmin bool, id uint, status string) (*Task, error)
	Delete(ctx context.Context, actorID uint, isAdmin bool, id uint) error
	MarkOverdue(ctx context.Context) (int64, error)
	Stats(ctx context.Context, actorID uint, isAdmin bool) (*StatsResponse, error)
}

type service struct {
	repo      Repository
	publisher message.Publisher
}

func NewService(repo Repository, publisher message.Publisher) Service {
	return &service{repo: repo, publisher: publisher}
}

// scopeFor returns the owner scope to apply to read queries: nil for admins
// (no scope — they see everything) and the actor's ID for regular users.
func scopeFor(actorID uint, isAdmin bool) *uint {
	if isAdmin {
		return nil
	}
	return &actorID
}

func (s *service) List(ctx context.Context, actorID uint, isAdmin bool, params ListParams) (*ListResponse, error) {
	scope := scopeFor(actorID, isAdmin)

	items, err := s.repo.List(ctx, params, scope)
	if err != nil {
		return nil, err
	}
	if isAdmin {
		s.attachOwners(ctx, items)
	}

	total, err := s.repo.Count(ctx, params, scope)
	if err != nil {
		return nil, err
	}

	totalPages := int(total) / params.PerPage
	if int(total)%params.PerPage != 0 {
		totalPages++
	}
	if totalPages == 0 {
		totalPages = 1
	}

	return &ListResponse{
		Items: items,
		Pagination: PaginationMeta{
			Page:       params.Page,
			PerPage:    params.PerPage,
			Total:      total,
			TotalPages: totalPages,
			HasNext:    params.Page < totalPages,
			HasPrev:    params.Page > 1,
		},
	}, nil
}

func (s *service) Board(ctx context.Context, actorID uint, isAdmin bool) (*BoardResponse, error) {
	items, err := s.repo.Board(ctx, scopeFor(actorID, isAdmin))
	if err != nil {
		return nil, err
	}
	if isAdmin {
		s.attachOwners(ctx, items)
	}
	return &BoardResponse{Items: items}, nil
}

func (s *service) Create(ctx context.Context, actorID uint, req *CreateTaskRequest) (*Task, error) {
	tagsJSON, err := marshalTags(req.Tags)
	if err != nil {
		s.publishError(ctx, types.ActionFailed, "Task", err)
		return nil, err
	}

	status := req.Status
	if status == "" {
		status = StatusTodo
	}
	priority := req.Priority
	if priority == "" {
		priority = PriorityMedium
	}
	typ := req.Type
	if typ == "" {
		typ = TypeTicket
	}

	task := &Task{
		UserID:      actorID,
		Title:       req.Title,
		Description: req.Description,
		Tags:        tagsJSON,
		Status:      status,
		Priority:    priority,
		Type:        typ,
		DueDate:     req.DueDate,
	}

	if err := s.repo.Create(ctx, task); err != nil {
		s.publishError(ctx, types.ActionFailed, "Task", err)
		return nil, err
	}

	s.publishEvent(ctx, types.LevelInfo, types.ActionCreated, "Task", fmt.Sprint(task.ID), fmt.Sprint(actorID), http.StatusCreated, map[string]any{
		"title":    task.Title,
		"status":   task.Status,
		"type":     task.Type,
		"priority": task.Priority,
	}, "system.events.v1.tasks.created")

	return task, nil
}

func (s *service) Get(ctx context.Context, actorID uint, isAdmin bool, id uint) (*Task, error) {
	task, err := s.loadVisible(ctx, actorID, isAdmin, id)
	if err != nil {
		return nil, err
	}
	if isAdmin {
		if owners, err := s.repo.OwnersByIDs(ctx, []uint{task.UserID}); err == nil {
			if owner, ok := owners[task.UserID]; ok {
				task.Owner = &owner
			}
		}
	}
	return task, nil
}

func (s *service) Update(ctx context.Context, actorID uint, isAdmin bool, id uint, req *UpdateTaskRequest) (*Task, error) {
	task, err := s.loadVisible(ctx, actorID, isAdmin, id)
	if err != nil {
		return nil, err
	}
	if task.Status == StatusOverdue {
		return nil, ErrTaskLocked
	}

	tagsJSON, err := marshalTags(req.Tags)
	if err != nil {
		s.publishError(ctx, types.ActionFailed, "Task", err)
		return nil, err
	}

	task.Title = req.Title
	task.Description = req.Description
	task.Tags = tagsJSON
	if req.Status != "" {
		task.Status = req.Status
	}
	if req.Priority != "" {
		task.Priority = req.Priority
	}
	if req.Type != "" {
		task.Type = req.Type
	}
	task.DueDate = req.DueDate

	if err := s.repo.Update(ctx, task); err != nil {
		s.publishError(ctx, types.ActionFailed, "Task", err)
		return nil, err
	}

	s.publishEvent(ctx, types.LevelInfo, types.ActionUpdated, "Task", fmt.Sprint(task.ID), fmt.Sprint(actorID), http.StatusOK, map[string]any{
		"title":    task.Title,
		"status":   task.Status,
		"type":     task.Type,
		"priority": task.Priority,
	}, "system.events.v1.tasks.updated")

	return task, nil
}

func (s *service) UpdateStatus(ctx context.Context, actorID uint, isAdmin bool, id uint, status string) (*Task, error) {
	task, err := s.loadVisible(ctx, actorID, isAdmin, id)
	if err != nil {
		return nil, err
	}
	if task.Status == StatusOverdue {
		return nil, ErrTaskLocked
	}

	oldStatus := task.Status

	if err := s.repo.UpdateStatus(ctx, task.ID, status); err != nil {
		s.publishError(ctx, types.ActionFailed, "Task", err)
		return nil, err
	}
	task.Status = status

	s.publishEvent(ctx, types.LevelInfo, types.ActionUpdated, "Task", fmt.Sprint(task.ID), fmt.Sprint(actorID), http.StatusOK, map[string]any{
		"from": oldStatus,
		"to":   status,
	}, "system.events.v1.tasks.status_changed")

	return task, nil
}

func (s *service) Delete(ctx context.Context, actorID uint, isAdmin bool, id uint) error {
	task, err := s.loadVisible(ctx, actorID, isAdmin, id)
	if err != nil {
		return err
	}
	if task.Status == StatusOverdue {
		return ErrTaskLocked
	}

	if err := s.repo.Delete(ctx, task.ID); err != nil {
		s.publishError(ctx, types.ActionFailed, "Task", err)
		return err
	}

	s.publishEvent(ctx, types.LevelInfo, types.ActionDeleted, "Task", fmt.Sprint(task.ID), fmt.Sprint(actorID), http.StatusOK, map[string]any{
		"title": task.Title,
	}, "system.events.v1.tasks.deleted")

	return nil
}

// MarkOverdue is invoked by the daily scheduler to flag every past-due task as
// overdue. It is system-driven (no actor) and emits a single audit event when
// at least one task transitions.
func (s *service) MarkOverdue(ctx context.Context) (int64, error) {
	affected, err := s.repo.MarkOverdue(ctx)
	if err != nil {
		s.publishError(ctx, types.ActionUpdated, "Task", err)
		return 0, err
	}

	if affected > 0 {
		s.publishEvent(ctx, types.LevelWarn, types.ActionUpdated, "Task", "system", "system", http.StatusOK, map[string]any{
			"marked_overdue": affected,
		}, "system.events.v1.tasks.overdue")
	}

	return affected, nil
}

// Stats aggregates dashboard counters for the actor. Regular users see only
// their own tasks; admins see everything plus the per-user breakdown (ByUser).
func (s *service) Stats(ctx context.Context, actorID uint, isAdmin bool) (*StatsResponse, error) {
	scope := scopeFor(actorID, isAdmin)

	total, err := s.repo.CountTotal(ctx, scope)
	if err != nil {
		return nil, err
	}

	byStatusRaw, err := s.repo.CountByStatus(ctx, scope)
	if err != nil {
		return nil, err
	}
	byPriorityRaw, err := s.repo.CountByPriority(ctx, scope)
	if err != nil {
		return nil, err
	}
	byTypeRaw, err := s.repo.CountByType(ctx, scope)
	if err != nil {
		return nil, err
	}

	overdue, err := s.repo.CountOverdue(ctx, scope)
	if err != nil {
		return nil, err
	}
	dueSoon, err := s.repo.CountDueSoon(ctx, scope)
	if err != nil {
		return nil, err
	}

	seriesRaw, err := s.repo.CreatedSeries(ctx, scope, 30)
	if err != nil {
		return nil, err
	}

	byStatus := map[string]int{
		StatusTodo:       byStatusRaw[StatusTodo],
		StatusInProgress: byStatusRaw[StatusInProgress],
		StatusDone:       byStatusRaw[StatusDone],
		StatusOverdue:    byStatusRaw[StatusOverdue],
	}
	byPriority := map[string]int{
		PriorityLow:    byPriorityRaw[PriorityLow],
		PriorityMedium: byPriorityRaw[PriorityMedium],
		PriorityHigh:   byPriorityRaw[PriorityHigh],
	}
	byType := map[string]int{
		TypeBug:    byTypeRaw[TypeBug],
		TypeTicket: byTypeRaw[TypeTicket],
		TypeEpic:   byTypeRaw[TypeEpic],
	}

	completed := byStatus[StatusDone]
	var completionRate float64
	if total > 0 {
		completionRate = math.Round(float64(completed)/float64(total)*1000) / 10
	}

	// Build the last 30 calendar days oldest->newest, filling absent days with 0.
	const seriesDays = 30
	createdSeries := make([]SeriesPoint, 0, seriesDays)
	today := time.Now()
	for i := seriesDays - 1; i >= 0; i-- {
		day := today.AddDate(0, 0, -i).Format("2006-01-02")
		createdSeries = append(createdSeries, SeriesPoint{
			Date:  day,
			Count: seriesRaw[day],
		})
	}

	resp := &StatsResponse{
		Total:          total,
		ByStatus:       byStatus,
		ByPriority:     byPriority,
		ByType:         byType,
		Overdue:        overdue,
		DueSoon:        dueSoon,
		Completed:      completed,
		CompletionRate: completionRate,
		CreatedSeries:  createdSeries,
	}

	if isAdmin {
		byUser, err := s.repo.ByUser(ctx)
		if err != nil {
			return nil, err
		}
		resp.ByUser = byUser
	}

	return resp, nil
}

// loadVisible fetches a task and enforces the visibility rule: a non-admin
// actor may only act on tasks they own. Missing tasks and forbidden tasks both
// resolve to ErrTaskNotFound to avoid leaking existence.
func (s *service) loadVisible(ctx context.Context, actorID uint, isAdmin bool, id uint) (*Task, error) {
	task, err := s.repo.FindByID(ctx, id)
	if err != nil {
		s.publishError(ctx, types.ActionFailed, "Task", err)
		return nil, err
	}
	if task == nil {
		return nil, ErrTaskNotFound
	}
	if !isAdmin && task.UserID != actorID {
		return nil, ErrTaskNotFound
	}
	return task, nil
}

// attachOwners populates the Owner field on each task. Used in admin views so
// the UI can show who owns each task. Failures are logged, not fatal.
func (s *service) attachOwners(ctx context.Context, tasks []Task) {
	if len(tasks) == 0 {
		return
	}
	idSet := make(map[uint]struct{}, len(tasks))
	for i := range tasks {
		idSet[tasks[i].UserID] = struct{}{}
	}
	ids := make([]uint, 0, len(idSet))
	for id := range idSet {
		ids = append(ids, id)
	}
	owners, err := s.repo.OwnersByIDs(ctx, ids)
	if err != nil {
		log.Printf("tasks: failed to resolve owners: %v", err)
		return
	}
	for i := range tasks {
		if owner, ok := owners[tasks[i].UserID]; ok {
			o := owner
			tasks[i].Owner = &o
		}
	}
}

func marshalTags(tags []string) (datatypes.JSON, error) {
	if tags == nil {
		tags = []string{}
	}
	b, err := json.Marshal(tags)
	if err != nil {
		return nil, err
	}
	return datatypes.JSON(b), nil
}

// ==========================================
// INTERNAL HELPERS FOR PUBLISHING EVENTS
// ==========================================

func (s *service) publishError(ctx context.Context, action types.EventAction, entity string, err error) {
	if err == nil {
		return
	}
	payload := map[string]string{
		"error_message": err.Error(),
	}
	s.publishEvent(ctx, types.LevelError, action, entity, "unknown", "system", http.StatusInternalServerError, payload, "system.events.v1.tasks.system_error")
}

func (s *service) publishEvent(
	ctx context.Context,
	level types.LogLevel,
	action types.EventAction,
	entity string,
	entityID string,
	actorID string,
	statusCode int,
	payload any,
	topic string,
) {
	if s.publisher == nil {
		return
	}

	reqID, _ := ctx.Value("X-Request-ID").(string)
	start, _ := ctx.Value("startTime").(time.Time)

	var duration float64 = 0
	if !start.IsZero() {
		duration = math.Round(time.Since(start).Seconds()*100000) / 100
	}

	event := types.AuditEvent{
		RequestID:  reqID,
		Level:      level,
		Entity:     entity,
		EntityID:   entityID,
		ActorID:    actorID,
		StatusCode: statusCode,
		Action:     action,
		Payload:    payload,
		Timestamp:  time.Now(),
		DurationMs: duration,
	}

	payloadBytes, err := json.Marshal(event)
	if err != nil {
		log.Printf("Failed to marshal event payload: %v", err)
		return
	}

	specificMsg := message.NewMessage(watermill.NewUUID(), payloadBytes)
	if err := s.publisher.Publish(topic, specificMsg); err != nil {
		log.Printf("Failed to publish event to topic %s: %v", topic, err)
	}

	logMsg := message.NewMessage(watermill.NewUUID(), payloadBytes)
	if err := s.publisher.Publish("system.audit_logs", logMsg); err != nil {
		log.Printf("Failed to publish to audit logs: %v", err)
	}
}
