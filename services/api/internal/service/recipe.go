package service

import (
	"api/internal"
	"api/lib/logger"
	"context"
	"fmt"
	"strings"
)

// ChatBot ...
type ChatBot interface {
	Message(ctx context.Context, text string) (string, error)
}

type Recipe struct {
	cb ChatBot
}

// NewReceipt...
func NewReceipt(chatBot ChatBot) *Recipe {
	return &Recipe{
		cb: chatBot,
	}
}

// SuggestRecipes ...
func (r *Recipe) SuggestRecipes(ctx context.Context, params internal.SuggestRecipesParams) (string, error) {
	l := logger.FromContext(ctx)

	text := strings.TrimSpace(params.Ingredients)
	res, err := r.cb.Message(ctx, text)
	if err != nil {
		l.Info(fmt.Sprintf("Error suggesting recipes for ingredients: %s", text))
		return "", err
	}

	return res, nil
}
