// shared/utils/validation.go
package utils

import (
	"errors"

	"github.com/go-playground/validator/v10"
)

func FormatValidationErrors(err error) map[string]string {
	errors := make(map[string]string)

	var ve validator.ValidationErrors
	if errorsAsValidationErrors(err, &ve) {
		for _, fe := range ve {
			field := jsonFieldName(fe)

			switch fe.Tag() {
			case "required":
				errors[field] = "validation.required"

			case "email":
				errors[field] = "validation.email"

			case "min":
				errors[field] = "validation.min"

			case "max":
				errors[field] = "validation.max"

			case "len":
				errors[field] = "validation.len"

			default:
				errors[field] = "validation.invalid"
			}
		}
	}

	return errors
}

func errorsAsValidationErrors(err error, target *validator.ValidationErrors) bool {
	if errors.As(err, target) {
		return true
	}

	type unwrapper interface {
		Unwrap() []error
	}

	var multi unwrapper
	if errors.As(err, &multi) {
		for _, nestedErr := range multi.Unwrap() {
			if errorsAsValidationErrors(nestedErr, target) {
				return true
			}
		}
	}

	return false
}

// jsonFieldName returns the field key to use in API error responses.
// With RegisterTagNameFunc registered in main, fe.Field() already returns
// the JSON tag value (e.g. "first_name", "currentPassword").
func jsonFieldName(fe validator.FieldError) string {
	return fe.Field()
}
