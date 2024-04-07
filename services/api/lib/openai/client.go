package openai

import (
	"api/lib/logger"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const defaultTimeout = 60 * time.Second

var chatGptBaseUrl = "https://api.openai.com"

type Client struct {
	apiKey     string
	baseUrl    string
	HTTPClient *http.Client
}

func NewClient(apiKey string) *Client {
	return &Client{
		apiKey:  apiKey,
		baseUrl: chatGptBaseUrl,
		HTTPClient: &http.Client{
			Timeout: defaultTimeout,
		},
	}
}

func (c *Client) Message(ctx context.Context, text string) (string, error) {
	l := logger.FromContext(ctx)

	requestURL := fmt.Sprintf("%s/v1/chat/completions", c.baseUrl)

	req, err := http.NewRequestWithContext(ctx, "POST", requestURL, nil)
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json; charset=utf-8")
	req.Header.Set("Authorization", "Bearer "+c.apiKey)

	chatGptRequest := GPTRequest{
		Model: "gpt-3.5-turbo",
		Messages: []Message{
			{
				Role:    "system",
				Content: systemPrompt,
			},
			{
				Role:    "user",
				Content: fmt.Sprintf("%s \n Ingredientes: \n %s", userPrompt, text),
			},
		},
		Temperature:      1,
		MaxTokens:        512,
		TopP:             1,
		FrequencyPenalty: 0,
		PresencePenalty:  0,
	}

	data, err := json.Marshal(chatGptRequest)
	if err != nil {
		return "", err
	}

	req.Body = io.NopCloser(bytes.NewBuffer(data))

	res, err := c.HTTPClient.Do(req)
	if err != nil {
		// TODO: log error
		// TODO: improve error handling
		return "", err
	}

	defer res.Body.Close()

	l.Info("Success requested to OpenAI")

	body, err := io.ReadAll(res.Body)
	if err != nil {
		// TODO: log error
		// TODO: improve error handling
		return "", err
	}

	if res.StatusCode != http.StatusOK {
		if len(body) > 0 {
			var e OpenAIErrorResponse
			err = json.Unmarshal(body, &e)
			if err != nil {
				return "", err
			}
			return "", fmt.Errorf("Error: %s", e.Message)
		}
	}

	var chatGptResponse GPTResponse
	if err = json.Unmarshal(body, &chatGptResponse); err != nil {
		// TODO: log error
		// TODO: improve error handling
		return "", err
	}

	return chatGptResponse.Choices[0].Message.Content, nil
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type Choice struct {
	Index   int     `json:"index"`
	Message Message `json:"message"`
}

type GPTRequest struct {
	Model            string    `json:"model"`
	Messages         []Message `json:"messages"`
	Temperature      float64   `json:"temperature"`
	MaxTokens        int       `json:"max_tokens"`
	TopP             float64   `json:"top_p"`
	FrequencyPenalty float64   `json:"frequency_penalty"`
	PresencePenalty  float64   `json:"presence_penalty"`
}

type GPTResponse struct {
	Choices []Choice `json:"choices"`
}

type OpenAIErrorResponse struct {
	Message string  `json:"message"`
	Code    string  `json:"code"`
	Type    string  `json:"type"`
	Param   *string `json:"param"`
}

func (e *OpenAIErrorResponse) Error() string {
	return e.Message
}
