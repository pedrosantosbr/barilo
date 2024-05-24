package internal

import (
	"fmt"
	"regexp"
	"time"
)

// Phone number regular expression (allows international format and optional extension)
var phoneNumberRegex = regexp.MustCompile(`^\+\d{1,3}\s?\d{4,14}(?:x.+)?$`)

type PhoneNumber struct {
	number string
}

// String returns the string representation of the PhoneNumber
func (pn *PhoneNumber) String() string {
	return pn.number
}

// Equals checks if two PhoneNumber objects are equal
func (pn *PhoneNumber) Equals(other *PhoneNumber) bool {
	if other == nil {
		return false
	}
	return pn.number == other.number
}

// IsValid checks if the phone number is valid
func (pn *PhoneNumber) IsValid() bool {
	return phoneNumberRegex.MatchString(pn.number)
}

// NewPhoneNumber creates a new PhoneNumber object after validating the input
func NewPhoneNumber(number string) (*PhoneNumber, error) {
	// Normalize the input
	number = normalizeString(number)

	if !phoneNumberRegex.MatchString(number) {
		return nil, fmt.Errorf("invalid phone number format")
	}

	return &PhoneNumber{number: number}, nil
}

// normalizeString removes leading and trailing spaces from a string
func normalizeString(s string) string {
	return regexp.MustCompile(`^\s+|\s+$`).ReplaceAllString(s, "")
}

type User struct {
	ID          string
	Name        string
	PhoneNumber PhoneNumber
	CreatedAt   time.Time
	UpdatedAt   time.Time
}
