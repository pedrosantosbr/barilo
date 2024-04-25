package openai

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

// OpenAI's chat completion endpoint
const openaiEndpoint = "https://api.openai.com/v1/chat/completions"

// A struct to represent the chat message request
type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// A struct to represent the chat completion request
type ChatCompletionRequest struct {
	Model    string        `json:"model"`
	Messages []ChatMessage `json:"messages"`
	Stream   bool          `json:"stream"`
}

func NewChatCompletionRequest(apiKey string, chatRequest *ChatCompletionRequest) (*http.Request, error) {
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

// Handling streaming responses
func HandleStreamResponse(ctx context.Context, resp *http.Response) (<-chan []byte, <-chan error) {
	reader := bufio.NewReader(resp.Body)

	chanErr := make(chan error)
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
				chanErr <- err
				return
			}

			if len(line) == 0 {
				break
			}

			lineStr := strings.TrimSpace(string(line))

			if !strings.HasPrefix(lineStr, "data: ") {
				continue
			}

			lineStr = strings.TrimPrefix(lineStr, "data: ")
			if lineStr == "[DONE]" {
				break
			}

			var response map[string]interface{}
			if err := json.Unmarshal([]byte(lineStr), &response); err != nil {
				chanErr <- err
				break
			}

			choices, ok := response["choices"].([]interface{})
			if !ok {
				chanErr <- fmt.Errorf("failed to parse choices")
				break
			}

			for _, choice := range choices {
				content, ok := choice.(map[string]interface{})["delta"].(map[string]interface{})["content"].(string)
				if ok {
					chanOut <- []byte(content)
				}
			}
		}
	}()

	return chanOut, chanErr
}
