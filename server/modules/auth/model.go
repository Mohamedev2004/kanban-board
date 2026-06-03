package auth

import (
	"time"

	"gorm.io/gorm"
)

// Role is a flat, fixed set: "admin" or "user". There is no relationship
// between an admin and a user — they are two independent role types.
type Role struct {
	ID   uint   `json:"id" gorm:"primaryKey"`
	Name string `json:"name" gorm:"size:50;not null;uniqueIndex"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type User struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Username  string         `json:"username" gorm:"size:100;not null"`
	Email     string         `json:"email" gorm:"size:150;not null;uniqueIndex"`
	Password  string         `json:"-" gorm:"size:255;not null"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
	Tokens    []Token        `json:"-" gorm:"foreignKey:UserID"`

	Roles []Role `json:"-" gorm:"many2many:user_roles"`
}

type Token struct {
	ID uint `json:"id" gorm:"primaryKey"`
	// This index helps the AuthMiddleware look up tokens quickly.
	Token  string `json:"token" gorm:"size:255;not null;index:idx_token_lookup"`
	UserID uint   `json:"user_id" gorm:"not null"`
	Type   string `json:"type" gorm:"size:50;not null;index:idx_token_lookup"`

	ExpiresAt time.Time `json:"expires_at" gorm:"not null;index:idx_token_lookup;index:idx_expires_at"`

	CreatedAt time.Time `json:"created_at"`
}

type UserRole struct {
	ID uint `json:"id" gorm:"primaryKey"`

	UserID uint `json:"user_id" gorm:"not null;index:idx_user_role,unique"`
	RoleID uint `json:"role_id" gorm:"not null;index:idx_user_role,unique"`

	CreatedAt time.Time `json:"created_at"`

	User User `json:"-" gorm:"foreignKey:UserID"`
	Role Role `json:"-" gorm:"foreignKey:RoleID"`
}
