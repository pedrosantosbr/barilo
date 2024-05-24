package openai

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
)

// OpenAI's chat completion endpoint
const openaiEndpoint = "https://api.openai.com/v1/chat/completions"

// A struct to represent the chat message request
type chatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// A struct to represent the chat completion request
type chatCompletionRequest struct {
	Model    string        `json:"model"`
	Messages []chatMessage `json:"messages"`
	Stream   bool          `json:"stream"`
}

type APIError struct {
	Error string `json:"error"`
}

type OpenAIClient struct {
	apiKey string
}

func NewOpenAIClient(apiKey string) *OpenAIClient {
	return &OpenAIClient{apiKey: apiKey}
}

// Handling streaming responses
func (o *OpenAIClient) HandleStreamResponse(ctx context.Context, message string) (<-chan []byte, <-chan error, error) {
	chanErr := make(chan error)

	req, err := newChatCompletionRequest(o.apiKey, &chatCompletionRequest{
		Model: "gpt-3.5-turbo-0125",
		Messages: []chatMessage{
			{
				Role:    "system",
				Content: "You are a helpful assistant.",
			},
			{
				Role:    "user",
				Content: "What is the recipe for a cake?",
			},
		},
		Stream: true,
	})
	if err != nil {
		return nil, nil, err
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, nil, err
	}

	// TODO: Handle error response
	if resp.StatusCode != http.StatusOK {
		return nil, nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	reader := bufio.NewReader(resp.Body)

	chanOut := make(chan []byte)

	go func() {
		defer func() {
			resp.Body.Close()
			close(chanOut)
			close(chanErr)
		}()

		for {
			line, err := reader.ReadBytes('\n')
			if err != nil {
				if err.Error() == "EOF" {
					return
				}

				chanErr <- err
				return
			}

			if len(line) == 0 {
				return
			}

			chanOut <- line
		}
	}()

	return chanOut, chanErr, nil
}

func newChatCompletionRequest(apiKey string, chatRequest *chatCompletionRequest) (*http.Request, error) {
	body, err := json.Marshal(chatRequest)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", openaiEndpoint, bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiKey))
	req.Header.Set("Content-Type", "application/json")

	return req, nil
}
