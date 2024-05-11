package openai

import (
	"context"

	libopenai "github.com/pedrosantosbr/barilo/lib/openai"
)

// Implementation of ChatBot interface...
type OpenAITextGenerator struct {
	client *libopenai.OpenAIClient
}

// NewOpenAITextGenerator creates a new OpenAITextGenerator
func NewOpenAITextGenerator(client *libopenai.OpenAIClient) *OpenAITextGenerator {
	return &OpenAITextGenerator{client: client}
}

// GetCompletions returns a channel of bytes and a channel of errors
func (c *OpenAITextGenerator) GenerateCompletions(ctx context.Context, message string) (<-chan []byte, <-chan error, error) {
	return c.client.HandleStreamResponse(ctx, message)
}
