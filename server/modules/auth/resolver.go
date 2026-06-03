package auth

import (
	"context"

	"gorm.io/gorm"
)

type UserResolver struct {
	db *gorm.DB
}

func NewUserResolver(db *gorm.DB) *UserResolver {
	return &UserResolver{db: db}
}

func (r *UserResolver) UserIDsByRole(ctx context.Context, roles []string) ([]uint, error) {
	var userIDs []uint
	err := r.db.WithContext(ctx).
		Table("user_roles").
		Select("user_roles.user_id").
		Joins("JOIN roles ON roles.id = user_roles.role_id").
		Where("roles.name IN ?", roles).
		Distinct().
		Pluck("user_roles.user_id", &userIDs).Error
	return userIDs, err
}

func (r *UserResolver) UserEmailByID(ctx context.Context, userID uint) (string, error) {
	var email string
	err := r.db.WithContext(ctx).
		Model(&User{}).
		Where("id = ?", userID).
		Pluck("email", &email).Error
	return email, err
}
