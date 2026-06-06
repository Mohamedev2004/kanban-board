package tasks

import (
	"encoding/json"
	"time"

	"github.com/brianvoe/gofakeit/v7"
	"gorm.io/datatypes"
)

var fakeStatuses = []string{StatusTodo, StatusInProgress, StatusDone}

var fakePriorities = []string{PriorityLow, PriorityMedium, PriorityHigh}

var fakeTypes = []string{TypeBug, TypeTicket, TypeEpic}

var fakeTagPool = []string{
	"frontend",
	"backend",
	"urgent",
	"design",
	"infra",
	"docs",
	"testing",
	"refactor",
}

func randomTags() []string {
	count := gofakeit.Number(2, 3)
	seen := make(map[string]struct{}, count)
	tags := make([]string, 0, count)
	for len(tags) < count {
		tag := gofakeit.RandomString(fakeTagPool)
		if _, ok := seen[tag]; ok {
			continue
		}
		seen[tag] = struct{}{}
		tags = append(tags, tag)
	}
	return tags
}

func NewFakeTask(userID uint) Task {
	createdAt := gofakeit.DateRange(time.Now().AddDate(0, 0, -30), time.Now())
	dueDate := gofakeit.DateRange(time.Now().AddDate(0, 0, -30), time.Now().AddDate(0, 0, 30))

	tagsBytes, _ := json.Marshal(randomTags())

	return Task{
		UserID:      userID,
		Title:       gofakeit.Sentence(5),
		Description: gofakeit.Sentence(14),
		Tags:        datatypes.JSON(tagsBytes),
		Status:      gofakeit.RandomString(fakeStatuses),
		Priority:    gofakeit.RandomString(fakePriorities),
		Type:        gofakeit.RandomString(fakeTypes),
		DueDate:     &dueDate,
		CreatedAt:   createdAt,
		UpdatedAt:   createdAt,
	}
}

func NewFakeTasks(userIDs []uint, count int) []Task {
	if len(userIDs) == 0 || count <= 0 {
		return nil
	}

	tasks := make([]Task, 0, count)
	for i := 0; i < count; i++ {
		userID := userIDs[i%len(userIDs)]
		tasks = append(tasks, NewFakeTask(userID))
	}

	return tasks
}
