package openai

import (
	"api/lib/logger"
	"context"
	"fmt"
)

type Clientable interface {
	Message(ctx context.Context, text string) (string, error)
}

// ChatGptBot ...
// This is an API resource that execute some prompts
type ChatGptBot struct {
	cli Clientable
}

// NewOpenAIChatBotImpl ...
func NewOpenAIChatBotImpl(cli Clientable) *ChatGptBot {
	return &ChatGptBot{
		cli: cli,
	}
}

func (c *ChatGptBot) Message(ctx context.Context, text string) (string, error) {
	l := logger.FromContext(ctx)

	msg, err := c.cli.Message(ctx, text)
	if err != nil {
		l.Info(fmt.Sprintf("Error suggesting recipes for ingredients: %s", text))
		return "", err
	}
	return msg, nil
}
