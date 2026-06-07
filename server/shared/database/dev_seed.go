package database

import (
	"log"

	"kanban/modules/auth"
	"kanban/modules/notifications"
	"kanban/modules/tasks"
	"kanban/shared/utils"

	"gorm.io/gorm"
)

// SeedDev wipes and repopulates the database with a predictable set of
// accounts for local development: one admin and a handful of users, each with
// some demo notifications.
func SeedDev(db *gorm.DB) {
	log.Println("→ Seeding roles...")
	roles := devSeedRoles(db)

	log.Println("→ Creating admin...")
	admin := devCreateUser(db, "admin", "admin@app.com", "Admin2025!")
	devAssignRole(db, admin.ID, roles[auth.RoleAdmin].ID)

	log.Println("→ Creating users...")
	userDefs := []struct{ username, email string }{
		{"alice", "alice@app.com"},
		{"bob", "bob@app.com"},
		{"carol", "carol@app.com"},
	}
	for _, d := range userDefs {
		u := devCreateUser(db, d.username, d.email, "User2025!")
		devAssignRole(db, u.ID, roles[auth.RoleUser].ID)
	}

	log.Println("→ Seeding notifications...")
	if err := notifications.SeedNotifications(db, 30); err != nil {
		log.Fatalf("failed to seed notifications: %v", err)
	}

	log.Println("→ Seeding tasks...")
	if err := tasks.SeedTasks(db, 12); err != nil {
		log.Fatalf("failed to seed tasks: %v", err)
	}

	log.Println("")
	log.Println("✓ Dev seed complete.")
	log.Println("")
	log.Println("  Credentials")
	log.Println("  Admin:  admin@app.com / Admin2025!")
	log.Println("  Users:  alice@app.com, bob@app.com, carol@app.com / User2025!")
}

func devSeedRoles(db *gorm.DB) map[string]auth.Role {
	names := []string{auth.RoleAdmin, auth.RoleUser}
	out := make(map[string]auth.Role, len(names))
	for _, name := range names {
		r := auth.Role{Name: name}
		if err := db.Where("name = ?", name).FirstOrCreate(&r).Error; err != nil {
			log.Fatalf("failed to seed role %s: %v", name, err)
		}
		out[name] = r
	}
	return out
}

func devCreateUser(db *gorm.DB, username, email, password string) auth.User {
	hashed, err := utils.HashPassword(password)
	if err != nil {
		log.Fatalf("failed to hash password for %s: %v", email, err)
	}
	u := auth.User{Username: username, Email: email, Password: hashed}
	if err := db.Create(&u).Error; err != nil {
		log.Fatalf("failed to create user %s: %v", email, err)
	}
	return u
}

func devAssignRole(db *gorm.DB, userID, roleID uint) {
	ur := auth.UserRole{UserID: userID, RoleID: roleID}
	if err := db.Create(&ur).Error; err != nil {
		log.Fatalf("failed to assign role (user=%d role=%d): %v", userID, roleID, err)
	}
}
