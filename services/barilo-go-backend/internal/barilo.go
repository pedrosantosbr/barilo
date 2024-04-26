package internal

// Event structure to define an SSE event
type Event struct {
	ID    string
	Event string
	Data  string
}
