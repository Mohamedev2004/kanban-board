package setup

import (
	"kanban/modules/auth"
	"kanban/modules/notifications"
	"kanban/modules/notifications/delivery"
	"kanban/shared/database"
	"kanban/shared/types"

	"github.com/ThreeDotsLabs/watermill/message"
	"github.com/ThreeDotsLabs/watermill/pubsub/gochannel"
)

func RegisterNotifications(router *message.Router, pubSub *gochannel.GoChannel) {
	notifService := notifications.NewService(
		notifications.NewRepository(database.MainDB),
		auth.NewUserResolver(database.MainDB),
		[]delivery.Dispatcher{
			delivery.NewInAppDispatcher(database.MainDB),
			delivery.NewEmailDispatcher(),
		},
		pubSub,
	)

	router.AddNoPublisherHandler(
		"notification_dispatcher",
		types.NotificationTopic,
		pubSub,
		notifications.NewSubscriber(notifService).ProcessNotificationEvent,
	)
}
