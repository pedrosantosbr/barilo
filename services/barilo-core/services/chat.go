package services

type Clientable interface {
	Message(content string) (string, error)
}

type Chat struct {
	client Clientable
}

func NewChat(c Clientable) *Chat {
	return &Chat{
		client: c,
	}
}

func (this *Chat) GetRecipes(text string) (string, error) {
	recipes, err := this.client.Message(text)
	if err != nil {
		return "", err
	}
	return recipes, nil
}
