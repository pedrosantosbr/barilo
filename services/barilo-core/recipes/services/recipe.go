package services

type ChatBotClientable interface {
	Prompt(content string) (chan string, chan error)
}

type Recipe struct {
	cb ChatBotClientable
}

func NewRecipe(chatBot ChatBotClientable) *Recipe {
	return &Recipe{
		cb: chatBot,
	}
}

func (this *Recipe) List(text string) (chan string, error) {
	return nil, nil
}
