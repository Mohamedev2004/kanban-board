package delivery

import (
	"context"
	"server/shared/types"
)

type Dispatcher interface {
	Channel() types.NotificationChannel
	Send(ctx context.Context, userID uint, email string, event *types.NotificationEvent) error
}
