package service

import (
	"context"
	"fmt"
)

// Service is a struct that defines the service
type Recipe struct{}

// NewRecipe creates a new Recipe service
func NewRecipe() *Recipe {
	return &Recipe{}
}

func (s *Recipe) GetRecipes(_ context.Context, ingredients string) (<-chan []byte, <-chan error, error) {
	outc := make(chan []byte)
	errc := make(chan error)

	go func() {
		defer close(outc)
		defer close(errc)

		eventId := 1
		for i := 0; i < 10; i++ {
			outc <- []byte(fmt.Sprintf("Event %d: %s", eventId, ingredients))
			eventId++
		}
		outc <- []byte("[DONE]")
	}()

	return outc, errc, nil
}
