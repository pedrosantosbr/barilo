package service

import (
	"context"
)

type TextGenerator interface {
	GenerateCompletions(ctx context.Context, messages string) (<-chan []byte, <-chan error)
}

type ImageGenerator interface {
	GenerateImage(ctx context.Context, message string) (string, error)
}

type PromptGateway interface {
	TextGenerator
	ImageGenerator
}

// Service is a struct that defines the service
type Recipe struct {
	pg PromptGateway
}

// NewRecipe creates a new Recipe service
func NewRecipe() *Recipe {
	return &Recipe{}
}

func (s *Recipe) GetRecipes(_ context.Context, ingredients string) (<-chan []byte, <-chan error, error) {
	outc, errc := s.pg.GenerateCompletions(context.Background(), ingredients)
	return outc, errc, nil
}
