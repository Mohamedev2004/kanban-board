package auth

import "github.com/brianvoe/gofakeit/v7"

func NewFakeUser() User {
	return User{
		Username: gofakeit.Username(),
		Email:    gofakeit.Email(),
		Password: "password", // plain — will be hashed in the seeder
	}
}

func NewFakeUsers(count int) []User {
	users := make([]User, 0, count)
	for i := 0; i < count; i++ {
		users = append(users, NewFakeUser())
	}
	return users
}
