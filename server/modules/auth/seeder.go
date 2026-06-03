package auth

import (
	"errors"

	"server/shared/utils"

	"gorm.io/gorm"
)

// SeedUsers ensures the fixed role set exists and provisions the default
// admin (and a demo user) if they are missing.
func SeedUsers(db *gorm.DB, _ int) error {
	roleNames := []string{RoleAdmin, RoleUser}
	rolesByName := make(map[string]Role, len(roleNames))
	for _, name := range roleNames {
		role := Role{Name: name}
		if err := db.Where("name = ?", name).FirstOrCreate(&role).Error; err != nil {
			return err
		}
		rolesByName[name] = role
	}

	ensureUser := func(username, email, plainPassword string) (User, error) {
		var user User
		if err := db.Where("email = ?", email).First(&user).Error; err == nil {
			return user, nil
		} else if !errors.Is(err, gorm.ErrRecordNotFound) {
			return User{}, err
		}

		hashed, err := utils.HashPassword(plainPassword)
		if err != nil {
			return User{}, err
		}

		user = User{Username: username, Email: email, Password: hashed}
		if err := db.Create(&user).Error; err != nil {
			return User{}, err
		}
		return user, nil
	}

	ensureUserRole := func(userID, roleID uint) error {
		return db.FirstOrCreate(
			&UserRole{UserID: userID, RoleID: roleID},
			UserRole{UserID: userID, RoleID: roleID},
		).Error
	}

	admin, err := ensureUser("admin", "admin@app.com", "Admin2025!")
	if err != nil {
		return err
	}
	if err := ensureUserRole(admin.ID, rolesByName[RoleAdmin].ID); err != nil {
		return err
	}

	user, err := ensureUser("user", "user@app.com", "User2025!")
	if err != nil {
		return err
	}
	if err := ensureUserRole(user.ID, rolesByName[RoleUser].ID); err != nil {
		return err
	}

	return nil
}
