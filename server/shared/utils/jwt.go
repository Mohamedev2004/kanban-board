package utils

import (
	"errors"
	"kanban/config"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type Claims struct {
	UserID    uint     `json:"user_id"`
	Roles     []string `json:"roles"`
	TokenType string   `json:"token_type"`
	jwt.RegisteredClaims
}

func getJWTSecret() []byte {
	return []byte(config.Cfg.JWT.Secret)
}

func GetAccessTokenExpiry() time.Duration {
	return time.Duration(config.Cfg.JWT.AccessExpiryMinutes) * time.Minute
}

func GetRefreshTokenExpiry() time.Duration {
	return time.Duration(config.Cfg.JWT.RefreshExpiryDays) * 24 * time.Hour
}

func GenerateJWT(userID uint, roles []string, tokenType string, expiry time.Duration) (string, error) {
	now := time.Now()

	claims := Claims{
		UserID:    userID,
		Roles:     roles,
		TokenType: tokenType,
		RegisteredClaims: jwt.RegisteredClaims{
			ID:        uuid.NewString(),
			ExpiresAt: jwt.NewNumericDate(now.Add(expiry)),
			IssuedAt:  jwt.NewNumericDate(now),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(getJWTSecret())
}

func ParseJWT(tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		// Ensure signing method is HMAC
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return getJWTSecret(), nil
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}
