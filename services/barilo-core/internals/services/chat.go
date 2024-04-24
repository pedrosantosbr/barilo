package services

type ChatCompletionsClient interface {
	Prompt(content string) (chan string, chan error)
}

type Chat struct {
	chat ChatCompletionsClient
}

func NewChat(c ChatCompletionsClient) *Chat {
	return &Chat{
		chat: c,
	}
}

func (this *Chat) GetRecipes(text string) (chan string, error) {
	return nil, nil
}
