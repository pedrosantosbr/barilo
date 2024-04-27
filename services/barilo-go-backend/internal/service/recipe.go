package service

import (
	"context"
)

type TextGenerator interface {
	GenerateCompletions(ctx context.Context, message string) (<-chan []byte, <-chan error, error)
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
	gtw PromptGateway
}

// NewRecipe creates a new Recipe service
func NewRecipe(tg TextGenerator, ig ImageGenerator) *Recipe {
	gtw := struct {
		TextGenerator
		ImageGenerator
	}{tg, ig}

	return &Recipe{
		gtw: gtw,
	}
}

func (s *Recipe) GetRecipes(ctx context.Context, ingredients string) (<-chan []byte, <-chan error, error) {
	outc, errc, err := s.gtw.GenerateCompletions(ctx, ingredients)
	return outc, errc, err
}
