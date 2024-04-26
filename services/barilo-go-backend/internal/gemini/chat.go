package gemini

import (
	"context"
)

// Implementation of ChatBot interface...
type GeminiAIChatBot struct{}

// GetCompletions returns a channel of bytes and a channel of errors
func (c *GeminiAIChatBot) GetCompletions(ctx context.Context, message string) (<-chan []byte, <-chan error) {
	outc, errc := make(chan []byte), make(chan error)
	defer close(outc)
	defer close(errc)

	return outc, errc
}
