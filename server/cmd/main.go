package main

import (
	"context"
	"kanban/config"
	"kanban/routes"
	"kanban/schedules"
	"kanban/setup"
	"kanban/shared/database"
	"log"
	"reflect"
	"strings"

	"github.com/ThreeDotsLabs/watermill"
	"github.com/ThreeDotsLabs/watermill/message"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"
)

func init() {
	// Make Gin's validator use JSON tag names in field errors so that
	// FormatValidationErrors returns keys like "first_name" and "currentPassword"
	// instead of raw struct field names like "FirstName" / "CurrentPassword".
	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		v.RegisterTagNameFunc(func(fld reflect.StructField) string {
			name := strings.SplitN(fld.Tag.Get("json"), ",", 2)[0]
			if name == "" || name == "-" {
				return fld.Name
			}
			return name
		})
	}
}

func main() {
	config.Load()
	database.Connect()
	database.Migrate()

	pubSub := setup.EventBus()
	schedules.StartAll(database.MainDB, pubSub)

	// Build the Watermill router
	watermillRouter, err := message.NewRouter(message.RouterConfig{}, watermill.NewStdLogger(false, false))
	if err != nil {
		log.Fatal(err)
	}

	// Register ALL event handlers here (single source of truth). EventBus()
	// only wires the audit-log writer; everything else is registered below so
	// each handler subscribes to the shared pub/sub exactly once.
	setup.RegisterEmails(watermillRouter, pubSub)
	setup.RegisterNotifications(watermillRouter, pubSub)

	// Run the router in the background
	go func() {
		if err := watermillRouter.Run(context.Background()); err != nil {
			log.Fatal(err)
		}
	}()

	r := gin.Default()
	routes.Register(r, database.MainDB, pubSub)
	r.Run(":" + config.Cfg.Server.Port)
}
