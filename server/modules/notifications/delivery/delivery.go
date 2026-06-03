package delivery

import (
	"server/shared/types"
	"context"
)

type Dispatcher interface {
	Channel() types.NotificationChannel
	Send(ctx context.Context, userID uint, email string, event *types.NotificationEvent) error
}
