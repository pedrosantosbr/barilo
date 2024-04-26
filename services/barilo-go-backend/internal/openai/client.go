package openai

import (
	libopenai "barilo/lib/openai"
	"context"
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
func (c *OpenAITextGenerator) GetCompletions(ctx context.Context, message string) (<-chan []byte, <-chan error) {
	return c.client.HandleStreamResponse(ctx, message)
}
